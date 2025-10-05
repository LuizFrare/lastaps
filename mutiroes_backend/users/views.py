from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db.models import Q, Count
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import datetime, timedelta

from .models import (
    UserProfile, UserBadge, UserBadgeEarned, UserSkill, 
    UserSkillLevel, UserAvailability, UserNotificationSettings
)
from .serializers import (
    UserRegistrationSerializer, UserSerializer, UserProfileSerializer,
    UserProfileUpdateSerializer, UserBadgeSerializer, UserBadgeEarnedSerializer,
    UserSkillSerializer, UserSkillLevelSerializer, UserSkillLevelCreateUpdateSerializer,
    UserAvailabilitySerializer, UserAvailabilityCreateUpdateSerializer,
    UserNotificationSettingsSerializer, UserStatsSerializer, UserPublicProfileSerializer,
    PasswordChangeSerializer, UserSearchSerializer
)


@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    """Registro de novos usuários"""
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Perfil do usuário atual"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class UserProfileUpdateView(generics.UpdateAPIView):
    """Atualização do perfil do usuário"""
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class UserPublicProfileView(generics.RetrieveAPIView):
    """Perfil público de um usuário"""
    serializer_class = UserPublicProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'user__username'
    
    def get_queryset(self):
        return UserProfile.objects.filter(is_public_profile=True)


class UserBadgeListView(generics.ListAPIView):
    """Lista todos os badges disponíveis"""
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class UserBadgeEarnedListView(generics.ListAPIView):
    """Lista badges conquistados pelo usuário"""
    serializer_class = UserBadgeEarnedSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserBadgeEarned.objects.filter(user=self.request.user)


class UserSkillListView(generics.ListAPIView):
    """Lista todas as habilidades disponíveis"""
    queryset = UserSkill.objects.all()
    serializer_class = UserSkillSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name']


class UserSkillLevelListView(generics.ListCreateAPIView):
    """Lista e cria habilidades do usuário"""
    serializer_class = UserSkillLevelSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSkillLevel.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserSkillLevelCreateUpdateSerializer
        return UserSkillLevelSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserSkillLevelDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalhes, atualização e exclusão de habilidades do usuário"""
    serializer_class = UserSkillLevelCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSkillLevel.objects.filter(user=self.request.user)


class UserAvailabilityListView(generics.ListCreateAPIView):
    """Lista e cria disponibilidade do usuário"""
    serializer_class = UserAvailabilitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserAvailability.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserAvailabilityCreateUpdateSerializer
        return UserAvailabilitySerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserAvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalhes, atualização e exclusão de disponibilidade"""
    serializer_class = UserAvailabilityCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserAvailability.objects.filter(user=self.request.user)


