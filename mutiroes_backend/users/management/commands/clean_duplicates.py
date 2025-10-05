from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from collections import defaultdict


class Command(BaseCommand):
    help = 'Remove usuários duplicados com o mesmo email, mantendo o mais antigo'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=== Limpando usuários duplicados ===\n'))
        
        # Agrupar usuários por email
        email_groups = defaultdict(list)
        for user in User.objects.all():
            if user.email:
                email_groups[user.email].append(user)
        
        # Processar duplicatas
        total_removed = 0
        
        for email, users in email_groups.items():
            if len(users) > 1:
                self.stdout.write(f"\nEmail: {email}")
                self.stdout.write(f"  Encontrados {len(users)} usuários:")
                
                # Ordenar por data de criação (manter o mais antigo)
                users_sorted = sorted(users, key=lambda u: u.date_joined)
                keep = users_sorted[0]
                duplicates = users_sorted[1:]
                
                self.stdout.write(self.style.SUCCESS(
                    f"  ✓ Mantendo: {keep.username} (ID: {keep.id}, criado em {keep.date_joined})"
                ))
                
                for dup in duplicates:
                    self.stdout.write(self.style.WARNING(
                        f"  ✗ Removendo: {dup.username} (ID: {dup.id}, criado em {dup.date_joined})"
                    ))
                    dup.delete()
                    total_removed += 1
        
        self.stdout.write(self.style.SUCCESS(
            f"\n\n=== Total de usuários removidos: {total_removed} ==="
        ))
        
        # Mostrar estatísticas finais
        self.stdout.write(self.style.SUCCESS('\n=== Usuários restantes ==='))
        for user in User.objects.all().order_by('email'):
            self.stdout.write(f"  {user.username} - {user.email} - {user.first_name} {user.last_name}")
