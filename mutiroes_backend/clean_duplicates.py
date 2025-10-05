#!/usr/bin/env python
"""Script para limpar usuários duplicados"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mutiroes_backend.settings')
django.setup()

from django.contrib.auth.models import User
from collections import defaultdict

# Agrupar usuários por email
email_groups = defaultdict(list)
for user in User.objects.all():
    if user.email:
        email_groups[user.email].append(user)

# Processar duplicatas
print("=== Limpando usuários duplicados ===\n")
total_removed = 0

for email, users in email_groups.items():
    if len(users) > 1:
        print(f"Email: {email}")
        print(f"  Encontrados {len(users)} usuários:")
        
        # Ordenar por data de criação (manter o mais antigo)
        users_sorted = sorted(users, key=lambda u: u.date_joined)
        keep = users_sorted[0]
        duplicates = users_sorted[1:]
        
        print(f"  ✓ Mantendo: {keep.username} (criado em {keep.date_joined})")
        
        for dup in duplicates:
            print(f"  ✗ Removendo: {dup.username} (criado em {dup.date_joined})")
            dup.delete()
            total_removed += 1
        
        print()

print(f"\n=== Total de usuários removidos: {total_removed} ===")

# Mostrar estatísticas finais
print("\n=== Usuários restantes ===")
for user in User.objects.all().order_by('email'):
    print(f"  {user.username} - {user.email} - {user.first_name} {user.last_name}")
