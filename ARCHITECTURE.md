# Arquitetura do Sistema - Mutirões

## 📊 Visão Geral

Este projeto implementa uma **arquitetura monolítica moderna** com processamento assíncrono, seguindo boas práticas de desenvolvimento e containerização.

### Classificação da Arquitetura

- ✅ **Monolito Modular** - Backend único com apps Django organizados
- ✅ **Processamento Assíncrono** - Celery para tarefas em background
- ✅ **Containerizado** - Docker Compose para orquestração
- ✅ **Separação Frontend/Backend** - Next.js (frontend) + Django (backend)

### Stack Tecnológica

**Backend:**
- Django 4.2.7 + Django REST Framework 3.14.0
- Python 3.11
- JWT Authentication (djangorestframework-simplejwt)
- Celery 5.3.4 para tasks assíncronas
- Redis 7 como message broker
- SQLite (dev) / PostgreSQL (prod)

**Frontend:**
- Next.js 15.5.4 (React 19)
- TypeScript 5
- Tailwind CSS 3.4.18

**Infraestrutura:**
- Docker & Docker Compose
- Gunicorn (WSGI server para produção)

## 🏗️ Arquitetura de Componentes

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Frontend (Next.js)                                 │
│  - React Components                                 │
│  - Client-side routing                              │
│  - API client                                       │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST
                   ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Backend Django (Monolito)                          │
│  ┌─────────────────────────────────────────┐       │
│  │  Apps Django:                            │       │
│  │  - events/ (CRUD eventos, participantes) │       │
│  │  - users/ (Autenticação, perfil)         │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  APIs REST:                                         │
│  - /api/events/                                     │
│  - /api/users/                                      │
│  - /api/token/ (JWT)                                │
│                                                     │
└────────┬────────────────────┬───────────────────────┘
         │                    │
         ↓                    ↓
    ┌────────┐          ┌──────────┐
    │ SQLite │          │  Redis   │
    │   /    │          │ (broker) │
    │Postgres│          └─────┬────┘
    └────────┘                │
                              ↓
                    ┌─────────────────────┐
                    │  Celery Workers     │
                    │  - Email tasks      │
                    │  - Cleanup tasks    │
                    │  - Report tasks     │
                    └─────────────────────┘
                              ↑
                    ┌─────────┴─────────┐
                    │  Celery Beat      │
                    │  (Scheduler)      │
                    └───────────────────┘
```

## 📦 Estrutura de Containers (Docker Compose)

### Containers Ativos

| Container | Descrição | Porta | Papel |
|-----------|-----------|-------|-------|
| `mutiroes-backend` | Django API | 8000 | Servidor principal da API REST |
| `mutiroes-redis` | Redis 7 | 6379 | Message broker para Celery |
| `mutiroes-celery-worker` | Celery Worker | - | Processa tasks assíncronas |
| `mutiroes-celery-beat` | Celery Beat | - | Agenda tasks periódicas |

### Volumes Persistentes

- `redis_data` - Dados do Redis (filas, cache)
- `backend_media` - Arquivos de mídia (fotos de eventos, avatares)
- `backend_static` - Arquivos estáticos (CSS, JS, imagens)

## 🔄 Fluxo de Dados

### 1. Requisição Síncrona (CRUD)

```
Usuario → Frontend → API Backend → Database → Response
```

**Exemplo:** Listar eventos, criar evento, fazer check-in

### 2. Processamento Assíncrono

```
API Backend → Redis (enfileira) → Celery Worker → Executa task
```

**Exemplo:** Enviar email de boas-vindas após registro

### 3. Tasks Periódicas

```
Celery Beat → Agenda task → Redis → Celery Worker → Executa
```

**Exemplo:** Limpeza de eventos expirados (diariamente às 2h)

## 🎯 Apps Django (Módulos)

### `events/` - Gestão de Eventos

**Models:**
- `EventCategory` - Categorias (Limpeza, Plantio, Monitoramento, Educação)
- `Event` - Evento principal com localização, datas, capacidade
- `EventParticipant` - Participantes inscritos com check-in
- `EventResource` - Recursos necessários (ferramentas, materiais)
- `EventPhoto` - Fotos antes/depois dos eventos
- `EventComment` - Comentários nos eventos
- `EventReport` - Relatórios de impacto pós-evento

**Endpoints:**
```
GET    /api/events/              - Lista eventos
POST   /api/events/              - Cria evento
GET    /api/events/{id}/         - Detalhes do evento
PUT    /api/events/{id}/         - Atualiza evento
DELETE /api/events/{id}/         - Deleta evento
POST   /api/events/{id}/join/    - Inscrever-se no evento
POST   /api/events/{id}/leave/   - Cancelar inscrição
POST   /api/events/{id}/check_in/- Fazer check-in
GET    /api/events/{id}/stats/   - Estatísticas do evento
GET    /api/events/my_events/    - Eventos do usuário
GET    /api/events/nearby/       - Eventos próximos
GET    /api/events/categories/   - Lista categorias
```

### `users/` - Gestão de Usuários

**Funcionalidades:**
- Registro de usuário
- Autenticação JWT
- Perfil do usuário
- Histórico de participação em eventos

**Endpoints:**
```
POST /api/token/          - Login (gera access + refresh token)
POST /api/token/refresh/  - Renova access token
POST /api/users/register/ - Registro de novo usuário
GET  /api/users/profile/  - Perfil do usuário autenticado
```

## ⚡ Celery - Processamento Assíncrono

### Tasks Implementadas

#### 1. **Email Tasks** (`users/tasks.py`)
```python
@shared_task
def send_welcome_email(user_id):
    """Envia email de boas-vindas após registro"""
