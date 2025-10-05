from rest_framework import generics, status, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    EventCategory, Event, EventParticipant, EventResource, 
    EventPhoto, EventComment, EventReport
)
from .serializers import (
    EventCategorySerializer, EventListSerializer, EventDetailSerializer,
    EventCreateUpdateSerializer, EventParticipantSerializer, EventParticipantCreateSerializer,
    EventParticipantUpdateSerializer, EventPhotoSerializer, EventPhotoCreateSerializer,
    EventCommentSerializer, EventCommentCreateSerializer, EventResourceSerializer,
    EventResourceCreateUpdateSerializer, EventReportSerializer, EventReportCreateUpdateSerializer
)


class EventCategoryListView(generics.ListAPIView):
    """Lista todas as categorias de eventos"""
    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet para eventos"""
    queryset = Event.objects.select_related('category', 'organizer').prefetch_related('participants')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'city', 'state', 'is_public']
    search_fields = ['title', 'description', 'address', 'city']
    ordering_fields = ['start_date', 'created_at', 'participants_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EventCreateUpdateSerializer
        elif self.action == 'retrieve':
            return EventDetailSerializer
        return EventListSerializer
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtrar por status ativo por padrão
        status_filter = self.request.query_params.get('status')
        if not status_filter:
            queryset = queryset.filter(status='published')
        
        # Filtrar por data
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(start_date__lte=end_date)
        
        # Filtrar por proximidade (requer latitude e longitude)
        lat = self.request.query_params.get('latitude')
        lng = self.request.query_params.get('longitude')
        radius = self.request.query_params.get('radius', 10)  # km
        
        if lat and lng:
            # Implementar filtro por proximidade usando PostGIS
            # Por enquanto, retornar todos os eventos
            pass
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Inscrever-se em um evento"""
        event = self.get_object()
        
        # Verificar se o usuário já está inscrito
        if EventParticipant.objects.filter(event=event, user=request.user).exists():
            return Response({'error': 'Você já está inscrito neste evento'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar se há vagas disponíveis
        if event.participants_count >= event.max_participants:
            return Response({'error': 'Não há vagas disponíveis'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar se as inscrições ainda estão abertas
        if not event.is_registration_open:
            return Response({'error': 'As inscrições estão encerradas'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Criar participação
        participant = EventParticipant.objects.create(
            event=event,
            user=request.user,
            status='confirmed' if not event.requires_approval else 'pending'
        )
        
        serializer = EventParticipantSerializer(participant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Cancelar inscrição em um evento"""
        event = self.get_object()
        
        try:
            participant = EventParticipant.objects.get(event=event, user=request.user)
        except EventParticipant.DoesNotExist:
            return Response({'error': 'Você não está inscrito neste evento'}, status=status.HTTP_404_NOT_FOUND)
        
        participant.status = 'cancelled'
        participant.save()
        
        return Response({'message': 'Inscrição cancelada com sucesso'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Fazer check-in em um evento"""
        event = self.get_object()
        
        try:
            participant = EventParticipant.objects.get(event=event, user=request.user)
        except EventParticipant.DoesNotExist:
            return Response({'error': 'Você não está inscrito neste evento'}, status=status.HTTP_404_NOT_FOUND)
        
        if participant.status != 'confirmed':
            return Response({'error': 'Sua participação não foi confirmada'}, status=status.HTTP_400_BAD_REQUEST)
        
        if participant.checked_in:
            return Response({'error': 'Você já fez check-in neste evento'}, status=status.HTTP_400_BAD_REQUEST)
        
        participant.checked_in = True
        participant.check_in_time = timezone.now()
        participant.save()
        
        return Response({'message': 'Check-in realizado com sucesso'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Estatísticas de um evento"""
        event = self.get_object()
        
        stats = {
            'total_participants': event.participants_count,
            'confirmed_participants': event.participants.filter(status='confirmed').count(),
            'pending_participants': event.participants.filter(status='pending').count(),
            'checked_in_participants': event.participants.filter(checked_in=True).count(),
            'available_spots': event.available_spots,
            'photos_count': event.photos.count(),
            'comments_count': event.comments.count(),
            'resources_count': event.resources.count(),
            'fully_provided_resources': event.resources.filter(
                quantity_provided__gte=models.F('quantity_needed')
            ).count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def my_events(self, request):
        """Lista eventos do usuário (organizados e participando)"""
        user = request.user
        
        # Eventos organizados
        organized_events = Event.objects.filter(organizer=user).select_related('category')
        
        # Eventos participando
        participating_events = Event.objects.filter(
            participants__user=user,
            participants__status__in=['confirmed', 'pending']
        ).select_related('category')
        
        organized_serializer = EventListSerializer(organized_events, many=True)
        participating_serializer = EventListSerializer(participating_events, many=True)
        
        return Response({
            'organized': organized_serializer.data,
            'participating': participating_serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Lista eventos próximos ao usuário"""
        lat = request.query_params.get('latitude')
        lng = request.query_params.get('longitude')
        radius = float(request.query_params.get('radius', 10))  # km
        
        if not lat or not lng:
            return Response({'error': 'Latitude e longitude são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Por enquanto, retornar todos os eventos ativos
        # Em produção, implementar filtro por proximidade usando PostGIS
        events = Event.objects.filter(
            status='published',
            start_date__gte=timezone.now()
        ).select_related('category', 'organizer')
        
        serializer = EventListSerializer(events, many=True)
        return Response(serializer.data)




class EventParticipantListView(generics.ListCreateAPIView):
    """Lista e cria participantes de eventos"""
    serializer_class = EventParticipantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return EventParticipant.objects.filter(event_id=event_id).select_related('user')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventParticipantCreateSerializer
        return EventParticipantSerializer
    
    def perform_create(self, serializer):
        event = Event.objects.get(id=self.kwargs['event_id'])
        serializer.save(
            event=event,
            user=self.request.user,
            context={'event': event, 'user': self.request.user}
        )


class EventParticipantDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalhes, atualização e exclusão de participantes"""
    serializer_class = EventParticipantUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return EventParticipant.objects.filter(event_id=event_id)
    
    def get_object(self):
        event_id = self.kwargs['event_id']
        participant_id = self.kwargs['pk']
        return EventParticipant.objects.get(event_id=event_id, id=participant_id)


class EventPhotoListView(generics.ListCreateAPIView):
    """Lista e cria fotos de eventos"""
    serializer_class = EventPhotoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return EventPhoto.objects.filter(event_id=event_id).select_related('user')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventPhotoCreateSerializer
        return EventPhotoSerializer
    
    def perform_create(self, serializer):
        event = Event.objects.get(id=self.kwargs['event_id'])
        serializer.save(event=event, user=self.request.user)


class EventCommentListView(generics.ListCreateAPIView):
    """Lista e cria comentários de eventos"""
    serializer_class = EventCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return EventComment.objects.filter(event_id=event_id, parent=None).select_related('user')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCommentCreateSerializer
        return EventCommentSerializer
    
    def perform_create(self, serializer):
        event = Event.objects.get(id=self.kwargs['event_id'])
        serializer.save(event=event, user=self.request.user)


class EventResourceListView(generics.ListCreateAPIView):
    """Lista e cria recursos de eventos"""
    serializer_class = EventResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return EventResource.objects.filter(event_id=event_id)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventResourceCreateUpdateSerializer
        return EventResourceSerializer
    
    def perform_create(self, serializer):
        event = Event.objects.get(id=self.kwargs['event_id'])
        serializer.save(event=event)


class EventResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalhes, atualização e exclusão de recursos"""
    serializer_class = EventResourceCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return EventResource.objects.filter(event_id=event_id)


class EventReportView(APIView):
    """Criar, visualizar e atualizar relatório pós-evento"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, event_id):
        """Obter relatório de um evento"""
        try:
            report = EventReport.objects.get(event_id=event_id)
            serializer = EventReportSerializer(report)
            return Response(serializer.data)
        except EventReport.DoesNotExist:
            return Response({'error': 'Relatório não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, event_id):
        """Criar relatório de um evento"""
        try:
            event = Event.objects.get(id=event_id)
        except Event.DoesNotExist:
            return Response({'error': 'Evento não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar se o usuário é o organizador
        if event.organizer != request.user:
            return Response({'error': 'Apenas o organizador pode criar o relatório'}, status=status.HTTP_403_FORBIDDEN)
        
        # Verificar se já existe um relatório para este evento
        if EventReport.objects.filter(event=event).exists():
            return Response({'error': 'Já existe um relatório para este evento'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = EventReportCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(event=event, created_by=request.user)
            return Response(EventReportSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, event_id):
        """Atualizar relatório de um evento"""
        try:
            report = EventReport.objects.get(event_id=event_id)
        except EventReport.DoesNotExist:
            return Response({'error': 'Relatório não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar se o usuário é o organizador ou criador do relatório
        if report.event.organizer != request.user and report.created_by != request.user:
            return Response({'error': 'Você não tem permissão para atualizar este relatório'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = EventReportCreateUpdateSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(EventReportSerializer(serializer.instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