class UserNotificationSettingsView(generics.RetrieveUpdateAPIView):
    """Configurações de notificação do usuário"""
    serializer_class = UserNotificationSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        settings, created = UserNotificationSettings.objects.get_or_create(user=self.request.user)
        return settings


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Alterar senha do usuário"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Senha alterada com sucesso'}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Estatísticas do usuário"""
    user = request.user
    profile = user.profile
    
    # Eventos participados
    total_events_participated = profile.total_events_participated
    
    # Horas voluntariadas
    total_hours_volunteered = profile.total_hours_volunteered
    
    # Badges conquistados
    badges_earned = UserBadgeEarned.objects.filter(user=user).count()
    
    # Habilidades
    skills_count = UserSkillLevel.objects.filter(user=user).count()
    
    # Eventos organizados
    events_organized = user.organized_events.count()
    
    # Eventos do mês atual
    current_month = timezone.now().replace(day=1)
    current_month_events = user.event_participations.filter(
        event__start_date__gte=current_month,
        status='confirmed'
    ).count()
    
    # Categorias favoritas
    favorite_categories = user.profile.interests.values_list('name', flat=True)
    
    stats = {
        'total_events_participated': total_events_participated,
        'total_hours_volunteered': total_hours_volunteered,
        'badges_earned': badges_earned,
        'skills_count': skills_count,
        'events_organized': events_organized,
        'current_month_events': current_month_events,
        'favorite_categories': list(favorite_categories)
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Buscar usuários"""
    serializer = UserSearchSerializer(data=request.query_params)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    query = data.get('query', '')
    city = data.get('city', '')
    state = data.get('state', '')
    skills = data.get('skills', [])
    interests = data.get('interests', [])
    
    # Buscar usuários
    users = User.objects.filter(
        Q(first_name__icontains=query) | 
        Q(last_name__icontains=query) |
        Q(username__icontains=query)
    ).filter(profile__is_public_profile=True)
    
    # Filtrar por localização
    if city:
        users = users.filter(profile__city__icontains=city)
    if state:
        users = users.filter(profile__state__iexact=state)
    
    # Filtrar por habilidades
    if skills:
        users = users.filter(skills__skill__name__in=skills).distinct()
    
    # Filtrar por interesses
    if interests:
        users = users.filter(profile__interests__name__in=interests).distinct()
    
    # Serializar resultados
    serializer = UserPublicProfileSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def earn_badge(request, badge_id):
    """Conceder badge ao usuário"""
    try:
        badge = UserBadge.objects.get(id=badge_id)
    except UserBadge.DoesNotExist:
        return Response({'error': 'Badge não encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar se o usuário já tem o badge
    if UserBadgeEarned.objects.filter(user=request.user, badge=badge).exists():
        return Response({'error': 'Você já possui este badge'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar critérios
    profile = request.user.profile
    
    if badge.min_events > 0 and profile.total_events_participated < badge.min_events:
        return Response({'error': 'Critérios não atendidos'}, status=status.HTTP_400_BAD_REQUEST)
    
    if badge.min_hours > 0 and profile.total_hours_volunteered < badge.min_hours:
        return Response({'error': 'Critérios não atendidos'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Conceder badge
    UserBadgeEarned.objects.create(user=request.user, badge=badge)
    
    return Response({'message': 'Badge conquistado com sucesso'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_timeline(request):
    """Timeline do usuário"""
    user = request.user
    
    # Eventos recentes
    recent_events = user.event_participations.filter(
        event__start_date__lte=timezone.now()
    ).select_related('event').order_by('-event__start_date')[:10]
    
    # Badges recentes
    recent_badges = UserBadgeEarned.objects.filter(user=user).order_by('-earned_at')[:5]
    
    # Fotos recentes
    from events.models import EventPhoto
    recent_photos = EventPhoto.objects.filter(
        event__participants__user=user
    ).select_related('event', 'user').order_by('-created_at')[:10]
    
    timeline = []
    
    # Adicionar eventos
    for participation in recent_events:
        timeline.append({
            'type': 'event_participation',
            'date': participation.event.start_date,
            'data': {
                'event_title': participation.event.title,
                'status': participation.status,
                'checked_in': participation.checked_in
            }
        })
    
    # Adicionar badges
    for badge_earned in recent_badges:
        timeline.append({
            'type': 'badge_earned',
            'date': badge_earned.earned_at,
            'data': {
                'badge_name': badge_earned.badge.name,
                'badge_icon': badge_earned.badge.icon
            }
        })
    
    # Adicionar fotos
    for photo in recent_photos:
        timeline.append({
            'type': 'photo_uploaded',
            'date': photo.created_at,
            'data': {
                'event_title': photo.event.title,
                'photo_url': photo.photo.url,
                'caption': photo.caption
            }
        })
    
    # Ordenar por data
    timeline.sort(key=lambda x: x['date'], reverse=True)
    
    return Response(timeline[:20])  # Limitar a 20 itens


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_recommendations(request):
    """Recomendações de eventos para o usuário"""
    user = request.user
    profile = user.profile
    
    # Eventos baseados nos interesses
    interested_categories = profile.interests.all()
    recommended_events = []
    
    if interested_categories.exists():
        from events.models import Event
        recommended_events = Event.objects.filter(
            category__in=interested_categories,
            status='published',
            start_date__gte=timezone.now()
        ).exclude(
            participants__user=user
        ).select_related('category', 'organizer')[:10]
    
    # Eventos próximos
    nearby_events = []
    if hasattr(profile, 'city') and profile.city:
        from events.models import Event
        nearby_events = Event.objects.filter(
            city__icontains=profile.city,
            status='published',
            start_date__gte=timezone.now()
        ).exclude(
            participants__user=user
        ).select_related('category', 'organizer')[:5]
    
    # Combinar e remover duplicatas
    all_events = list(recommended_events) + list(nearby_events)
    unique_events = list({event.id: event for event in all_events}.values())
    
    serializer = UserPublicProfileSerializer(unique_events, many=True)
    return Response(serializer.data)