```

#### 2. **Event Tasks** (`events/tasks.py`)
```python
@shared_task
def cleanup_expired_events():
    """Remove eventos expirados (scheduled: diariamente às 2h)"""

@shared_task
def generate_monthly_impact_report():
    """Gera relatório mensal de impacto (scheduled: 1º dia às 3h)"""
```

### Configuração do Celery Beat

```python
CELERY_BEAT_SCHEDULE = {
    'cleanup-expired-events': {
        'task': 'events.tasks.cleanup_expired_events',
        'schedule': crontab(hour=2, minute=0),  # Diariamente às 2h
    },
    'generate-monthly-report': {
        'task': 'events.tasks.generate_monthly_impact_report',
        'schedule': crontab(day_of_month=1, hour=3, minute=0),  # 1º do mês às 3h
    },
}
```

### Celery Workers

- **Concorrência:** 2 workers simultâneos
- **Broker:** Redis
- **Result Backend:** Redis
- **Serialização:** JSON

## 🔒 Segurança e Autenticação

### JWT Authentication

```python
# Token de acesso: válido por 60 minutos
# Token de refresh: válido por 7 dias
# Rotação automática de tokens
```

**Fluxo:**
1. Login → Gera `access_token` + `refresh_token`
2. Requisições autenticadas → Header: `Authorization: Bearer {access_token}`
3. Token expirado → Usar `refresh_token` para gerar novo `access_token`

### Permissões

- **IsAuthenticated** - Requerido para criar eventos, participar, comentar
- **IsAuthenticatedOrReadOnly** - Listagem pública, ações requerem autenticação

## 📊 Padrões e Boas Práticas

### ✅ Implementados

1. **REST API** - Endpoints RESTful seguindo convenções
2. **JWT Stateless Authentication** - Sem sessões no servidor
3. **Containerização** - Docker para todos os componentes
4. **Async Processing** - Celery para operações demoradas
5. **Health Checks** - Endpoint `/health/` para monitoramento
6. **CORS** - Configurado para comunicação frontend/backend
7. **Filtros e Busca** - django-filter para queries complexas
8. **Paginação** - 20 itens por página por padrão
9. **Serialização** - DRF serializers para validação de dados

### 🎨 Frontend - Design Patterns

1. **Component-Based** - Componentes React reutilizáveis
2. **Hooks** - Custom hooks para lógica compartilhada
3. **Context API** - `AuthContext` para estado de autenticação
4. **Client-Side Routing** - Next.js App Router
5. **API Client** - Classe centralizada para chamadas HTTP
6. **Type Safety** - TypeScript em todo frontend

## 🚀 Deployment

### Desenvolvimento

```bash
# Backend local
cd mutiroes_backend
python manage.py runserver

# Frontend local
cd mutiroes-frontend
npm run dev

# Docker Compose
docker-compose up -d
```

### Produção (Recomendações)

**Backend:**
- ✅ Usar Gunicorn (já configurado no Dockerfile)
- ✅ PostgreSQL em vez de SQLite
- ✅ Nginx como reverse proxy
- ✅ HTTPS/SSL
- ✅ Variáveis de ambiente seguras
- ✅ `DEBUG=False`

**Frontend:**
- ✅ Build otimizado: `npm run build`
- ✅ Servir via Nginx ou CDN
- ✅ Server-Side Rendering (SSR) habilitado

**Infraestrutura:**
- ✅ Redis persistente
- ✅ Backup automático do banco
- ✅ Monitoramento (logs, métricas)
- ✅ Auto-scaling do Celery workers

## 📈 Escalabilidade

### Limitações Atuais (Monolito)

- ❌ Backend é single-point-of-failure
- ❌ Não há load balancing
- ❌ Não há replicação de database
- ❌ Redis não tem failover

### Como Escalar (Futuro)

**Horizontal Scaling:**
1. Adicionar múltiplas instâncias do backend
2. Nginx como load balancer
3. PostgreSQL com replicação master-slave
4. Redis Sentinel para high availability

**Vertical Scaling:**
1. Aumentar recursos dos containers
2. Otimizar queries do banco
3. Adicionar índices apropriados
4. Cache agressivo com Redis

## 🔍 Monitoramento

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health/

# Readiness (banco + redis disponíveis)
curl http://localhost:8000/readiness/

# Liveness (processo ativo)
curl http://localhost:8000/liveness/
```

### Logs

```bash
# Backend
docker-compose logs -f backend

# Celery Worker
docker-compose logs -f celery-worker

# Celery Beat
docker-compose logs -f celery-beat

# Redis
docker-compose logs -f redis
```

## 🔧 Resiliência

### Patterns Implementados

**Circuit Breaker** (`mutiroes_backend/resilience.py`)
```python
# Proteção para chamadas externas
# Estados: Closed → Open → Half-Open
# Falhas máximas: 5
# Timeout de reset: 60s
```

**Retry com Exponential Backoff**
```python
# Máximo de tentativas: 3
# Backoff: 1s, 2s, 4s, 8s, ...
# Timeout máximo: 10s
```

### Restart Policies

Todos os containers têm `restart: unless-stopped`:
- Reiniciam automaticamente em caso de falha
- Iniciam automaticamente após reboot do sistema

