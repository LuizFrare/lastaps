from django.contrib import admin
from .models import (
    NotificationTemplate, Notification, NotificationLog, 
    PushToken, NotificationQueue, NotificationPreference
)


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'notification_type', 'send_email', 'send_push', 'send_sms', 'is_active']
    list_filter = ['notification_type', 'send_email', 'send_push', 'send_sms', 'is_active']
    search_fields = ['name', 'title_template', 'body_template']
    readonly_fields = []


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'channel', 'status', 'scheduled_for', 'sent_at']
    list_filter = ['status', 'channel', 'scheduled_for', 'sent_at']
    search_fields = ['user__username', 'title', 'body']
    raw_id_fields = ['user', 'template', 'related_event']
    readonly_fields = ['created_at', 'updated_at', 'sent_at', 'delivered_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'template', 'title', 'body', 'channel')
        }),
        ('Status e Timing', {
            'fields': ('status', 'scheduled_for', 'sent_at', 'delivered_at')
        }),
        ('Objetos Relacionados', {
            'fields': ('related_event', 'related_object_id', 'related_object_type')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['notification', 'attempt_number', 'status', 'attempted_at']
    list_filter = ['status', 'attempted_at']
    search_fields = ['notification__title', 'error_message']
    raw_id_fields = ['notification']
    readonly_fields = ['attempted_at']


@admin.register(PushToken)
class PushTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'platform', 'device_id', 'is_active', 'last_used']
    list_filter = ['platform', 'is_active', 'last_used']
    search_fields = ['user__username', 'device_id']
    raw_id_fields = ['user']
    readonly_fields = ['created_at', 'last_used']


@admin.register(NotificationQueue)
class NotificationQueueAdmin(admin.ModelAdmin):
    list_display = ['notification', 'priority', 'retry_count', 'max_retries', 'scheduled_for']
    list_filter = ['priority', 'retry_count', 'scheduled_for']
    search_fields = ['notification__title']
    raw_id_fields = ['notification']
    readonly_fields = ['created_at']


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'email_enabled', 'push_enabled', 'sms_enabled']
    list_filter = ['notification_type', 'email_enabled', 'push_enabled', 'sms_enabled']
    search_fields = ['user__username']
    raw_id_fields = ['user']