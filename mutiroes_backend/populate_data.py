#!/usr/bin/env python3
import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mutiroes_backend.settings')
django.setup()

from django.contrib.auth.models import User
from events.models import EventCategory, Event
from users.models import UserProfile

def create_test_data():
    print("Criando dados de teste...")
    
    # Criar categorias
    categories = [
        {"name": "Limpeza de Praias", "description": "Mutirões de limpeza de praias e orlas marítimas", "icon": "🏖️", "color": "#0EA5E9"},
        {"name": "Limpeza de Rios", "description": "Limpeza e preservação de rios e córregos", "icon": "🌊", "color": "#06B6D4"},
        {"name": "Plantio de Árvores", "description": "Reflorestamento e plantio de mudas", "icon": "🌳", "color": "#10B981"},
        {"name": "Limpeza de Parques", "description": "Manutenção e limpeza de parques e áreas verdes urbanas", "icon": "🏞️", "color": "#22C55E"},
        {"name": "Reciclagem", "description": "Coleta seletiva e projetos de reciclagem", "icon": "♻️", "color": "#84CC16"},
        {"name": "Educação Ambiental", "description": "Palestras, workshops e atividades educativas", "icon": "📚", "color": "#F59E0B"},
        {"name": "Limpeza Urbana", "description": "Limpeza de ruas, calçadas e espaços públicos", "icon": "🏙️", "color": "#EF4444"},
        {"name": "Proteção Animal", "description": "Cuidado e proteção da fauna local", "icon": "🦜", "color": "#8B5CF6"},
        {"name": "Hortas Comunitárias", "description": "Criação e manutenção de hortas comunitárias", "icon": "🌱", "color": "#14B8A6"},
        {"name": "Preservação de Mangues", "description": "Conservação e recuperação de manguezais", "icon": "🌿", "color": "#059669"}
    ]
    
    created_categories = {}
    for cat_data in categories:
        category, created = EventCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'icon': cat_data.get('icon', ''),
                'color': cat_data.get('color', '#007AFF')
            }
        )
        created_categories[cat_data['name']] = category
        print(f"Categoria '{category.name}' {'criada' if created else 'já existe'}")
    
    # Criar usuários de teste
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@mutiroes.com',
            'first_name': 'Admin',
            'last_name': 'Sistema',
            'is_staff': True,
            'is_superuser': True
        },
        {
            'username': 'maria_silva',
            'email': 'maria@email.com',
            'first_name': 'Maria',
            'last_name': 'Silva'
        },
        {
            'username': 'joao_santos',
            'email': 'joao@email.com',
            'first_name': 'João',
            'last_name': 'Santos'
        },
        {
            'username': 'ana_costa',
            'email': 'ana@email.com',
            'first_name': 'Ana',
            'last_name': 'Costa'
        }
    ]
    
    created_users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('123456')
            user.save()
        created_users.append(user)
        print(f"Usuário '{user.username}' {'criado' if created else 'já existe'}")
    
    # Criar perfis de usuário
    for user in created_users[1:]:  # Skip admin
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'bio': f'Perfil de {user.first_name} {user.last_name}',
                'city': 'São Paulo',
                'state': 'SP',
                'phone': '11999999999'
            }
        )
        print(f"Perfil para '{user.username}' {'criado' if created else 'já existe'}")
    
    # Criar eventos de teste
    now = timezone.now()
    events_data = [
        {
            'title': 'Limpeza da Praia de Copacabana',
            'description': 'Mutirão de limpeza na icônica praia de Copacabana. Vamos coletar lixo e conscientizar sobre a preservação marinha.',
            'start_date': now + timedelta(days=7),
            'end_date': now + timedelta(days=7, hours=4),
            'registration_deadline': now + timedelta(days=5),
            'address': 'Praia de Copacabana, Rio de Janeiro - RJ',
            'city': 'Rio de Janeiro',
            'state': 'RJ',
            'latitude': -22.9711,
            'longitude': -43.1822,
            'max_participants': 50,
            'min_age': 16,
            'category': created_categories.get('Limpeza de Praias'),
            'organizer': created_users[1],
            'status': 'published',
            'is_public': True,
            'requires_approval': False,
        },
        {
            'title': 'Plantio de Mudas no Parque Ibirapuera',
            'description': 'Participe do plantio de árvores nativas no Parque Ibirapuera. Contribua para um São Paulo mais verde!',
            'start_date': now + timedelta(days=14),
            'end_date': now + timedelta(days=14, hours=3),
            'registration_deadline': now + timedelta(days=12),
            'address': 'Parque Ibirapuera, São Paulo - SP',
            'city': 'São Paulo',
            'state': 'SP',
            'latitude': -23.5875,
            'longitude': -46.6572,
            'max_participants': 30,
            'min_age': 14,
            'category': created_categories.get('Plantio de Árvores'),
            'organizer': created_users[2],
            'status': 'published',
            'is_public': True,
            'requires_approval': False,
        },
        {
            'title': 'Limpeza do Rio Pinheiros',
            'description': 'Ação de limpeza e conscientização nas margens do Rio Pinheiros. Juntos pela revitalização do rio!',
            'start_date': now + timedelta(days=21),
            'end_date': now + timedelta(days=21, hours=5),
            'registration_deadline': now + timedelta(days=18),
            'address': 'Marginal Pinheiros, São Paulo - SP',
            'city': 'São Paulo',
            'state': 'SP',
            'latitude': -23.6065,
            'longitude': -46.6962,
            'max_participants': 40,
            'min_age': 18,
            'category': created_categories.get('Limpeza de Rios'),
            'organizer': created_users[3],
            'status': 'published',
            'is_public': True,
            'requires_approval': False,
        },
        {
            'title': 'Revitalização do Parque da Cidade',
            'description': 'Mutirão de limpeza e manutenção do Parque da Cidade. Vamos melhorar este espaço para todos!',
            'start_date': now + timedelta(days=10),
            'end_date': now + timedelta(days=10, hours=4),
            'registration_deadline': now + timedelta(days=8),
            'address': 'Parque da Cidade, Brasília - DF',
            'city': 'Brasília',
            'state': 'DF',
            'latitude': -15.8267,
            'longitude': -47.9218,
            'max_participants': 35,
            'min_age': 16,
            'category': created_categories.get('Limpeza de Parques'),
            'organizer': created_users[1],
            'status': 'published',
            'is_public': True,
            'requires_approval': False,
        }
    ]
    
    for event_data in events_data:
        event, created = Event.objects.get_or_create(
            title=event_data['title'],
            defaults=event_data
        )
        print(f"Evento '{event.title}' {'criado' if created else 'já existe'}")
    
    print("\nDados de teste criados com sucesso!")
    print(f"Total de categorias: {EventCategory.objects.count()}")
    print(f"Total de usuários: {User.objects.count()}")
    print(f"Total de eventos: {Event.objects.count()}")

if __name__ == '__main__':
    create_test_data()
