from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import (
    UserProfile, UserBadge, UserBadgeEarned, UserSkill, 
    UserSkillLevel, UserAvailability, UserNotificationSettings
)


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Perfil'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'badge_type', 'min_events', 'min_hours']
    list_filter = ['badge_type']
    search_fields = ['name', 'description']
    readonly_fields = []


@admin.register(UserBadgeEarned)
class UserBadgeEarnedAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'earned_at']
    list_filter = ['badge__badge_type', 'earned_at']
    search_fields = ['user__username', 'badge__name']
    raw_id_fields = ['user', 'badge']
    readonly_fields = ['earned_at']


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'description']
    list_filter = ['category']
    search_fields = ['name', 'description']


@admin.register(UserSkillLevel)
class UserSkillLevelAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'level', 'years_experience']
    list_filter = ['level', 'skill__category']
    search_fields = ['user__username', 'skill__name']
    raw_id_fields = ['user', 'skill']


@admin.register(UserAvailability)
class UserAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['user', 'day_of_week', 'start_time', 'end_time', 'is_available']
    list_filter = ['day_of_week', 'is_available']
    search_fields = ['user__username']
    raw_id_fields = ['user']


@admin.register(UserNotificationSettings)
class UserNotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_new_events', 'push_new_events', 'reminder_frequency']
    list_filter = ['email_new_events', 'push_new_events', 'reminder_frequency']
    search_fields = ['user__username']
    raw_id_fields = ['user']


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)