from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class NotificationTemplate(models.Model):
    """Templates de notificação"""
    NOTIFICATION_TYPES = [
        ('event_created', 'Evento Criado'),
        ('event_updated', 'Evento Atualizado'),
        ('event_cancelled', 'Evento Cancelado'),
        ('event_reminder', 'Lembrete de Evento'),
        ('registration_confirmed', 'Inscrição Confirmada'),
        ('registration_cancelled', 'Inscrição Cancelada'),
        ('badge_earned', 'Badge Conquistado'),
        ('event_photo_uploaded', 'Foto do Evento Enviada'),
        ('event_comment', 'Comentário no Evento'),
        ('custom', 'Personalizada'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="Nome")
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, verbose_name="Tipo de Notificação")
    title_template = models.CharField(max_length=200, verbose_name="Template do Título")
    body_template = models.TextField(verbose_name="Template do Corpo")
    
    # Configurações de envio
    send_email = models.BooleanField(default=True, verbose_name="Enviar Email")
    send_push = models.BooleanField(default=True, verbose_name="Enviar Push")
    send_sms = models.BooleanField(default=False, verbose_name="Enviar SMS")
    
    # Configurações de timing
    send_immediately = models.BooleanField(default=True, verbose_name="Enviar Imediatamente")
    delay_hours = models.PositiveIntegerField(default=0, verbose_name="Atraso em Horas")
    send_at_specific_time = models.TimeField(null=True, blank=True, verbose_name="Enviar em Horário Específico")
    
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    
    class Meta:
        verbose_name = "Template de Notificação"
        verbose_name_plural = "Templates de Notificação"
        ordering = ['notification_type', 'name']
    
    def __str__(self):
        return self.name


class Notification(models.Model):
    """Notificações enviadas para usuários"""
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('sent', 'Enviada'),
        ('delivered', 'Entregue'),
        ('failed', 'Falhou'),
        ('cancelled', 'Cancelada'),
    ]
    
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('push', 'Push'),
        ('sms', 'SMS'),
        ('in_app', 'No App'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name="Usuário")
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Template")
    
    # Conteúdo
    title = models.CharField(max_length=200, verbose_name="Título")
    body = models.TextField(verbose_name="Corpo")
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES, verbose_name="Canal")
    
    # Status e timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")
    scheduled_for = models.DateTimeField(default=timezone.now, verbose_name="Agendado para")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Enviado em")
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name="Entregue em")
    
    # Dados relacionados
    related_event = models.ForeignKey('events.Event', on_delete=models.CASCADE, null=True, blank=True, verbose_name="Evento Relacionado")
    related_object_id = models.PositiveIntegerField(null=True, blank=True, verbose_name="ID do Objeto Relacionado")
    related_object_type = models.CharField(max_length=50, blank=True, verbose_name="Tipo do Objeto Relacionado")
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Notificação"
        verbose_name_plural = "Notificações"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.get_full_name()}"
    
    @property
    def is_overdue(self):
        return self.status == 'pending' and self.scheduled_for < timezone.now()


class NotificationLog(models.Model):
    """Log de tentativas de envio de notificações"""
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs', verbose_name="Notificação")
    attempt_number = models.PositiveIntegerField(verbose_name="Número da Tentativa")
    status = models.CharField(max_length=20, choices=Notification.STATUS_CHOICES, verbose_name="Status")
    error_message = models.TextField(blank=True, verbose_name="Mensagem de Erro")
    response_data = models.JSONField(default=dict, verbose_name="Dados da Resposta")
    
    attempted_at = models.DateTimeField(auto_now_add=True, verbose_name="Tentado em")
    
    class Meta:
        verbose_name = "Log de Notificação"
        verbose_name_plural = "Logs de Notificação"
        ordering = ['-attempted_at']
    
    def __str__(self):
        return f"Log {self.attempt_number} - {self.notification.title}"


class PushToken(models.Model):
    """Tokens de push notification dos usuários"""
    PLATFORM_CHOICES = [
        ('ios', 'iOS'),
        ('android', 'Android'),
        ('web', 'Web'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='push_tokens', verbose_name="Usuário")
    token = models.CharField(max_length=500, verbose_name="Token")
    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES, verbose_name="Plataforma")
    device_id = models.CharField(max_length=100, blank=True, verbose_name="ID do Dispositivo")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    last_used = models.DateTimeField(auto_now=True, verbose_name="Último Uso")
    
    class Meta:
        verbose_name = "Token de Push"
        verbose_name_plural = "Tokens de Push"
        unique_together = ['user', 'token']
        ordering = ['-last_used']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.platform}"


class NotificationQueue(models.Model):
    """Fila de notificações para processamento assíncrono"""
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('normal', 'Normal'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, verbose_name="Notificação")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal', verbose_name="Prioridade")
    retry_count = models.PositiveIntegerField(default=0, verbose_name="Contador de Tentativas")
    max_retries = models.PositiveIntegerField(default=3, verbose_name="Máximo de Tentativas")
    
    scheduled_for = models.DateTimeField(verbose_name="Agendado para")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Fila de Notificação"
        verbose_name_plural = "Fila de Notificações"
        ordering = ['priority', 'scheduled_for']
    
    def __str__(self):
        return f"Fila - {self.notification.title} ({self.get_priority_display()})"
    
    @property
    def should_retry(self):
        return self.retry_count < self.max_retries


class NotificationPreference(models.Model):
    """Preferências de notificação por tipo"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_preferences', verbose_name="Usuário")
    notification_type = models.CharField(max_length=30, choices=NotificationTemplate.NOTIFICATION_TYPES, verbose_name="Tipo de Notificação")
    
    # Preferências de canal
    email_enabled = models.BooleanField(default=True, verbose_name="Email Habilitado")
    push_enabled = models.BooleanField(default=True, verbose_name="Push Habilitado")
    sms_enabled = models.BooleanField(default=False, verbose_name="SMS Habilitado")
    
    # Preferências de timing
    quiet_hours_start = models.TimeField(null=True, blank=True, verbose_name="Início do Horário Silencioso")
    quiet_hours_end = models.TimeField(null=True, blank=True, verbose_name="Fim do Horário Silencioso")
    
    class Meta:
        verbose_name = "Preferência de Notificação"
        verbose_name_plural = "Preferências de Notificação"
        unique_together = ['user', 'notification_type']
        ordering = ['user', 'notification_type']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_notification_type_display()}"