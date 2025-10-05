from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import (
    UserProfile, UserBadge, UserBadgeEarned, UserSkill, 
    UserSkillLevel, UserAvailability, UserNotificationSettings
)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    interests = serializers.StringRelatedField(many=True, read_only=True)
    avatar_url = serializers.SerializerMethodField()
    age = serializers.IntegerField(read_only=True)
    
    def get_avatar_url(self, obj):
        """Retorna URL do avatar ou None se não existir"""
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return obj.avatar.url
        return None
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'phone', 'birth_date', 'bio', 'avatar_url', 'age',
                 'city', 'state', 'zip_code', 'interests', 'notification_preferences',
                 'is_public_profile', 'show_participation_history',
                 'total_events_participated', 'total_hours_volunteered',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'total_events_participated', 'total_hours_volunteered',
                           'created_at', 'updated_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone', 'birth_date', 'bio', 'avatar', 'city', 'state', 'zip_code',
                 'interests', 'notification_preferences', 'is_public_profile',
                 'show_participation_history']


class UserBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBadge
        fields = ['id', 'name', 'description', 'icon', 'color', 'badge_type',
                 'min_events', 'min_hours', 'special_condition']


class UserBadgeEarnedSerializer(serializers.ModelSerializer):
    badge = UserBadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadgeEarned
        fields = ['id', 'badge', 'earned_at']


class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkill
        fields = ['id', 'name', 'category', 'description']


class UserSkillLevelSerializer(serializers.ModelSerializer):
    skill = UserSkillSerializer(read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = UserSkillLevel
        fields = ['id', 'skill', 'level', 'level_display', 'years_experience']


class UserSkillLevelCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkillLevel
        fields = ['skill', 'level', 'years_experience']


class UserAvailabilitySerializer(serializers.ModelSerializer):
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = UserAvailability
        fields = ['id', 'day_of_week', 'day_display', 'start_time', 'end_time', 'is_available']


class UserAvailabilityCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAvailability
        fields = ['day_of_week', 'start_time', 'end_time', 'is_available']


class UserNotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotificationSettings
        fields = ['email_new_events', 'email_event_reminders', 'email_event_updates',
                 'email_badge_earned', 'push_new_events', 'push_event_reminders',
                 'push_event_updates', 'push_badge_earned', 'reminder_frequency']


class UserStatsSerializer(serializers.Serializer):
    total_events_participated = serializers.IntegerField()
    total_hours_volunteered = serializers.IntegerField()
    badges_earned = serializers.IntegerField()
    skills_count = serializers.IntegerField()
    events_organized = serializers.IntegerField()
    current_month_events = serializers.IntegerField()
    favorite_categories = serializers.ListField(child=serializers.CharField())


class UserPublicProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    interests = serializers.StringRelatedField(many=True, read_only=True)
    avatar_url = serializers.CharField(source='avatar.url', read_only=True)
    age = serializers.IntegerField(read_only=True)
    badges = UserBadgeEarnedSerializer(source='user.earned_badges', many=True, read_only=True)
    skills = UserSkillLevelSerializer(source='user.skills', many=True, read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'bio', 'avatar_url', 'age', 'city', 'state',
                 'interests', 'total_events_participated', 'total_hours_volunteered',
                 'badges', 'skills', 'created_at']
        read_only_fields = ['id', 'total_events_participated', 'total_hours_volunteered',
                           'created_at']


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("As novas senhas não coincidem.")
        return data
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Senha atual incorreta.")
        return value


class UserSearchSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=100)
    city = serializers.CharField(max_length=100, required=False)
    state = serializers.CharField(max_length=2, required=False)
    skills = serializers.ListField(child=serializers.CharField(), required=False)
    interests = serializers.ListField(child=serializers.CharField(), required=False)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that accepts email instead of username
    """
    # Define email field explicitly
    email = serializers.EmailField(required=True)
    
    # Override to not require username
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make username not required since we use email
        self.fields['username'] = serializers.CharField(required=False)
    
    def validate(self, attrs):
        # Get email and password from request
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError('Email e senha são obrigatórios.')
        
        # Find user by email (handle multiple users with same email)
        users = User.objects.filter(email=email)
        
        if not users.exists():
            raise serializers.ValidationError('Credenciais inválidas.')
        
        # Try to authenticate with each user until one works
        user = None
        for potential_user in users:
            if potential_user.check_password(password):
                user = potential_user
                break
        
        if not user:
            raise serializers.ValidationError('Credenciais inválidas.')
        
        # Replace email with username in attrs for parent class
        attrs['username'] = user.username
        
        # Call parent validate with modified attrs
        return super().validate(attrs)
