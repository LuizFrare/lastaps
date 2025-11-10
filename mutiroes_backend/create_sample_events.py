#!/usr/bin/env python
"""Script para criar eventos de exemplo"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mutiroes_backend.settings')
django.setup()

from django.contrib.auth.models import User
from events.models import Event, EventCategory
from django.utils import timezone

def main():
    print("🚀 Criando eventos de exemplo...\n")
    
    # Pegar ou criar usuário organizador
    try:
        organizer = User.objects.first()
        if not organizer:
            organizer = User.objects.create_user(
                username='admin',
                email='admin@mutiroes.com',
                password='admin123',
                first_name='Admin',
                last_name='Sistema'
            )
            print(f"✓ Usuário organizador criado: {organizer.username}")
    except Exception as e:
        print(f"❌ Erro ao criar organizador: {e}")
        return
    
    # Buscar categorias
    categories = {
        'praia': EventCategory.objects.filter(name__icontains='Praias').first(),
        'rio': EventCategory.objects.filter(name__icontains='Rios').first(),
        'arvore': EventCategory.objects.filter(name__icontains='Árvores').first(),
        'parque': EventCategory.objects.filter(name__icontains='Parques').first(),
    }
    
    # Eventos de exemplo
    events_data = [
        {
            "title": "Limpeza da Praia de Copacabana",
            "description": "Mutirão de limpeza na icônica praia de Copacabana. Vamos coletar lixo e conscientizar sobre a preservação marinha.",
            "category": categories['praia'],
            "address": "Praia de Copacabana, Rio de Janeiro - RJ",
            "latitude": -22.9711,
            "longitude": -43.1822,
            "city": "Rio de Janeiro",
            "state": "RJ",
            "start_date": timezone.now() + timedelta(days=7),
            "end_date": timezone.now() + timedelta(days=7, hours=4),
            "registration_deadline": timezone.now() + timedelta(days=5),
            "max_participants": 50,
            "min_age": 16,
        },
        {
            "title": "Plantio de Mudas no Parque Ibirapuera",
            "description": "Participe do plantio de árvores nativas no Parque Ibirapuera. Contribua para um São Paulo mais verde!",
            "category": categories['arvore'],
            "address": "Parque Ibirapuera, São Paulo - SP",
            "latitude": -23.5875,
            "longitude": -46.6572,
            "city": "São Paulo",
            "state": "SP",
            "start_date": timezone.now() + timedelta(days=14),
            "end_date": timezone.now() + timedelta(days=14, hours=3),
            "registration_deadline": timezone.now() + timedelta(days=12),
            "max_participants": 30,
            "min_age": 14,
        },
        {
            "title": "Limpeza do Rio Pinheiros",
            "description": "Ação de limpeza e conscientização nas margens do Rio Pinheiros. Juntos pela revitalização do rio!",
            "category": categories['rio'],
            "address": "Marginal Pinheiros, São Paulo - SP",
            "latitude": -23.6065,
            "longitude": -46.6962,
            "city": "São Paulo",
            "state": "SP",
            "start_date": timezone.now() + timedelta(days=21),
            "end_date": timezone.now() + timedelta(days=21, hours=5),
            "registration_deadline": timezone.now() + timedelta(days=18),
            "max_participants": 40,
            "min_age": 18,
        },
        {
            "title": "Revitalização do Parque da Cidade",
            "description": "Mutirão de limpeza e manutenção do Parque da Cidade. Vamos melhorar este espaço para todos!",
            "category": categories['parque'],
            "address": "Parque da Cidade, Brasília - DF",
            "latitude": -15.8267,
            "longitude": -47.9218,
            "city": "Brasília",
            "state": "DF",
            "start_date": timezone.now() + timedelta(days=10),
            "end_date": timezone.now() + timedelta(days=10, hours=4),
            "registration_deadline": timezone.now() + timedelta(days=8),
            "max_participants": 35,
            "min_age": 16,
        },
    ]
    
    created_count = 0
    for event_data in events_data:
        if not event_data['category']:
            print(f"⚠️  Categoria não encontrada para: {event_data['title']}")
            continue
            
        event, created = Event.objects.get_or_create(
            title=event_data['title'],
            defaults={
                **event_data,
                'organizer': organizer,
                'status': 'published',
                'is_public': True,
                'requires_approval': False,
            }
        )
        if created:
            created_count += 1
            print(f"✓ Criado: {event.title}")
        else:
            print(f"- Já existe: {event.title}")
    
    print(f"\n✅ Total: {created_count} eventos criados")
    print(f"📊 Total no banco: {Event.objects.count()} eventos")

if __name__ == '__main__':
    main()
