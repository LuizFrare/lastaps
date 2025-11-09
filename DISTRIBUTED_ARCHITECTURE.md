# Sistema Distribuído - Mutirões

## Arquitetura do Sistema

Este projeto implementa uma arquitetura de sistema distribuído completa com os seguintes componentes:

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
