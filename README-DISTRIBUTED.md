# 🌍 Mutirões - Sistema Distribuído

Sistema de gestão de mutirões ambientais com **arquitetura distribuída**, load balancing e escalabilidade horizontal.

## 🚀 Quick Start

```bash
# Setup completo do sistema distribuído
make quickstart

# Acesse:
# - Frontend: http://localhost
# - API: http://localhost/api/
# - Admin: http://localhost/admin/
```

## 📊 Arquitetura

**Sistema Distribuído com:**
- ✅ **3 réplicas do backend Django** com Gunicorn
- ✅ **Nginx como load balancer** (least connections)
- ✅ **PostgreSQL 15** (database compartilhado)
- ✅ **Redis 7** (message broker + cache)
- ✅ **2 Celery workers** (processamento assíncrono)
- ✅ **Escalabilidade horizontal** (adicione mais réplicas facilmente)

```
Internet → Nginx → [Backend1 | Backend2 | Backend3] → PostgreSQL
                              ↓
                          Redis
                              ↓
                  [Celery Worker1 | Worker2]
```

## 🛠️ Comandos Principais

### Gerenciamento Básico

```bash
make up              # Inicia sistema distribuído (8 containers)
make down            # Para todos os serviços
make restart         # Reinicia tudo
make status          # Status de todos os containers
make health          # Health check completo do sistema
```

### Logs e Monitoramento

```bash
make logs-backend    # Logs das 3 réplicas do backend
make logs-nginx      # Logs do load balancer
make logs-celery     # Logs dos workers Celery
make logs-postgres   # Logs do PostgreSQL
make logs-all        # Logs combinados de tudo
```

### Escalabilidade

```bash
# Escalar backends para 5 réplicas
make scale-backends N=5

# Escalar Celery workers para 4 réplicas
make scale-workers N=4
```

### Database

```bash
make migrate         # Rodar migrations no PostgreSQL
make shell           # Django shell
make dbshell         # PostgreSQL shell
make backup-db       # Backup do PostgreSQL
```

### Outros

```bash
make createsuperuser # Criar usuário admin
make test            # Rodar testes
make info            # Informações detalhadas do sistema
```

## 🏗️ Estrutura do Projeto

```
lastaps/
├── docker-compose.yml          # Configuração dos 8 containers
├── Makefile                    # Comandos do sistema distribuído
├── ARCHITECTURE.md             # Documentação detalhada da arquitetura
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf              # Load balancer config
├── mutiroes_backend/
│   ├── Dockerfile
│   ├── manage.py
│   ├── events/                 # App de eventos
│   ├── users/                  # App de usuários
│   └── mutiroes_backend/
│       ├── settings.py         # Configurado para PostgreSQL
│       ├── celery.py          # Celery config
│       └── ...
└── mutiroes-frontend/
    └── ...                     # Next.js app
```

## 🔧 Tecnologias

**Backend:**
- Django 4.2.7 + Django REST Framework 3.14.0
- PostgreSQL 15 (shared database)
- Redis 7 (broker + cache)
- Celery 5.3.4 (async tasks)
- Gunicorn (4 workers por réplica)

**Load Balancer:**
- Nginx (least connections algorithm)
- Rate limiting (100 req/s API, 10 req/min auth)
- Health checks automáticos

**Frontend:**
- Next.js 15.5.4
- React 19
- TypeScript 5
- Tailwind CSS 3.4.18

## 📈 Capacidade

**Setup Atual (3 backends + 2 workers):**
- **HTTP simultâneo:** ~12 requisições (3 × 4 Gunicorn workers)
- **Tasks assíncronas:** ~8 tasks (2 × 4 concurrency)
- **Escalável:** Adicione mais réplicas conforme necessário

## 🔒 Segurança

- JWT Authentication (60min access, 7 dias refresh)
- Rate limiting no Nginx (proteção DDoS)
- CORS configurado
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Connection pooling no PostgreSQL

## 📖 Documentação Completa

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para:
- Diagrama detalhado da arquitetura
- Fluxo de requisições
- Estratégias de escalabilidade
- Resiliência e failover
- Performance e benchmarks
- Próximos passos para produção

## 🧪 Testando o Sistema Distribuído

```bash
# 1. Inicie o sistema
make up

# 2. Aguarde serviços ficarem saudáveis
make health

# 3. Veja os backends rodando
make status

# 4. Acompanhe logs em tempo real
make logs-backend

# 5. Teste o load balancer
curl http://localhost/api/events/

# 6. Escale para mais réplicas
make scale-backends N=5
```

## 🚨 Troubleshooting

**Backend não inicia:**
```bash
make logs-backend  # Ver logs de erro
make restart-backends  # Tentar restart
```

**PostgreSQL não conecta:**
```bash
make logs-postgres  # Ver logs do banco
make restart-postgres  # Restart do banco
```

**Nginx retorna 502:**
```bash
make health  # Verificar saúde dos backends
make logs-nginx  # Ver logs do load balancer
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

- **Issues:** Abra uma issue no GitHub
- **Documentação:** Veja ARCHITECTURE.md
- **Logs:** Use `make logs-all` para debug
