#!/usr/bin/env python
"""Script para criar categorias de eventos"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mutiroes_backend.settings')
django.setup()

from events.models import EventCategory

# Criar categorias
categories = [
    {
        "name": "Limpeza de Praias",
        "description": "Mutirões de limpeza de praias e orlas marítimas",
        "icon": "🏖️",
        "color": "#0EA5E9"
    },
    {
        "name": "Limpeza de Rios",
        "description": "Limpeza e preservação de rios e córregos",
        "icon": "🌊",
        "color": "#06B6D4"
    },
    {
        "name": "Plantio de Árvores",
        "description": "Reflorestamento e plantio de mudas",
        "icon": "🌳",
        "color": "#10B981"
    },
    {
        "name": "Limpeza de Parques",
        "description": "Manutenção e limpeza de parques e áreas verdes urbanas",
        "icon": "🏞️",
        "color": "#22C55E"
    },
    {
        "name": "Reciclagem",
        "description": "Coleta seletiva e projetos de reciclagem",
        "icon": "♻️",
        "color": "#84CC16"
    },
    {
        "name": "Educação Ambiental",
        "description": "Palestras, workshops e atividades educativas",
        "icon": "📚",
        "color": "#F59E0B"
    },
    {
        "name": "Limpeza Urbana",
        "description": "Limpeza de ruas, calçadas e espaços públicos",
        "icon": "🏙️",
        "color": "#EF4444"
    },
    {
        "name": "Proteção Animal",
        "description": "Cuidado e proteção da fauna local",
        "icon": "🦜",
        "color": "#8B5CF6"
    },
    {
        "name": "Hortas Comunitárias",
        "description": "Criação e manutenção de hortas comunitárias",
        "icon": "🌱",
        "color": "#14B8A6"
    },
    {
        "name": "Preservação de Mangues",
        "description": "Conservação e recuperação de manguezais",
        "icon": "🌿",
        "color": "#059669"
    }
]

def main():
    print("🚀 Criando categorias de eventos...\n")
    
    created_count = 0
    for cat_data in categories:
        category, created = EventCategory.objects.get_or_create(
            name=cat_data["name"],
            defaults={
                "description": cat_data["description"],
                "icon": cat_data["icon"],
                "color": cat_data["color"]
            }
        )
        if created:
            created_count += 1
            print(f"✓ Criada: {category.name} ({category.icon})")
        else:
            print(f"- Já existe: {category.name} ({category.icon})")
    
    print(f"\n✅ Total: {created_count} categorias criadas")
    print(f"📊 Total no banco: {EventCategory.objects.count()} categorias")

if __name__ == '__main__':
    main()
