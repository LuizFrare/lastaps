from django.contrib import admin
from .models import (
    Area, EventLocation, Geofence, UserLocation, 
    Route, EnvironmentalData, ImpactMeasurement
)


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ['name', 'area_type', 'is_active', 'radius_km', 'created_at']
    list_filter = ['area_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EventLocation)
class EventLocationAdmin(admin.ModelAdmin):
    list_display = ['event', 'city', 'state', 'area', 'created_at']
    list_filter = ['city', 'state', 'area', 'created_at']
    search_fields = ['event__title', 'address', 'city']
    raw_id_fields = ['event', 'area']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Geofence)
class GeofenceAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'notification_radius', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    raw_id_fields = ['related_events']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserLocation)
class UserLocationAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_current', 'source', 'accuracy', 'created_at']
    list_filter = ['is_current', 'source', 'created_at']
    search_fields = ['user__username', 'device_id']
    raw_id_fields = ['user']
    readonly_fields = ['created_at']


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_optimized', 'total_distance', 'estimated_duration', 'created_at']
    list_filter = ['is_optimized', 'created_at']
    search_fields = ['name', 'description']
    raw_id_fields = ['events']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EnvironmentalData)
class EnvironmentalDataAdmin(admin.ModelAdmin):
    list_display = ['area', 'air_quality_index', 'temperature', 'humidity', 'collected_at']
    list_filter = ['area', 'pollution_level', 'collected_at']
    search_fields = ['area__name', 'data_source']
    raw_id_fields = ['area']
    readonly_fields = ['created_at']


@admin.register(ImpactMeasurement)
class ImpactMeasurementAdmin(admin.ModelAdmin):
    list_display = ['event', 'participants_count', 'hours_volunteered', 'waste_collected_kg', 'trees_planted', 'measured_at']
    list_filter = ['measured_at']
    search_fields = ['event__title', 'measured_by__username']
    raw_id_fields = ['event', 'measured_by']
    readonly_fields = ['created_at']