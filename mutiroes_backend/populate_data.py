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
        {'name': 'Limpeza', 'description': 'Eventos de limpeza de praias, rios e áreas urbanas'},
        {'name': 'Plantio', 'description': 'Eventos de plantio de árvores e reflorestamento'},
        {'name': 'Monitoramento', 'description': 'Eventos de monitoramento ambiental'},
        {'name': 'Educação', 'description': 'Eventos de educação ambiental'},
    ]
    
    created_categories = []
    for cat_data in categories:
        category, created = EventCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        created_categories.append(category)
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
            'description': 'Vamos limpar a praia mais famosa do Rio de Janeiro e conscientizar os banhistas sobre a importância de preservar nossos oceanos. Traga sua família e amigos para fazer a diferença!',
            'start_date': now + timedelta(days=7),
            'end_date': now + timedelta(days=7, hours=4),
            'registration_deadline': now + timedelta(days=5),
            'address': 'Praia de Copacabana, Rio de Janeiro, RJ',
            'city': 'Rio de Janeiro',
            'state': 'RJ',
            'latitude': -22.9711,
            'longitude': -43.1822,
            'max_participants': 50,
            'category': created_categories[0],  # Limpeza
            'organizer': created_users[1],  # Maria Silva
            'status': 'published',
            'is_public': True,
            'requires_approval': False,
            'required_tools': 'Luvas, sacos de lixo, protetor solar',
            'provided_tools': 'Luvas, sacos de lixo, água',
            'what_to_bring': 'Roupa confortável, protetor solar, garrafa de água'
        },
        {
            'title': 'Plantio de Mudas no Parque Ibirapuera',
            'description': 'Ajude a reflorestar o Parque Ibirapuera plantando mudas de árvores nativas da Mata Atlântica. Vamos plantar 200 mudas de árvores nativas.',
            'start_date': now + timedelta(days=10),
            'end_date': now + timedelta(days=10, hours=4),
            'registration_deadline': now + timedelta(days=8),
            'address': 'Parque Ibirapuera, São Paulo, SP',
            'city': 'São Paulo',
            'state': 'SP',
            'latitude': -23.5874,
            'longitude': -46.6576,
            'max_participants': 40,
            'category': created_categories[1],  # Plantio
            'organizer': created_users[2],  # João Santos
            'status': 'published',
            'is_public': True,
            'requires_approval': False,
            'required_tools': 'Pá, enxada, luvas',
            'provided_tools': 'Mudas, ferramentas, água',
            'what_to_bring': 'Roupa confortável, protetor solar, garrafa de água'
        },
        {
            'title': 'Monitoramento da Qualidade do Ar',
            'description': 'Participe da coleta de dados sobre a qualidade do ar em diferentes pontos da cidade para análise científica.',
            'start_date': now + timedelta(days=14),
            'end_date': now + timedelta(days=14, hours=4),
            'registration_deadline': now + timedelta(days=12),
            'address': 'Centro de Belo Horizonte, MG',
            'city': 'Belo Horizonte',
            'state': 'MG',
            'latitude': -19.9167,
            'longitude': -43.9345,
            'max_participants': 25,
            'category': created_categories[2],  # Monitoramento
            'organizer': created_users[3],  # Ana Costa
            'status': 'published',
            'is_public': True,
            'requires_approval': False,
            'required_tools': 'Smartphone com GPS',
            'provided_tools': 'Equipamentos de medição, planilhas',
            'what_to_bring': 'Smartphone carregado, roupa confortável'
        },
        {
            'title': 'Limpeza do Rio Tietê',
            'description': 'Ajude a limpar as margens do Rio Tietê e conscientizar a população sobre a importância de preservar nossos rios.',
            'start_date': now + timedelta(days=21),
            'end_date': now + timedelta(days=21, hours=4),
            'registration_deadline': now + timedelta(days=19),
            'address': 'Margem do Rio Tietê, São Paulo, SP',
            'city': 'São Paulo',
            'state': 'SP',
            'latitude': -23.5505,
            'longitude': -46.6333,
            'max_participants': 35,
            'category': created_categories[0],  # Limpeza
            'organizer': created_users[1],  # Maria Silva
            'status': 'published',
            'is_public': True,
            'requires_approval': False,
            'required_tools': 'Luvas, botas, protetor solar',
            'provided_tools': 'Luvas, sacos de lixo, água, lanche',
            'what_to_bring': 'Roupa confortável, protetor solar, garrafa de água'
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
