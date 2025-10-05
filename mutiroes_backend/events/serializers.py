from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    EventCategory, Event, EventParticipant, EventResource, 
    EventPhoto, EventComment, EventReport
)


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = ['id', 'name', 'description', 'icon', 'color']


class EventPhotoSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = EventPhoto
        fields = ['id', 'photo', 'caption', 'is_before', 'is_after', 'user_name', 'created_at']


class EventCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    
    def get_user_avatar(self, obj):
        if obj.user.profile and obj.user.profile.avatar and hasattr(obj.user.profile.avatar, 'url'):
            return obj.user.profile.avatar.url
        return None
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = EventComment
        fields = ['id', 'content', 'user_name', 'user_avatar', 'replies', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        replies = obj.replies.all()
        return EventCommentSerializer(replies, many=True).data


class EventResourceSerializer(serializers.ModelSerializer):
    is_fully_provided = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = EventResource
        fields = ['id', 'name', 'description', 'resource_type', 'quantity_needed', 
                 'quantity_provided', 'unit', 'is_fully_provided']


class EventParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    
    def get_user_avatar(self, obj):
        if obj.user.profile and obj.user.profile.avatar and hasattr(obj.user.profile.avatar, 'url'):
            return obj.user.profile.avatar.url
        return None
    
    class Meta:
        model = EventParticipant
        fields = ['id', 'user_name', 'user_avatar', 'status', 'emergency_contact', 
                 'emergency_phone', 'special_needs', 'experience_level', 
                 'checked_in', 'check_in_time', 'registered_at']


class EventListSerializer(serializers.ModelSerializer):
    category = EventCategorySerializer(read_only=True)
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    participants_count = serializers.IntegerField(read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_registration_open = serializers.BooleanField(read_only=True)
    cover_image_url = serializers.SerializerMethodField()
    
    def get_cover_image_url(self, obj):
        if obj.cover_image and hasattr(obj.cover_image, 'url'):
            return obj.cover_image.url
        return None
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'category', 'organizer_name', 
                 'address', 'city', 'state', 'start_date', 'end_date', 
                 'max_participants', 'participants_count', 'available_spots',
                 'status', 'is_active', 'is_registration_open', 'cover_image_url',
                 'created_at']


class EventDetailSerializer(serializers.ModelSerializer):
    category = EventCategorySerializer(read_only=True)
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    organizer_avatar = serializers.SerializerMethodField()
    participants_count = serializers.IntegerField(read_only=True)
    available_spots = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_registration_open = serializers.BooleanField(read_only=True)
    cover_image_url = serializers.SerializerMethodField()
    
    def get_organizer_avatar(self, obj):
        """Retorna URL do avatar do organizador ou None"""
        if obj.organizer and hasattr(obj.organizer, 'profile') and obj.organizer.profile:
            if obj.organizer.profile.avatar and hasattr(obj.organizer.profile.avatar, 'url'):
                return obj.organizer.profile.avatar.url
        return None
    
    def get_cover_image_url(self, obj):
        """Retorna URL da imagem de capa ou None"""
        if obj.cover_image and hasattr(obj.cover_image, 'url'):
            return obj.cover_image.url
        return None
    
    # Relacionamentos
    resources = EventResourceSerializer(many=True, read_only=True)
    photos = EventPhotoSerializer(many=True, read_only=True)
    comments = EventCommentSerializer(many=True, read_only=True)
    participants = EventParticipantSerializer(many=True, read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'category', 'organizer_name', 'organizer_avatar',
                 'address', 'latitude', 'longitude', 'city', 'state', 
                 'start_date', 'end_date', 'registration_deadline',
                 'max_participants', 'min_age', 'max_age', 'participants_count', 'available_spots',
                 'status', 'is_public', 'requires_approval', 'is_active', 'is_registration_open',
                 'required_tools', 'provided_tools', 'what_to_bring', 'cover_image_url',
                 'resources', 'photos', 'comments', 'participants',
                 'created_at', 'updated_at']


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['title', 'description', 'category', 'address', 'latitude', 'longitude',
                 'city', 'state', 'start_date', 'end_date', 'registration_deadline',
                 'max_participants', 'min_age', 'max_age', 'status', 'is_public',
                 'requires_approval', 'required_tools', 'provided_tools', 'what_to_bring',
                 'cover_image']
    
    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("A data de início deve ser anterior à data de término.")
        
        if data['registration_deadline'] >= data['start_date']:
            raise serializers.ValidationError("O prazo de inscrição deve ser anterior à data de início.")
        
        if data.get('min_age') and data.get('max_age') and data['min_age'] >= data['max_age']:
            raise serializers.ValidationError("A idade mínima deve ser menor que a idade máxima.")
        
        return data


class EventParticipantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventParticipant
        fields = ['emergency_contact', 'emergency_phone', 'special_needs', 'experience_level']
    
    def validate(self, data):
        event = self.context['event']
        user = self.context['user']
        
        # Verificar se o usuário já está inscrito
        if EventParticipant.objects.filter(event=event, user=user).exists():
            raise serializers.ValidationError("Você já está inscrito neste evento.")
        
        # Verificar se há vagas disponíveis
        if event.participants_count >= event.max_participants:
            raise serializers.ValidationError("Não há vagas disponíveis para este evento.")
        
        # Verificar se as inscrições ainda estão abertas
        if not event.is_registration_open:
            raise serializers.ValidationError("As inscrições para este evento estão encerradas.")
        
        return data


class EventParticipantUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventParticipant
        fields = ['status', 'emergency_contact', 'emergency_phone', 'special_needs', 'experience_level']


class EventPhotoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventPhoto
        fields = ['photo', 'caption', 'is_before', 'is_after']


class EventCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventComment
        fields = ['content', 'parent']


class EventResourceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventResource
        fields = ['name', 'description', 'resource_type', 'quantity_needed', 'quantity_provided', 'unit']


class EventReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    
    class Meta:
        model = EventReport
        fields = ['id', 'event', 'event_title', 'created_by', 'created_by_name',
                 'total_participants', 'total_hours', 'trash_collected_kg', 
                 'trees_planted', 'area_cleaned_m2', 'recyclable_material_kg',
                 'summary', 'challenges', 'achievements', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class EventReportCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventReport
        fields = ['total_participants', 'total_hours', 'trash_collected_kg', 
                 'trees_planted', 'area_cleaned_m2', 'recyclable_material_kg',
                 'summary', 'challenges', 'achievements']
    
    def validate_total_participants(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("O número de participantes não pode ser negativo.")
        return value
    
    def validate_total_hours(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("O total de horas não pode ser negativo.")
        return value
    
    def validate_trash_collected_kg(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("A quantidade de lixo coletado não pode ser negativa.")
        return value
    
    def validate_trees_planted(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("O número de árvores plantadas não pode ser negativo.")
        return value
    
    def validate_area_cleaned_m2(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("A área limpa não pode ser negativa.")
        return value
    
    def validate_recyclable_material_kg(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("A quantidade de material reciclável não pode ser negativa.")
        return value