## 📚 Referências

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Compose](https://docs.docker.com/compose/)

---

**Conclusão:** Este é um sistema **monolítico bem estruturado** com processamento assíncrono, não um sistema distribuído. É adequado para aplicações de pequeno a médio porte e pode ser escalado verticalmente ou evoluído para microserviços no futuro se necessário.

### 1. Processamento Assíncrono (Celery)

**Tasks Implementadas:**
- `send_event_notification_email`: Envio de emails de notificação de eventos
- `send_bulk_event_reminders`: Envio em massa de lembretes de eventos
- `process_event_report_statistics`: Processamento de estatísticas de relatórios
- `generate_monthly_impact_report`: Geração de relatório mensal de impacto ambiental
- `cleanup_expired_events`: Limpeza automática de eventos expirados
- `update_user_statistics`: Atualização de estatísticas de usuário
- `check_and_award_badges`: Verificação e atribuição automática de badges

**Celery Beat - Tarefas Periódicas:**
- Limpeza de eventos expirados: diariamente às 2h
- Relatório mensal: primeiro dia do mês às 3h

**Workers:**
- 2 workers Celery para processamento paralelo
- 1 Celery Beat para agendamento de tarefas

### 2. API Gateway (Nginx)

**Funcionalidades:**
- **Load Balancing:** Distribuição de carga entre 3 instâncias do backend usando algoritmo `least_conn`
- **Rate Limiting:** 
  - API: 10 requisições/segundo por IP
  - Auth: 5 requisições/minuto por IP
- **Connection Limiting:** Máximo de 10 conexões simultâneas por IP
- **Cache:** Cache de arquivos estáticos e media com Redis
- **Health Checks:** Monitoramento automático de saúde dos serviços
- **CORS:** Configuração de headers CORS
- **Security Headers:** X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

**Endpoints:**
- `/api/*` → Backend Django (load balanced)
- `/health` → Health check do API Gateway
- `/nginx_status` → Métricas do Nginx (restrito)

### 3. Service Discovery (Consul)

**Recursos:**
- Service Registry para todos os serviços
- Health checks automáticos
- Service mesh capabilities
- UI de monitoramento em http://localhost:8500

### 4. Escalabilidade e Replicação

**Backend Django:**
- 3 réplicas (backend1, backend2, backend3)
- Gunicorn com 4 workers cada
- Health checks configurados
- Compartilhamento de media e static files via volumes

**Frontend Next.js:**
- 2 réplicas (frontend1, frontend2)
- Load balancing via Nginx
- Health checks configurados

**Database:**
- PostgreSQL 15 com capacidade de replicação
- Volumes persistentes

**Cache/Message Broker:**
- Redis Master-Slave replication
- Redis Sentinel para failover automático
- 3 instâncias: master, slave, sentinel

### 5. Resiliência e Fault Tolerance

**Circuit Breaker:**
- Proteção para chamadas externas
- Proteção para database
- Proteção para Redis
- Estados: Closed → Open → Half-Open

**Retry Patterns:**
- Exponential backoff
- Máximo de 3 tentativas
- Logging de falhas

**Fallback Mechanisms:**
- Valores padrão em caso de falha
- Degradação graciosa de funcionalidades

### 6. Monitoramento

**Flower:** Monitor do Celery em http://localhost:5555
**Consul UI:** Service discovery em http://localhost:8500
**Nginx Status:** Métricas em http://localhost/nginx_status

## Rodando o Sistema Completo

### Pré-requisitos
```bash
- Docker e Docker Compose
- 4GB RAM mínimo
- 10GB disco disponível
```

### Iniciar Sistema Distribuído

```bash
# Build e start de todos os serviços
docker-compose -f docker-compose.distributed.yml up --build

# Start em background
docker-compose -f docker-compose.distributed.yml up -d

# Ver logs
docker-compose -f docker-compose.distributed.yml logs -f

# Escalar serviços
docker-compose -f docker-compose.distributed.yml up --scale backend1=5

# Parar sistema
docker-compose -f docker-compose.distributed.yml down

# Parar e limpar volumes
docker-compose -f docker-compose.distributed.yml down -v
```

### Acessando os Serviços

- **Aplicação:** http://localhost
- **API:** http://localhost/api
- **Admin Django:** http://localhost/admin
- **Flower (Celery):** http://localhost:5555
- **Consul UI:** http://localhost:8500
- **Health Check:** http://localhost/health

### Health Checks

```bash
# Backend health
curl http://localhost/health

# Readiness probe
curl http://localhost/readiness

# Liveness probe
curl http://localhost/liveness

# Nginx status
curl http://localhost/nginx_status
```

## Arquitetura de Rede

```
Internet
   ↓
API Gateway (Nginx) :80
   ↓
   ├─→ Backend 1 :8000 ──┐
   ├─→ Backend 2 :8000 ──┼─→ PostgreSQL :5432
   ├─→ Backend 3 :8000 ──┘      ↓
   ↓                         Redis Master :6379
Frontend 1 :3000                  ↓
Frontend 2 :3000            Redis Slave :6379
                                  ↓
   Celery Worker 1 ───────→ Redis Sentinel
   Celery Worker 2 ───────→
   Celery Beat ────────────→
                                  ↓
                            Consul :8500
```

## Características de Sistema Distribuído

✅ **Processamento Assíncrono:** Celery com tasks para operações demoradas
✅ **API Gateway:** Nginx com load balancing e rate limiting
✅ **Service Discovery:** Consul para registro e descoberta de serviços
✅ **Escalabilidade Horizontal:** Múltiplas réplicas de backend e frontend
✅ **Load Balancing:** Distribuição automática de carga
✅ **High Availability:** Redis Sentinel para failover
✅ **Database Replication:** PostgreSQL com suporte a replicação
✅ **Circuit Breaker:** Proteção contra falhas em cascata
✅ **Retry Patterns:** Retenção automática com exponential backoff
✅ **Health Checks:** Monitoramento contínuo de saúde dos serviços
✅ **Caching:** Cache distribuído com Redis
✅ **Logging:** Logs centralizados
✅ **Monitoring:** Flower para Celery, Consul UI para serviços

## Próximos Passos

- [ ] Adicionar Prometheus + Grafana para métricas
- [ ] Implementar ELK Stack para logs centralizados
- [ ] Adicionar Kubernetes manifests
- [ ] Implementar service mesh com Istio
- [ ] Adicionar OpenTelemetry para tracing distribuído
