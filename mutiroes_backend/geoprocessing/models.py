from django.db import models
from django.contrib.auth.models import User


class Area(models.Model):
    """Áreas geográficas para agrupamento de eventos"""
    name = models.CharField(max_length=200, verbose_name="Nome")
    description = models.TextField(blank=True, verbose_name="Descrição")
    
    # Coordenadas simples (latitude/longitude)
    latitude = models.FloatField(verbose_name="Latitude")
    longitude = models.FloatField(verbose_name="Longitude")
    
    # Metadados
    area_type = models.CharField(max_length=50, choices=[
        ('neighborhood', 'Bairro'),
        ('district', 'Distrito'),
        ('city', 'Cidade'),
        ('region', 'Região'),
        ('custom', 'Personalizada'),
    ], verbose_name="Tipo de Área")
    
    # Configurações
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    radius_km = models.FloatField(default=5.0, verbose_name="Raio em KM")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Área"
        verbose_name_plural = "Áreas"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class EventLocation(models.Model):
    """Localizações dos eventos com dados geográficos"""
    event = models.OneToOneField('events.Event', on_delete=models.CASCADE, related_name='location_data', verbose_name="Evento")
    
    # Coordenadas
    latitude = models.FloatField(verbose_name="Latitude")
    longitude = models.FloatField(verbose_name="Longitude")
    address = models.CharField(max_length=300, verbose_name="Endereço")
    
    # Dados geográficos
    city = models.CharField(max_length=100, verbose_name="Cidade")
    state = models.CharField(max_length=2, verbose_name="Estado")
    country = models.CharField(max_length=100, default="Brasil", verbose_name="País")
    postal_code = models.CharField(max_length=10, blank=True, verbose_name="CEP")
    
    # Área associada
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True, related_name='events', verbose_name="Área")
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Localização do Evento"
        verbose_name_plural = "Localizações dos Eventos"
    
    def __str__(self):
        return f"{self.event.title} - {self.address}"


class Geofence(models.Model):
    """Geofences para notificações baseadas em localização"""
    name = models.CharField(max_length=200, verbose_name="Nome")
    description = models.TextField(blank=True, verbose_name="Descrição")
    
    # Coordenadas do centro
    latitude = models.FloatField(verbose_name="Latitude Central")
    longitude = models.FloatField(verbose_name="Longitude Central")
    
    # Configurações
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    notification_radius = models.FloatField(default=1.0, verbose_name="Raio de Notificação (KM)")
    
    # Eventos relacionados
    related_events = models.ManyToManyField('events.Event', blank=True, related_name='geofences', verbose_name="Eventos Relacionados")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Geofence"
        verbose_name_plural = "Geofences"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UserLocation(models.Model):
    """Localização atual dos usuários"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations', verbose_name="Usuário")
    
    # Coordenadas
    latitude = models.FloatField(verbose_name="Latitude")
    longitude = models.FloatField(verbose_name="Longitude")
    accuracy = models.FloatField(null=True, blank=True, verbose_name="Precisão (metros)")
    
    # Metadados
    is_current = models.BooleanField(default=True, verbose_name="Localização Atual")
    source = models.CharField(max_length=20, choices=[
        ('gps', 'GPS'),
        ('network', 'Rede'),
        ('manual', 'Manual'),
    ], default='gps', verbose_name="Fonte")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Localização do Usuário"
        verbose_name_plural = "Localizações dos Usuários"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.created_at}"


class Route(models.Model):
    """Rotas otimizadas para eventos"""
    name = models.CharField(max_length=200, verbose_name="Nome")
    description = models.TextField(blank=True, verbose_name="Descrição")
    
    # Eventos da rota
    events = models.ManyToManyField('events.Event', related_name='routes', verbose_name="Eventos")
    
    # Dados da rota
    total_distance = models.FloatField(verbose_name="Distância Total (KM)")
    estimated_duration = models.DurationField(verbose_name="Duração Estimada")
    
    # Configurações
    is_optimized = models.BooleanField(default=False, verbose_name="Otimizada")
    optimization_algorithm = models.CharField(max_length=50, blank=True, verbose_name="Algoritmo de Otimização")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Rota"
        verbose_name_plural = "Rotas"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class EnvironmentalData(models.Model):
    """Dados ambientais das áreas"""
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name='environmental_data', verbose_name="Área")
    
    # Dados ambientais
    air_quality_index = models.FloatField(null=True, blank=True, verbose_name="Índice de Qualidade do Ar")
    temperature = models.FloatField(null=True, blank=True, verbose_name="Temperatura (°C)")
    humidity = models.FloatField(null=True, blank=True, verbose_name="Umidade (%)")
    pollution_level = models.CharField(max_length=20, choices=[
        ('low', 'Baixo'),
        ('moderate', 'Moderado'),
        ('high', 'Alto'),
        ('very_high', 'Muito Alto'),
    ], blank=True, verbose_name="Nível de Poluição")
    
    # Dados de vegetação
    vegetation_coverage = models.FloatField(null=True, blank=True, verbose_name="Cobertura Vegetal (%)")
    tree_density = models.FloatField(null=True, blank=True, verbose_name="Densidade de Árvores")
    
    # Metadados
    data_source = models.CharField(max_length=100, verbose_name="Fonte dos Dados")
    collected_at = models.DateTimeField(verbose_name="Coletado em")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Dado Ambiental"
        verbose_name_plural = "Dados Ambientais"
        ordering = ['-collected_at']
    
    def __str__(self):
        return f"Dados Ambientais - {self.area.name} - {self.collected_at}"


class ImpactMeasurement(models.Model):
    """Medições de impacto dos eventos"""
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='impact_measurements', verbose_name="Evento")
    
    # Dados de impacto
    waste_collected_kg = models.FloatField(null=True, blank=True, verbose_name="Lixo Coletado (KG)")
    trees_planted = models.PositiveIntegerField(null=True, blank=True, verbose_name="Árvores Plantadas")
    area_cleaned_m2 = models.FloatField(null=True, blank=True, verbose_name="Área Limpa (m²)")
    co2_reduced_kg = models.FloatField(null=True, blank=True, verbose_name="CO2 Reduzido (KG)")
    
    # Dados de participação
    participants_count = models.PositiveIntegerField(verbose_name="Número de Participantes")
    hours_volunteered = models.FloatField(verbose_name="Horas Voluntariadas")
    
    # Metadados
    measured_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Medido por")
    measured_at = models.DateTimeField(verbose_name="Medido em")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Medição de Impacto"
        verbose_name_plural = "Medições de Impacto"
        ordering = ['-measured_at']
    
    def __str__(self):
        return f"Impacto - {self.event.title} - {self.measured_at}"