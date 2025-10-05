from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class UserProfile(models.Model):
    """Perfil estendido do usuário"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name="Usuário")
    
    # Informações pessoais
    phone = models.CharField(
        max_length=15, 
        blank=True, 
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Formato de telefone inválido")],
        verbose_name="Telefone"
    )
    birth_date = models.DateField(null=True, blank=True, verbose_name="Data de Nascimento")
    bio = models.TextField(max_length=500, blank=True, verbose_name="Biografia")
    avatar = models.ImageField(upload_to='users/avatars/', null=True, blank=True, verbose_name="Avatar")
    
    # Localização
    city = models.CharField(max_length=100, blank=True, verbose_name="Cidade")
    state = models.CharField(max_length=2, blank=True, verbose_name="Estado")
    zip_code = models.CharField(max_length=10, blank=True, verbose_name="CEP")
    
    # Preferências
    interests = models.ManyToManyField('events.EventCategory', blank=True, related_name='interested_users', verbose_name="Interesses")
    notification_preferences = models.JSONField(default=dict, verbose_name="Preferências de Notificação")
    
    # Configurações de privacidade
    is_public_profile = models.BooleanField(default=True, verbose_name="Perfil Público")
    show_participation_history = models.BooleanField(default=True, verbose_name="Mostrar Histórico de Participação")
    
    # Estatísticas
    total_events_participated = models.PositiveIntegerField(default=0, verbose_name="Total de Eventos Participados")
    total_hours_volunteered = models.PositiveIntegerField(default=0, verbose_name="Total de Horas Voluntariadas")
    
    # Metadados
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Perfil do Usuário"
        verbose_name_plural = "Perfis dos Usuários"
    
    def __str__(self):
        return f"Perfil de {self.user.get_full_name()}"
    
    @property
    def age(self):
        if self.birth_date:
            from datetime import date
            today = date.today()
            return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        return None


class UserBadge(models.Model):
    """Badges/conquistas dos usuários"""
    BADGE_TYPES = [
        ('participation', 'Participação'),
        ('organization', 'Organização'),
        ('achievement', 'Conquista'),
        ('special', 'Especial'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="Nome")
    description = models.TextField(verbose_name="Descrição")
    icon = models.CharField(max_length=50, verbose_name="Ícone")
    color = models.CharField(max_length=7, default="#FFD700", verbose_name="Cor")
    badge_type = models.CharField(max_length=20, choices=BADGE_TYPES, verbose_name="Tipo de Badge")
    
    # Critérios para obtenção
    min_events = models.PositiveIntegerField(default=0, verbose_name="Mínimo de Eventos")
    min_hours = models.PositiveIntegerField(default=0, verbose_name="Mínimo de Horas")
    special_condition = models.TextField(blank=True, verbose_name="Condição Especial")
    
    class Meta:
        verbose_name = "Badge"
        verbose_name_plural = "Badges"
        ordering = ['badge_type', 'min_events']
    
    def __str__(self):
        return self.name


class UserBadgeEarned(models.Model):
    """Badges conquistados pelos usuários"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='earned_badges', verbose_name="Usuário")
    badge = models.ForeignKey(UserBadge, on_delete=models.CASCADE, verbose_name="Badge")
    earned_at = models.DateTimeField(auto_now_add=True, verbose_name="Conquistado em")
    
    class Meta:
        verbose_name = "Badge Conquistado"
        verbose_name_plural = "Badges Conquistados"
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.badge.name}"


class UserSkill(models.Model):
    """Habilidades dos usuários"""
    SKILL_CATEGORIES = [
        ('environmental', 'Ambiental'),
        ('technical', 'Técnica'),
        ('leadership', 'Liderança'),
        ('communication', 'Comunicação'),
        ('other', 'Outra'),
    ]
    
    name = models.CharField(max_length=100, verbose_name="Nome")
    category = models.CharField(max_length=20, choices=SKILL_CATEGORIES, verbose_name="Categoria")
    description = models.TextField(blank=True, verbose_name="Descrição")
    
    class Meta:
        verbose_name = "Habilidade"
        verbose_name_plural = "Habilidades"
        ordering = ['category', 'name']
    
    def __str__(self):
        return self.name


class UserSkillLevel(models.Model):
    """Níveis de habilidade dos usuários"""
    SKILL_LEVELS = [
        ('beginner', 'Iniciante'),
        ('intermediate', 'Intermediário'),
        ('advanced', 'Avançado'),
        ('expert', 'Especialista'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills', verbose_name="Usuário")
    skill = models.ForeignKey(UserSkill, on_delete=models.CASCADE, verbose_name="Habilidade")
    level = models.CharField(max_length=20, choices=SKILL_LEVELS, verbose_name="Nível")
    years_experience = models.PositiveIntegerField(default=0, verbose_name="Anos de Experiência")
    
    class Meta:
        verbose_name = "Nível de Habilidade"
        verbose_name_plural = "Níveis de Habilidades"
        unique_together = ['user', 'skill']
        ordering = ['skill__category', 'skill__name']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.skill.name} ({self.get_level_display()})"


class UserAvailability(models.Model):
    """Disponibilidade dos usuários"""
    DAYS_OF_WEEK = [
        ('monday', 'Segunda-feira'),
        ('tuesday', 'Terça-feira'),
        ('wednesday', 'Quarta-feira'),
        ('thursday', 'Quinta-feira'),
        ('friday', 'Sexta-feira'),
        ('saturday', 'Sábado'),
        ('sunday', 'Domingo'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availability', verbose_name="Usuário")
    day_of_week = models.CharField(max_length=10, choices=DAYS_OF_WEEK, verbose_name="Dia da Semana")
    start_time = models.TimeField(verbose_name="Horário de Início")
    end_time = models.TimeField(verbose_name="Horário de Término")
    is_available = models.BooleanField(default=True, verbose_name="Disponível")
    
    class Meta:
        verbose_name = "Disponibilidade do Usuário"
        verbose_name_plural = "Disponibilidades dos Usuários"
        unique_together = ['user', 'day_of_week', 'start_time']
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class UserNotificationSettings(models.Model):
    """Configurações de notificação dos usuários"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings', verbose_name="Usuário")
    
    # Tipos de notificação
    email_new_events = models.BooleanField(default=True, verbose_name="Email - Novos Eventos")
    email_event_reminders = models.BooleanField(default=True, verbose_name="Email - Lembretes de Eventos")
    email_event_updates = models.BooleanField(default=True, verbose_name="Email - Atualizações de Eventos")
    email_badge_earned = models.BooleanField(default=True, verbose_name="Email - Badges Conquistados")
    
    push_new_events = models.BooleanField(default=True, verbose_name="Push - Novos Eventos")
    push_event_reminders = models.BooleanField(default=True, verbose_name="Push - Lembretes de Eventos")
    push_event_updates = models.BooleanField(default=True, verbose_name="Push - Atualizações de Eventos")
    push_badge_earned = models.BooleanField(default=True, verbose_name="Push - Badges Conquistados")
    
    # Frequência
    reminder_frequency = models.CharField(max_length=20, choices=[
        ('immediate', 'Imediato'),
        ('daily', 'Diário'),
        ('weekly', 'Semanal'),
        ('never', 'Nunca'),
    ], default='daily', verbose_name="Frequência de Lembretes")
    
    class Meta:
        verbose_name = "Configuração de Notificação"
        verbose_name_plural = "Configurações de Notificação"
    
    def __str__(self):
        return f"Notificações de {self.user.get_full_name()}"