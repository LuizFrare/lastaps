from django.contrib import admin
from .models import (
    EventCategory, Event, EventParticipant, EventResource, 
    EventPhoto, EventComment, EventReport
)


@admin.register(EventCategory)
class EventCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'color']
    search_fields = ['name', 'description']
    list_filter = ['name']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'organizer', 'category', 'start_date', 'status', 'city', 'participants_count']
    list_filter = ['status', 'category', 'city', 'state', 'start_date']
    search_fields = ['title', 'description', 'address', 'city']
    readonly_fields = ['created_at', 'updated_at', 'participants_count']
    raw_id_fields = ['organizer']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'category', 'organizer')
        }),
        ('Localização', {
            'fields': ('address', 'latitude', 'longitude', 'city', 'state')
        }),
        ('Data e Hora', {
            'fields': ('start_date', 'end_date', 'registration_deadline')
        }),
        ('Configurações', {
            'fields': ('max_participants', 'min_age', 'max_age', 'status', 'is_public', 'requires_approval')
        }),
        ('Recursos', {
            'fields': ('required_tools', 'provided_tools', 'what_to_bring')
        }),
        ('Imagens', {
            'fields': ('cover_image',)
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at', 'participants_count'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EventParticipant)
class EventParticipantAdmin(admin.ModelAdmin):
    list_display = ['user', 'event', 'status', 'registered_at', 'checked_in']
    list_filter = ['status', 'checked_in', 'experience_level', 'registered_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'event__title']
    raw_id_fields = ['user', 'event']
    readonly_fields = ['registered_at', 'updated_at']


@admin.register(EventResource)
class EventResourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'event', 'resource_type', 'quantity_needed', 'quantity_provided', 'is_fully_provided']
    list_filter = ['resource_type', 'event__category']
    search_fields = ['name', 'description', 'event__title']
    raw_id_fields = ['event']


@admin.register(EventPhoto)
class EventPhotoAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'is_before', 'is_after', 'created_at']
    list_filter = ['is_before', 'is_after', 'created_at']
    search_fields = ['event__title', 'user__username', 'caption']
    raw_id_fields = ['event', 'user']


@admin.register(EventComment)
class EventCommentAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'content_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['event__title', 'user__username', 'content']
    raw_id_fields = ['event', 'user', 'parent']
    readonly_fields = ['created_at', 'updated_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Conteúdo'


@admin.register(EventReport)
class EventReportAdmin(admin.ModelAdmin):
    list_display = ['event', 'created_by', 'total_participants', 'trash_collected_kg', 
                   'trees_planted', 'area_cleaned_m2', 'created_at']
    list_filter = ['created_at']
    search_fields = ['event__title', 'created_by__username', 'summary']
    raw_id_fields = ['event', 'created_by']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('event', 'created_by')
        }),
        ('Estatísticas', {
            'fields': ('total_participants', 'total_hours')
        }),
        ('Impacto Ambiental', {
            'fields': ('trash_collected_kg', 'trees_planted', 'area_cleaned_m2', 'recyclable_material_kg')
        }),
        ('Descrições', {
            'fields': ('summary', 'challenges', 'achievements')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )