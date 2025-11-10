# Arquitetura do Sistema Distribuído - Mutirões# Arquitetura do Sistema - Mutirões



## 📊 Visão Geral## 📊 Visão Geral



Este projeto implementa uma **arquitetura distribuída** com múltiplas réplicas, load balancing, banco de dados compartilhado e processamento assíncrono escalável.Este projeto implementa uma **arquitetura monolítica moderna** com processamento assíncrono, seguindo boas práticas de desenvolvimento e containerização.



### Classificação da Arquitetura### Classificação da Arquitetura



- ✅ **Sistema Distribuído** - Múltiplas réplicas do backend com load balancing- ✅ **Monolito Modular** - Backend único com apps Django organizados

- ✅ **Escalabilidade Horizontal** - Possibilidade de adicionar mais réplicas sob demanda- ✅ **Processamento Assíncrono** - Celery para tarefas em background

- ✅ **Processamento Assíncrono Distribuído** - Múltiplos Celery workers- ✅ **Containerizado** - Docker Compose para orquestração

- ✅ **Containerizado** - Docker Compose para orquestração- ✅ **Separação Frontend/Backend** - Next.js (frontend) + Django (backend)

- ✅ **Separação Frontend/Backend** - Next.js (frontend) + Django (backend)

### Stack Tecnológica

### Stack Tecnológica

**Backend:**

**Backend:**- Django 4.2.7 + Django REST Framework 3.14.0

- Django 4.2.7 + Django REST Framework 3.14.0- Python 3.11

- Python 3.11- JWT Authentication (djangorestframework-simplejwt)

- JWT Authentication (djangorestframework-simplejwt)- Celery 5.3.4 para tasks assíncronas

- Celery 5.3.4 para tasks assíncronas (2 workers)- Redis 7 como message broker

- Redis 7 como message broker e cache- SQLite (dev) / PostgreSQL (prod)

- PostgreSQL 15 (banco de dados relacional compartilhado)

- Gunicorn (WSGI server - 4 workers por réplica)**Frontend:**

- Next.js 15.5.4 (React 19)

**Load Balancer:**- TypeScript 5

- Nginx - distribuição de carga entre réplicas- Tailwind CSS 3.4.18

- Rate limiting e proteção contra DDoS

- Cache de arquivos estáticos**Infraestrutura:**

- Docker & Docker Compose

**Frontend:**- Gunicorn (WSGI server para produção)

- Next.js 15.5.4 (React 19)

- TypeScript 5## 🏗️ Arquitetura de Componentes

- Tailwind CSS 3.4.18

```

**Infraestrutura:**┌─────────────────────────────────────────────────────┐

- Docker & Docker Compose│                                                     │

- 8 containers principais│  Frontend (Next.js)                                 │

- Volumes compartilhados para persistência│  - React Components                                 │

│  - Client-side routing                              │

## 🏗️ Arquitetura de Componentes│  - API client                                       │

│                                                     │

```└──────────────────┬──────────────────────────────────┘

                           Internet/Usuários                   │ HTTP/REST

                                  ↓                   ↓

                    ┌─────────────────────────┐┌─────────────────────────────────────────────────────┐

                    │   Nginx Load Balancer   ││                                                     │

                    │   - Rate Limiting       ││  Backend Django (Monolito)                          │

                    │   - Health Checks       ││  ┌─────────────────────────────────────────┐       │

                    │   - SSL/TLS Ready       ││  │  Apps Django:                            │       │

                    └───────────┬─────────────┘│  │  - events/ (CRUD eventos, participantes) │       │

                                ││  │  - users/ (Autenticação, perfil)         │       │

                 ┌──────────────┼──────────────┐│  └─────────────────────────────────────────┘       │

                 ↓              ↓              ↓│                                                     │

          ┌──────────┐   ┌──────────┐   ┌──────────┐│  APIs REST:                                         │

          │ Backend1 │   │ Backend2 │   │ Backend3 ││  - /api/events/                                     │

          │ Django   │   │ Django   │   │ Django   ││  - /api/users/                                      │

          │ Gunicorn │   │ Gunicorn │   │ Gunicorn ││  - /api/token/ (JWT)                                │

          │ (4 work) │   │ (4 work) │   │ (4 work) ││                                                     │

          └────┬─────┘   └────┬─────┘   └────┬─────┘└────────┬────────────────────┬───────────────────────┘

               │              │              │         │                    │

               └──────────────┼──────────────┘         ↓                    ↓

                              ↓    ┌────────┐          ┌──────────┐

                    ┌──────────────────┐    │ SQLite │          │  Redis   │

                    │   PostgreSQL 15  │    │   /    │          │ (broker) │

                    │   - Shared DB    │    │Postgres│          └─────┬────┘

                    │   - Persistent   │    └────────┘                │

                    └──────────────────┘                              ↓

                              ↓                    ┌─────────────────────┐

               ┌──────────────┴──────────────┐                    │  Celery Workers     │

               ↓                             ↓                    │  - Email tasks      │

        ┌─────────────┐              ┌─────────────┐                    │  - Cleanup tasks    │

        │ Redis Cache │              │ Redis Broker│                    │  - Report tasks     │

        │ - Sessions  │              │ - Celery    │                    └─────────────────────┘

        │ - API Cache │              │ - Tasks     │                              ↑

        └─────────────┘              └──────┬──────┘                    ┌─────────┴─────────┐

                                            │                    │  Celery Beat      │

                              ┌─────────────┴─────────────┐                    │  (Scheduler)      │

                              ↓                           ↓                    └───────────────────┘

                    ┌──────────────────┐      ┌──────────────────┐```

                    │ Celery Worker 1  │      │ Celery Worker 2  │

                    │ - 4 concurrent   │      │ - 4 concurrent   │## 📦 Estrutura de Containers (Docker Compose)

                    │ - Email tasks    │      │ - Email tasks    │

                    │ - Reports        │      │ - Reports        │### Containers Ativos

                    └──────────────────┘      └──────────────────┘

                              ↑| Container | Descrição | Porta | Papel |

                    ┌─────────┴─────────┐|-----------|-----------|-------|-------|

                    │   Celery Beat     │| `mutiroes-backend` | Django API | 8000 | Servidor principal da API REST |

                    │   - Scheduler     │| `mutiroes-redis` | Redis 7 | 6379 | Message broker para Celery |

                    │   - Periodic Tasks│| `mutiroes-celery-worker` | Celery Worker | - | Processa tasks assíncronas |

                    └───────────────────┘| `mutiroes-celery-beat` | Celery Beat | - | Agenda tasks periódicas |

```

### Volumes Persistentes

## 📦 Estrutura de Containers

- `redis_data` - Dados do Redis (filas, cache)

### Containers Ativos (8 total)- `backend_media` - Arquivos de mídia (fotos de eventos, avatares)

- `backend_static` - Arquivos estáticos (CSS, JS, imagens)

| Container | Descrição | Porta | Réplicas | Recursos |

|-----------|-----------|-------|----------|----------|## 🔄 Fluxo de Dados

| `mutiroes-nginx` | Load Balancer | 80 | 1 | Distribui entre 3 backends |

| `mutiroes-backend1` | Django API Replica 1 | - | 1 | 4 Gunicorn workers |### 1. Requisição Síncrona (CRUD)

| `mutiroes-backend2` | Django API Replica 2 | - | 1 | 4 Gunicorn workers |

| `mutiroes-backend3` | Django API Replica 3 | - | 1 | 4 Gunicorn workers |```

| `mutiroes-postgres` | PostgreSQL 15 | 5432 | 1 | Database compartilhado |Usuario → Frontend → API Backend → Database → Response

| `mutiroes-redis` | Redis 7 | 6379 | 1 | Broker + Cache |```

| `mutiroes-celery-worker1` | Celery Worker 1 | - | 1 | 4 concurrent tasks |

| `mutiroes-celery-worker2` | Celery Worker 2 | - | 1 | 4 concurrent tasks |**Exemplo:** Listar eventos, criar evento, fazer check-in

| `mutiroes-celery-beat` | Celery Scheduler | - | 1 | Periodic tasks |

### 2. Processamento Assíncrono

**Total de workers simultâneos:**

- Backend: 3 réplicas × 4 Gunicorn workers = **12 workers HTTP**```

- Celery: 2 workers × 4 concurrency = **8 workers de tasks**API Backend → Redis (enfileira) → Celery Worker → Executa task

```

### Volumes Compartilhados

**Exemplo:** Enviar email de boas-vindas após registro

- `postgres_data` - Dados do PostgreSQL (persistente)

- `redis_data` - Dados do Redis (filas, cache)### 3. Tasks Periódicas

- `backend_media` - Arquivos de mídia compartilhados entre backends

- `backend_static` - Arquivos estáticos compartilhados```

Celery Beat → Agenda task → Redis → Celery Worker → Executa

## 🔄 Fluxo de Requisições```



### 1. Requisição HTTP (Load Balanced)**Exemplo:** Limpeza de eventos expirados (diariamente às 2h)



```## 🎯 Apps Django (Módulos)

Usuario → Nginx Load Balancer → [Backend1 | Backend2 | Backend3] → PostgreSQL → Response

                ↓### `events/` - Gestão de Eventos

        (least_conn algorithm)

        Escolhe backend com menos conexões ativas**Models:**

```- `EventCategory` - Categorias (Limpeza, Plantio, Monitoramento, Educação)

- `Event` - Evento principal com localização, datas, capacidade

**Características:**- `EventParticipant` - Participantes inscritos com check-in

- **Algoritmo:** Least Connections (backend com menos conexões ativas)- `EventResource` - Recursos necessários (ferramentas, materiais)

- **Health Checks:** Nginx monitora saúde dos backends (30s interval)- `EventPhoto` - Fotos antes/depois dos eventos

- **Failover Automático:** Se um backend falha, requisições vão para os saudáveis- `EventComment` - Comentários nos eventos

- **Rate Limiting:** 100 req/s por IP na API, 10 req/min no login- `EventReport` - Relatórios de impacto pós-evento



### 2. Processamento Assíncrono (Distribuído)**Endpoints:**

```

```GET    /api/events/              - Lista eventos

Backend → Redis (enfileira) → [Worker1 | Worker2] → Executa task → Salva resultadoPOST   /api/events/              - Cria evento

                                     ↓GET    /api/events/{id}/         - Detalhes do evento

                              (Round-robin automático)PUT    /api/events/{id}/         - Atualiza evento

```DELETE /api/events/{id}/         - Deleta evento

POST   /api/events/{id}/join/    - Inscrever-se no evento

**Exemplo:** Enviar email de boas-vindas após registroPOST   /api/events/{id}/leave/   - Cancelar inscrição

POST   /api/events/{id}/check_in/- Fazer check-in

### 3. Tasks Periódicas (Agendadas)GET    /api/events/{id}/stats/   - Estatísticas do evento

GET    /api/events/my_events/    - Eventos do usuário

```GET    /api/events/nearby/       - Eventos próximos

Celery Beat → Agenda task → Redis → Qualquer Worker disponível → ExecutaGET    /api/events/categories/   - Lista categorias

``````



**Exemplo:** Limpeza de eventos expirados (diariamente às 2h)### `users/` - Gestão de Usuários



## 🚀 Escalabilidade**Funcionalidades:**

- Registro de usuário

### Horizontal Scaling (Implementado)- Autenticação JWT

- Perfil do usuário

✅ **Backend Django:**- Histórico de participação em eventos

```bash

# Escalar para 5 réplicas**Endpoints:**

make scale-backends N=5```

POST /api/token/          - Login (gera access + refresh token)

# Nginx automaticamente distribui carga entre todasPOST /api/token/refresh/  - Renova access token

```POST /api/users/register/ - Registro de novo usuário

GET  /api/users/profile/  - Perfil do usuário autenticado

✅ **Celery Workers:**```

```bash

# Escalar para 4 workers## ⚡ Celery - Processamento Assíncrono

make scale-workers N=4

### Tasks Implementadas

# Tasks são distribuídas entre todos os workers

```#### 1. **Email Tasks** (`users/tasks.py`)

```python

### Capacidade Estimada@shared_task

def send_welcome_email(user_id):

**Setup atual (3 backends + 2 workers):**    """Envia email de boas-vindas após registro"""

- HTTP: ~12 requisições simultâneas (3 × 4 Gunicorn workers)```

- Tasks assíncronas: ~8 tasks simultâneas (2 × 4 concurrency)

- PostgreSQL: ~100 conexões simultâneas (default)#### 2. **Event Tasks** (`events/tasks.py`)

```python

**Setup escalado (5 backends + 4 workers):**@shared_task

- HTTP: ~20 requisições simultâneas (5 × 4 Gunicorn workers)def cleanup_expired_events():

- Tasks assíncronas: ~16 tasks simultâneas (4 × 4 concurrency)    """Remove eventos expirados (scheduled: diariamente às 2h)"""

- PostgreSQL: Mesmo limite (shared)

@shared_task

### Limites e Otimizaçõesdef generate_monthly_impact_report():

    """Gera relatório mensal de impacto (scheduled: 1º dia às 3h)"""

**Limitações Atuais:**```

- ❌ PostgreSQL é single-point-of-failure (sem replicação)

- ❌ Redis não tem failover (sem Sentinel/Cluster)### Configuração do Celery Beat

- ❌ Nginx é single instance (sem HA)

```python

**Otimizações Futuras:**CELERY_BEAT_SCHEDULE = {

- 🔄 PostgreSQL com replicação master-slave    'cleanup-expired-events': {

- 🔄 Redis Sentinel para high availability        'task': 'events.tasks.cleanup_expired_events',

- 🔄 Múltiplas instâncias do Nginx com Keepalived        'schedule': crontab(hour=2, minute=0),  # Diariamente às 2h

- 🔄 Monitoramento com Prometheus + Grafana    },

    'generate-monthly-report': {

## 🎯 Apps Django (Módulos)        'task': 'events.tasks.generate_monthly_impact_report',

        'schedule': crontab(day_of_month=1, hour=3, minute=0),  # 1º do mês às 3h

### `events/` - Gestão de Eventos    },

}

**Models:**```

- `EventCategory` - Categorias (Limpeza, Plantio, Monitoramento, Educação)

- `Event` - Evento principal com localização, datas, capacidade### Celery Workers

- `EventParticipant` - Participantes inscritos com check-in

- `EventResource` - Recursos necessários (ferramentas, materiais)- **Concorrência:** 2 workers simultâneos

- `EventPhoto` - Fotos antes/depois dos eventos- **Broker:** Redis

- `EventComment` - Comentários nos eventos- **Result Backend:** Redis

- `EventReport` - Relatórios de impacto pós-evento- **Serialização:** JSON



**Endpoints (Load Balanced):**## 🔒 Segurança e Autenticação

```

GET    /api/events/              - Lista eventos (cache 60s)### JWT Authentication

POST   /api/events/              - Cria evento

GET    /api/events/{id}/         - Detalhes do evento```python

PUT    /api/events/{id}/         - Atualiza evento# Token de acesso: válido por 60 minutos

DELETE /api/events/{id}/         - Deleta evento# Token de refresh: válido por 7 dias

POST   /api/events/{id}/join/    - Inscrever-se no evento# Rotação automática de tokens

POST   /api/events/{id}/leave/   - Cancelar inscrição```

POST   /api/events/{id}/check_in/- Fazer check-in

GET    /api/events/{id}/stats/   - Estatísticas do evento**Fluxo:**

GET    /api/events/my_events/    - Eventos do usuário1. Login → Gera `access_token` + `refresh_token`

GET    /api/events/nearby/       - Eventos próximos2. Requisições autenticadas → Header: `Authorization: Bearer {access_token}`

GET    /api/events/categories/   - Lista categorias3. Token expirado → Usar `refresh_token` para gerar novo `access_token`

```

### Permissões

### `users/` - Gestão de Usuários

- **IsAuthenticated** - Requerido para criar eventos, participar, comentar

**Funcionalidades:**- **IsAuthenticatedOrReadOnly** - Listagem pública, ações requerem autenticação

- Registro de usuário

- Autenticação JWT## 📊 Padrões e Boas Práticas

- Perfil do usuário

- Histórico de participação em eventos### ✅ Implementados



**Endpoints (Load Balanced):**1. **REST API** - Endpoints RESTful seguindo convenções

```2. **JWT Stateless Authentication** - Sem sessões no servidor

POST /api/token/          - Login (gera access + refresh token)3. **Containerização** - Docker para todos os componentes

POST /api/token/refresh/  - Renova access token4. **Async Processing** - Celery para operações demoradas

POST /api/users/register/ - Registro de novo usuário5. **Health Checks** - Endpoint `/health/` para monitoramento

GET  /api/users/profile/  - Perfil do usuário autenticado6. **CORS** - Configurado para comunicação frontend/backend

```7. **Filtros e Busca** - django-filter para queries complexas

8. **Paginação** - 20 itens por página por padrão

## ⚡ Celery - Processamento Assíncrono Distribuído9. **Serialização** - DRF serializers para validação de dados



### Tasks Implementadas### 🎨 Frontend - Design Patterns



#### 1. **Email Tasks** (`users/tasks.py`)1. **Component-Based** - Componentes React reutilizáveis

```python2. **Hooks** - Custom hooks para lógica compartilhada

@shared_task3. **Context API** - `AuthContext` para estado de autenticação

def send_welcome_email(user_id):4. **Client-Side Routing** - Next.js App Router

    """Envia email de boas-vindas após registro"""5. **API Client** - Classe centralizada para chamadas HTTP

    # Executado por qualquer worker disponível6. **Type Safety** - TypeScript em todo frontend

```

## 🚀 Deployment

#### 2. **Event Tasks** (`events/tasks.py`)

```python### Desenvolvimento

@shared_task

def cleanup_expired_events():```bash

    """Remove eventos expirados (scheduled: diariamente às 2h)"""# Backend local

cd mutiroes_backend

@shared_taskpython manage.py runserver

def generate_monthly_impact_report():

    """Gera relatório mensal de impacto (scheduled: 1º dia às 3h)"""# Frontend local

```cd mutiroes-frontend

npm run dev

### Distribuição de Tasks

# Docker Compose

**Celery usa Round-Robin automático:**docker-compose up -d

1. Task entra na fila do Redis```

2. Primeiro worker disponível pega a task

3. Worker executa e salva resultado no Redis### Produção (Recomendações)

4. Backend consulta resultado quando necessário

**Backend:**

**Concurrency:**- ✅ Usar Gunicorn (já configurado no Dockerfile)

- Worker 1: 4 tasks simultâneas- ✅ PostgreSQL em vez de SQLite

- Worker 2: 4 tasks simultâneas- ✅ Nginx como reverse proxy

- **Total: 8 tasks simultâneas**- ✅ HTTPS/SSL

- ✅ Variáveis de ambiente seguras

### Configuração do Celery Beat- ✅ `DEBUG=False`



```python**Frontend:**

CELERY_BEAT_SCHEDULE = {- ✅ Build otimizado: `npm run build`

    'cleanup-expired-events': {- ✅ Servir via Nginx ou CDN

        'task': 'events.tasks.cleanup_expired_events',- ✅ Server-Side Rendering (SSR) habilitado

        'schedule': crontab(hour=2, minute=0),  # Diariamente às 2h

    },**Infraestrutura:**

    'generate-monthly-report': {- ✅ Redis persistente

        'task': 'events.tasks.generate_monthly_impact_report',- ✅ Backup automático do banco

        'schedule': crontab(day_of_month=1, hour=3, minute=0),  # 1º do mês às 3h- ✅ Monitoramento (logs, métricas)

    },- ✅ Auto-scaling do Celery workers

}

```## 📈 Escalabilidade



## 🔒 Segurança### Limitações Atuais (Monolito)



### Load Balancer (Nginx)- ❌ Backend é single-point-of-failure

- ❌ Não há load balancing

**Rate Limiting:**- ❌ Não há replicação de database

```nginx- ❌ Redis não tem failover

# API Endpoints

limit_req zone=api_limit rate=100r/s burst=50;### Como Escalar (Futuro)



# Auth Endpoints (mais restrito)**Horizontal Scaling:**

limit_req zone=auth_limit rate=10r/m burst=10;1. Adicionar múltiplas instâncias do backend

```2. Nginx como load balancer

3. PostgreSQL com replicação master-slave

**Connection Limiting:**4. Redis Sentinel para high availability

```nginx

limit_conn addr 50;  # Máximo 50 conexões por IP**Vertical Scaling:**

```1. Aumentar recursos dos containers

2. Otimizar queries do banco

**Security Headers:**3. Adicionar índices apropriados

```nginx4. Cache agressivo com Redis

X-Frame-Options: SAMEORIGIN

X-Content-Type-Options: nosniff## 🔍 Monitoramento

X-XSS-Protection: 1; mode=block

```### Health Checks



### JWT Authentication```bash

# Backend health

```pythoncurl http://localhost:8000/health/

# Token de acesso: válido por 60 minutos

# Token de refresh: válido por 7 dias# Readiness (banco + redis disponíveis)

# Rotação automática de tokenscurl http://localhost:8000/readiness/

```

# Liveness (processo ativo)

**Fluxo:**curl http://localhost:8000/liveness/

1. Login → Gera `access_token` + `refresh_token````

2. Requisições autenticadas → Header: `Authorization: Bearer {access_token}`

3. Token expirado → Usar `refresh_token` para gerar novo `access_token`### Logs



### Database Security```bash

# Backend

- **Connection Pooling:** Máximo 100 conexões compartilhadasdocker-compose logs -f backend

- **Health Checks:** Validação de conexão antes de usar

- **Credentials:** Variáveis de ambiente (nunca hardcoded)# Celery Worker

docker-compose logs -f celery-worker

## 🔍 Monitoramento

# Celery Beat

### Health Checksdocker-compose logs -f celery-beat



```bash# Redis

# Sistema completo via load balancerdocker-compose logs -f redis

curl http://localhost/health```



# Backend health (load balanced)## 🔧 Resiliência

curl http://localhost/api/health/

### Patterns Implementados

# Readiness (banco + redis disponíveis)

curl http://localhost/api/readiness/**Circuit Breaker** (`mutiroes_backend/resilience.py`)

```python

# Liveness (processo ativo)# Proteção para chamadas externas

curl http://localhost/api/liveness/# Estados: Closed → Open → Half-Open

# Falhas máximas: 5

# Check de cada replica individualmente# Timeout de reset: 60s

docker inspect mutiroes-backend1 --format='{{.State.Health.Status}}'```

docker inspect mutiroes-backend2 --format='{{.State.Health.Status}}'

docker inspect mutiroes-backend3 --format='{{.State.Health.Status}}'**Retry com Exponential Backoff**

``````python

# Máximo de tentativas: 3

### Logs Distribuídos# Backoff: 1s, 2s, 4s, 8s, ...

# Timeout máximo: 10s

```bash```

# Todos os backends

make logs-backend### Restart Policies



# Backend específicoTodos os containers têm `restart: unless-stopped`:

docker-compose logs -f backend1- Reiniciam automaticamente em caso de falha

- Iniciam automaticamente após reboot do sistema

# Celery workers

make logs-celery## 📚 Referências



# Nginx (load balancer)- [Django Documentation](https://docs.djangoproject.com/)

make logs-nginx- [Django REST Framework](https://www.django-rest-framework.org/)

- [Celery Documentation](https://docs.celeryproject.org/)

# Todos os serviços- [Next.js Documentation](https://nextjs.org/docs)

make logs-all- [Docker Compose](https://docs.docker.com/compose/)

```

---

### Métricas

**Conclusão:** Este é um sistema **monolítico bem estruturado** com processamento assíncrono, não um sistema distribuído. É adequado para aplicações de pequeno a médio porte e pode ser escalado verticalmente ou evoluído para microserviços no futuro se necessário.

```bash

# Status de todos os containers### 1. Processamento Assíncrono (Celery)

make status

**Tasks Implementadas:**

# Health check completo- `send_event_notification_email`: Envio de emails de notificação de eventos

make health- `send_bulk_event_reminders`: Envio em massa de lembretes de eventos

- `process_event_report_statistics`: Processamento de estatísticas de relatórios

# Estatísticas do Celery- `generate_monthly_impact_report`: Geração de relatório mensal de impacto ambiental

make celery-status- `cleanup_expired_events`: Limpeza automática de eventos expirados

- `update_user_statistics`: Atualização de estatísticas de usuário

# Uso de recursos- `check_and_award_badges`: Verificação e atribuição automática de badges

make info

```**Celery Beat - Tarefas Periódicas:**

- Limpeza de eventos expirados: diariamente às 2h

## 🔧 Resiliência- Relatório mensal: primeiro dia do mês às 3h



### Load Balancer Resilience**Workers:**

- 2 workers Celery para processamento paralelo

**Nginx Health Checks:**- 1 Celery Beat para agendamento de tarefas

```nginx

server backend1:8000 max_fails=3 fail_timeout=30s;### 2. API Gateway (Nginx)

```

- Se backend falha 3 vezes em 30s, é marcado como unhealthy**Funcionalidades:**

- Requisições são redirecionadas para backends saudáveis- **Load Balancing:** Distribuição de carga entre 3 instâncias do backend usando algoritmo `least_conn`

- Backend é reativado automaticamente quando volta- **Rate Limiting:** 

  - API: 10 requisições/segundo por IP

**Automatic Retry:**  - Auth: 5 requisições/minuto por IP

```nginx- **Connection Limiting:** Máximo de 10 conexões simultâneas por IP

proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;- **Cache:** Cache de arquivos estáticos e media com Redis

proxy_next_upstream_tries 3;- **Health Checks:** Monitoramento automático de saúde dos serviços

```- **CORS:** Configuração de headers CORS

- Se backend1 falha, tenta backend2- **Security Headers:** X-Frame-Options, X-Content-Type-Options, X-XSS-Protection

- Até 3 tentativas em backends diferentes

**Endpoints:**

### Circuit Breaker (Implementado)- `/api/*` → Backend Django (load balanced)

- `/health` → Health check do API Gateway

**Proteção para chamadas externas** (`mutiroes_backend/resilience.py`)- `/nginx_status` → Métricas do Nginx (restrito)

```python

# Estados: Closed → Open → Half-Open### 3. Service Discovery (Consul)

# Falhas máximas: 5

# Timeout de reset: 60s**Recursos:**

```- Service Registry para todos os serviços

- Health checks automáticos

### Database Resilience- Service mesh capabilities

- UI de monitoramento em http://localhost:8500

**Connection Health Checks:**

```python### 4. Escalabilidade e Replicação

DATABASES = {

    'default': {**Backend Django:**

        'conn_max_age': 600,           # Reusa conexões por 10min- 3 réplicas (backend1, backend2, backend3)

        'conn_health_checks': True,    # Valida antes de usar- Gunicorn com 4 workers cada

    }- Health checks configurados

}- Compartilhamento de media e static files via volumes

```

**Frontend Next.js:**

### Redis Persistence- 2 réplicas (frontend1, frontend2)

- Load balancing via Nginx

**RDB + AOF:**- Health checks configurados

```bash

redis-server --appendonly yes --appendfsync everysec --save 60 1000**Database:**

```- PostgreSQL 15 com capacidade de replicação

- **AOF (Append Only File):** Log de todas as escritas (fsync a cada 1s)- Volumes persistentes

- **RDB (Snapshot):** Snapshot a cada 60s se houver 1000+ mudanças

- Recuperação automática em restart**Cache/Message Broker:**

- Redis Master-Slave replication

### Restart Policies- Redis Sentinel para failover automático

- 3 instâncias: master, slave, sentinel

Todos os containers têm `restart: unless-stopped`:

- Reiniciam automaticamente em caso de falha### 5. Resiliência e Fault Tolerance

- Iniciam automaticamente após reboot do sistema

- Podem ser parados manualmente sem restart automático**Circuit Breaker:**

- Proteção para chamadas externas

## 🚀 Deployment- Proteção para database

- Proteção para Redis

### Desenvolvimento- Estados: Closed → Open → Half-Open



```bash**Retry Patterns:**

# Sistema distribuído completo- Exponential backoff

make quickstart- Máximo de 3 tentativas

- Logging de falhas

# Ou passo a passo

make build**Fallback Mechanisms:**

make up- Valores padrão em caso de falha

make migrate- Degradação graciosa de funcionalidades

make createsuperuser

make populate### 6. Monitoramento

```

**Flower:** Monitor do Celery em http://localhost:5555

### Produção (Recomendações)**Consul UI:** Service discovery em http://localhost:8500

**Nginx Status:** Métricas em http://localhost/nginx_status

**Backend:**

- ✅ DEBUG=False (já configurado)## Rodando o Sistema Completo

- ✅ Gunicorn com múltiplos workers (já configurado)

- ✅ PostgreSQL (já configurado)### Pré-requisitos

- ✅ HTTPS/SSL via Nginx (adicionar certificado)```bash

- ✅ Secrets em variáveis de ambiente seguras- Docker e Docker Compose

- ✅ Firewall e security groups- 4GB RAM mínimo

- 10GB disco disponível

**Load Balancer:**```

- ✅ SSL/TLS termination no Nginx

- ✅ Rate limiting agressivo (já configurado)### Iniciar Sistema Distribuído

- ✅ Logging estruturado

- ✅ Monitoramento de métricas```bash

# Build e start de todos os serviços

**Database:**docker-compose -f docker-compose.distributed.yml up --build

- ✅ PostgreSQL com replicação master-slave

- ✅ Backup automático diário# Start em background

- ✅ Point-in-time recoverydocker-compose -f docker-compose.distributed.yml up -d

- ✅ Connection pooling (PgBouncer)

# Ver logs

**Infraestrutura:**docker-compose -f docker-compose.distributed.yml logs -f

- ✅ Redis Sentinel para failover

- ✅ Monitoramento com Prometheus + Grafana# Escalar serviços

- ✅ Logs centralizados (ELK Stack)docker-compose -f docker-compose.distributed.yml up --scale backend1=5

- ✅ Auto-scaling com Kubernetes (futuro)

# Parar sistema

## 📊 Performancedocker-compose -f docker-compose.distributed.yml down



### Benchmarks Estimados# Parar e limpar volumes

docker-compose -f docker-compose.distributed.yml down -v

**Setup atual (3 backends, 2 workers):**```

- Requisições HTTP simultâneas: ~12

- Tasks assíncronas simultâneas: ~8### Acessando os Serviços

- Throughput estimado: ~1000 req/s (com cache)

- Latência média: ~50-100ms (rede local)- **Aplicação:** http://localhost

- **API:** http://localhost/api

**Gargalos:**- **Admin Django:** http://localhost/admin

- PostgreSQL (single instance) - resolver com read replicas- **Flower (Celery):** http://localhost:5555

- Redis (single instance) - resolver com Sentinel/Cluster- **Consul UI:** http://localhost:8500

- Nginx (single instance) - resolver com múltiplas instâncias + LB- **Health Check:** http://localhost/health



### Cache Strategy### Health Checks



**Nginx Cache:**```bash

- Static files: 1h TTL# Backend health

- Media files: 1 dia TTLcurl http://localhost/health

- API responses: Não cacheado (dados dinâmicos)

# Readiness probe

**Redis Cache:**curl http://localhost/readiness

- Sessions: TTL padrão do Django

- Celery results: 1h TTL# Liveness probe

- Custom cache: Definido por endpointcurl http://localhost/liveness



## 📚 Comandos Úteis# Nginx status

curl http://localhost/nginx_status

```bash```

# Start sistema distribuído

make up## Arquitetura de Rede



# Ver health de tudo```

make healthInternet

   ↓

# Logs de todos os backendsAPI Gateway (Nginx) :80

make logs-backend   ↓

   ├─→ Backend 1 :8000 ──┐

# Escalar backends para 5 réplicas   ├─→ Backend 2 :8000 ──┼─→ PostgreSQL :5432

make scale-backends N=5   ├─→ Backend 3 :8000 ──┘      ↓

   ↓                         Redis Master :6379

# Escalar workers para 4 réplicasFrontend 1 :3000                  ↓

make scale-workers N=4Frontend 2 :3000            Redis Slave :6379

                                  ↓

# Restart de backends sem downtime   Celery Worker 1 ───────→ Redis Sentinel

make restart-backends   Celery Worker 2 ───────→

   Celery Beat ────────────→

# Backup do PostgreSQL                                  ↓

make backup-db                            Consul :8500

```

# Status de todos os serviços

make status## Características de Sistema Distribuído



# Informações detalhadas✅ **Processamento Assíncrono:** Celery com tasks para operações demoradas

make info✅ **API Gateway:** Nginx com load balancing e rate limiting

```✅ **Service Discovery:** Consul para registro e descoberta de serviços

✅ **Escalabilidade Horizontal:** Múltiplas réplicas de backend e frontend

## 🎯 Características de Sistema Distribuído✅ **Load Balancing:** Distribuição automática de carga

✅ **High Availability:** Redis Sentinel para failover

✅ **Load Balancing** - Nginx distribui requisições entre 3 backends  ✅ **Database Replication:** PostgreSQL com suporte a replicação

✅ **Horizontal Scaling** - Escalar backends e workers sob demanda  ✅ **Circuit Breaker:** Proteção contra falhas em cascata

✅ **Shared Database** - PostgreSQL compartilhado entre todas as réplicas  ✅ **Retry Patterns:** Retenção automática com exponential backoff

✅ **Distributed Tasks** - Celery workers processam tasks em paralelo  ✅ **Health Checks:** Monitoramento contínuo de saúde dos serviços

✅ **Health Checks** - Monitoramento automático de saúde dos serviços  ✅ **Caching:** Cache distribuído com Redis

✅ **Automatic Failover** - Nginx redireciona se backend falha  ✅ **Logging:** Logs centralizados

✅ **Persistent Storage** - PostgreSQL + Redis com persistência  ✅ **Monitoring:** Flower para Celery, Consul UI para serviços

✅ **Shared Volumes** - Media/static compartilhados entre backends  

✅ **Circuit Breaker** - Proteção contra falhas em cascata  ## Próximos Passos

✅ **Rate Limiting** - Proteção contra DDoS  

✅ **Connection Pooling** - Reuso eficiente de conexões  - [ ] Adicionar Prometheus + Grafana para métricas

✅ **Restart Policies** - Auto-recovery em falhas  - [ ] Implementar ELK Stack para logs centralizados

- [ ] Adicionar Kubernetes manifests

## 📈 Próximos Passos para Produção- [ ] Implementar service mesh com Istio

- [ ] Adicionar OpenTelemetry para tracing distribuído

- [ ] PostgreSQL Master-Slave Replication
- [ ] Redis Sentinel (3 nodes)
- [ ] Nginx HA com Keepalived (2+ instances)
- [ ] Prometheus + Grafana para métricas
- [ ] ELK Stack para logs centralizados
- [ ] Kubernetes manifests (quando escala > 10 backends)
- [ ] Service Mesh (Istio/Linkerd) para observabilidade
- [ ] OpenTelemetry para distributed tracing
- [ ] CDN para static/media files
- [ ] Auto-scaling baseado em métricas

---

**Conclusão:** Este é um **sistema distribuído real** com load balancing, múltiplas réplicas, escalabilidade horizontal e processamento assíncrono distribuído. Adequado para aplicações de médio a grande porte com alta disponibilidade e capacidade de escalar conforme a demanda.
