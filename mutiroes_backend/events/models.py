from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class EventCategory(models.Model):
    """Categorias de eventos (limpeza, plantio, monitoramento, etc.)"""
    name = models.CharField(max_length=100, verbose_name="Nome")
    description = models.TextField(blank=True, verbose_name="Descrição")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Ícone")
    color = models.CharField(max_length=7, default="#007AFF", verbose_name="Cor")
    
    class Meta:
        verbose_name = "Categoria de Evento"
        verbose_name_plural = "Categorias de Eventos"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Event(models.Model):
    """Modelo principal para eventos/mutirões"""
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('published', 'Publicado'),
        ('cancelled', 'Cancelado'),
        ('completed', 'Concluído'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(verbose_name="Descrição")
    category = models.ForeignKey(EventCategory, on_delete=models.CASCADE, verbose_name="Categoria")
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events', verbose_name="Organizador")
    
    # Localização
    address = models.CharField(max_length=300, verbose_name="Endereço")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, verbose_name="Latitude")
    longitude = models.DecimalField(max_digits=9, decimal_places=6, verbose_name="Longitude")
    city = models.CharField(max_length=100, verbose_name="Cidade")
    state = models.CharField(max_length=2, verbose_name="Estado")
    
    # Data e hora
    start_date = models.DateTimeField(verbose_name="Data de Início")
    end_date = models.DateTimeField(verbose_name="Data de Término")
    registration_deadline = models.DateTimeField(verbose_name="Prazo de Inscrição")
    
    # Capacidade e requisitos
    max_participants = models.PositiveIntegerField(verbose_name="Máximo de Participantes")
    min_age = models.PositiveIntegerField(default=16, verbose_name="Idade Mínima")
    max_age = models.PositiveIntegerField(null=True, blank=True, verbose_name="Idade Máxima")
    
    # Status e configurações
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Status")
    is_public = models.BooleanField(default=True, verbose_name="Público")
    requires_approval = models.BooleanField(default=False, verbose_name="Requer Aprovação")
    
    # Recursos necessários
    required_tools = models.TextField(blank=True, verbose_name="Ferramentas Necessárias")
    provided_tools = models.TextField(blank=True, verbose_name="Ferramentas Fornecidas")
    what_to_bring = models.TextField(blank=True, verbose_name="O que Trazer")
    
    # Imagens
    cover_image = models.ImageField(upload_to='events/covers/', null=True, blank=True, verbose_name="Imagem de Capa")
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Evento"
        verbose_name_plural = "Eventos"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_active(self):
        return self.status == 'published' and self.start_date > timezone.now()
    
    @property
    def is_registration_open(self):
        return self.is_active and self.registration_deadline > timezone.now()
    
    @property
    def participants_count(self):
        return self.participants.filter(status='confirmed').count()
    
    @property
    def available_spots(self):
        return max(0, self.max_participants - self.participants_count)


class EventParticipant(models.Model):
    """Participantes dos eventos"""
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('confirmed', 'Confirmado'),
        ('cancelled', 'Cancelado'),
        ('rejected', 'Rejeitado'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='participants', verbose_name="Evento")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_participations', verbose_name="Usuário")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")
    
    # Informações adicionais
    emergency_contact = models.CharField(max_length=100, blank=True, verbose_name="Contato de Emergência")
    emergency_phone = models.CharField(max_length=20, blank=True, verbose_name="Telefone de Emergência")
    special_needs = models.TextField(blank=True, verbose_name="Necessidades Especiais")
    experience_level = models.CharField(max_length=20, choices=[
        ('beginner', 'Iniciante'),
        ('intermediate', 'Intermediário'),
        ('advanced', 'Avançado'),
    ], default='beginner', verbose_name="Nível de Experiência")
    
    # Check-in
    checked_in = models.BooleanField(default=False, verbose_name="Check-in Realizado")
    check_in_time = models.DateTimeField(null=True, blank=True, verbose_name="Horário do Check-in")
    
    # Metadados
    registered_at = models.DateTimeField(auto_now_add=True, verbose_name="Inscrito em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Participante do Evento"
        verbose_name_plural = "Participantes dos Eventos"
        unique_together = ['event', 'user']
        ordering = ['-registered_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.event.title}"


class EventResource(models.Model):
    """Recursos necessários para os eventos"""
    RESOURCE_TYPES = [
        ('tool', 'Ferramenta'),
        ('material', 'Material'),
        ('equipment', 'Equipamento'),
        ('other', 'Outro'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='resources', verbose_name="Evento")
    name = models.CharField(max_length=100, verbose_name="Nome")
    description = models.TextField(blank=True, verbose_name="Descrição")
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES, verbose_name="Tipo de Recurso")
    quantity_needed = models.PositiveIntegerField(verbose_name="Quantidade Necessária")
    quantity_provided = models.PositiveIntegerField(default=0, verbose_name="Quantidade Fornecida")
    unit = models.CharField(max_length=20, default="unidade", verbose_name="Unidade")
    
    class Meta:
        verbose_name = "Recurso do Evento"
        verbose_name_plural = "Recursos dos Eventos"
        ordering = ['resource_type', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.event.title}"
    
    @property
    def is_fully_provided(self):
        return self.quantity_provided >= self.quantity_needed


class EventPhoto(models.Model):
    """Fotos dos eventos"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='photos', verbose_name="Evento")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Usuário")
    photo = models.ImageField(upload_to='events/photos/', verbose_name="Foto")
    caption = models.CharField(max_length=200, blank=True, verbose_name="Legenda")
    is_before = models.BooleanField(default=False, verbose_name="Foto Antes")
    is_after = models.BooleanField(default=False, verbose_name="Foto Depois")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Foto do Evento"
        verbose_name_plural = "Fotos dos Eventos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Foto - {self.event.title}"


class EventComment(models.Model):
    """Comentários nos eventos"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='comments', verbose_name="Evento")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Usuário")
    content = models.TextField(verbose_name="Conteúdo")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name="Comentário Pai")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Comentário do Evento"
        verbose_name_plural = "Comentários dos Eventos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comentário de {self.user.get_full_name()} em {self.event.title}"


class EventReport(models.Model):
    """Relatório pós-evento com métricas de impacto"""
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name='report', verbose_name="Evento")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Criado por")
    
    # Participação
    total_participants = models.PositiveIntegerField(verbose_name="Total de Participantes")
    total_hours = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="Total de Horas Voluntariadas")
    
    # Impacto Ambiental
    trash_collected_kg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name="Lixo Coletado (kg)")
    trees_planted = models.PositiveIntegerField(null=True, blank=True, verbose_name="Árvores Plantadas")
    area_cleaned_m2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Área Limpa (m²)")
    recyclable_material_kg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name="Material Reciclável (kg)")
    
    # Observações
    summary = models.TextField(verbose_name="Resumo do Evento")
    challenges = models.TextField(blank=True, verbose_name="Desafios Encontrados")
    achievements = models.TextField(blank=True, verbose_name="Conquistas")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Relatório do Evento"
        verbose_name_plural = "Relatórios dos Eventos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Relatório - {self.event.title}"