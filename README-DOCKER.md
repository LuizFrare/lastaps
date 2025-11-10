# 🐳 Guia Docker - Mutirões Backend

## 📦 Visão Geral

Este projeto agora possui um **único arquivo `docker-compose.yml`** simplificado e funcional que executa apenas o **backend** da aplicação com toda a infraestrutura necessária.

## 🏗️ Arquitetura Docker

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  mutiroes-backend (Django API)                  │
│  └─ Port: 8000                                  │
│  └─ Health Check: /health/                     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  mutiroes-redis (Message Broker)                │
│  └─ Port: 6379                                  │
│  └─ Usado por Celery                           │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  mutiroes-celery-worker (Tasks Async)           │
│  └─ 2 workers concorrentes                     │
│  └─ Tarefas: emails, limpeza, relatórios      │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  mutiroes-celery-beat (Scheduler)               │
│  └─ Agenda tarefas periódicas                  │
│  └─ Database scheduler (django-celery-beat)    │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🚀 Como Usar

### 1️⃣ Iniciar todos os serviços

```bash
docker-compose up -d --build
```

### 2️⃣ Verificar status

```bash
docker-compose ps
```

**Saída esperada:**

```
NAME                     STATUS                PORTS
mutiroes-backend         Up (healthy)          0.0.0.0:8000->8000/tcp
mutiroes-redis           Up (healthy)          0.0.0.0:6379->6379/tcp
mutiroes-celery-worker   Up                    8000/tcp
mutiroes-celery-beat     Up                    8000/tcp
```

### 3️⃣ Testar a API

```bash
# Health check
curl http://localhost:8000/health/

# Listar eventos
curl http://localhost:8000/api/events/

# Categorias
curl http://localhost:8000/api/events/categories/
```

### 4️⃣ Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Backend apenas
docker-compose logs -f backend

# Celery worker
docker-compose logs -f celery-worker

# Celery beat
docker-compose logs -f celery-beat

# Redis
docker-compose logs -f redis
```

### 5️⃣ Parar serviços

```bash
# Parar (preserva volumes)
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v
```

### 6️⃣ Acessar shell de um container

```bash
# Shell do backend
docker-compose exec backend sh

# Shell do Django
docker-compose exec backend python manage.py shell

# Criar superusuário
docker-compose exec backend python manage.py createsuperuser

# Migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

## 📊 Volumes Persistentes

O Docker Compose cria 3 volumes para persistir dados:

- **redis_data**: Dados do Redis (cache, filas Celery)
- **backend_media**: Arquivos de mídia (fotos de eventos, avatares)
- **backend_static**: Arquivos estáticos (CSS, JS, imagens)

Para limpar volumes antigos:

```bash
docker volume prune
```

## 🔧 Variáveis de Ambiente

As variáveis de ambiente estão definidas diretamente no `docker-compose.yml`:

```yaml
environment:
  - DEBUG=True
  - SECRET_KEY=django-insecure-development-key-change-in-production
  - DATABASE_URL=sqlite:///db.sqlite3
  - CELERY_BROKER_URL=redis://redis:6379/0
  - CELERY_RESULT_BACKEND=redis://redis:6379/0
```

Para produção, use um arquivo `.env` ou configure as variáveis diretamente no servidor.

## 🏥 Health Checks

Todos os serviços possuem health checks configurados:

- **Backend**: `curl http://localhost:8000/health/` (a cada 30s)
- **Redis**: `redis-cli ping` (a cada 30s)

Isso garante que o Docker reinicie automaticamente containers que falharem.

## 🔄 Restart Policy

Todos os serviços estão configurados com `restart: unless-stopped`, ou seja:

- Reiniciam automaticamente em caso de falha
- Não reiniciam se você parar manualmente com `docker-compose stop`
- Iniciam automaticamente após reboot do sistema

## 📝 Comandos Úteis

```bash
# Rebuild sem cache
docker-compose build --no-cache

# Rebuild apenas um serviço
docker-compose build backend

# Escalar workers do Celery
docker-compose up -d --scale celery-worker=3

# Ver recursos consumidos
docker stats

# Limpar tudo (containers, volumes, imagens órfãs)
docker-compose down -v --rmi local
```

## 🎯 Endpoints Disponíveis

Após subir os containers, você pode acessar:

- **API**: <http://localhost:8000/api/>
- **Admin Django**: <http://localhost:8000/admin/>
- **Health Check**: <http://localhost:8000/health/>
- **Eventos**: <http://localhost:8000/api/events/>
- **Usuários**: <http://localhost:8000/api/users/>
- **Token JWT**: <http://localhost:8000/api/token/>

## ⚠️ Notas Importantes

1. **Banco de dados**: Atualmente usando SQLite (arquivo `db.sqlite3`). Para produção, migre para PostgreSQL.

2. **Migrações**: Na primeira execução, as migrações são executadas automaticamente pelo comando:

   ```yaml
   command: sh -c "python manage.py migrate && python manage.py collectstatic --noinput && python manage.py runserver 0.0.0.0:8000"
   ```

3. **Dados de teste**: Para popular o banco com dados de exemplo:

   ```bash
   docker-compose exec backend python populate_data.py
   ```

4. **Celery Beat**: Usa `DatabaseScheduler` para armazenar agendamentos no banco de dados Django.

## 🚀 Próximos Passos (Produção)

Para colocar em produção, considere:

1. Substituir SQLite por PostgreSQL
2. Adicionar Nginx como reverse proxy
3. Usar Gunicorn em vez de `runserver`
4. Configurar HTTPS/SSL
5. Usar variáveis de ambiente seguras (não hardcoded)
6. Configurar backup automático dos volumes
7. Implementar monitoramento (Flower, Prometheus, Grafana)

## 📚 Referências

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Docker Best Practices](https://docs.docker.com/samples/django/)
- [Celery Docker](https://docs.celeryproject.org/en/stable/userguide/configuration.html)
