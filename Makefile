.PHONY: help build up down logs restart clean migrate shell test.PHONY: help build up down logs restart clean migrate shell test



# Colors# Colors

BLUE=\033[0;34mBLUE=\033[0;34m

GREEN=\033[0;32mGREEN=\033[0;32m

YELLOW=\033[1;33mNC=\033[0m # No Color

NC=\033[0m # No Color

help: ## Show this help message

help: ## Show this help message	@echo '${GREEN}=== Mutirões - Commands ===${NC}'

	@echo '${GREEN}=== Sistema Distribuído - Mutirões ===${NC}'	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${BLUE}%-20s${NC} %s\n", $$1, $$2}'

	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${BLUE}%-25s${NC} %s\n", $$1, $$2}'

# Docker Compose

# ========================================build: ## Build all Docker images

# Sistema Distribuído	docker-compose build

# ========================================

up: ## Start all services

build: ## Build all Docker images	docker-compose up -d

	docker-compose build	@echo "${GREEN}✅ Services started!${NC}"

	@echo "${BLUE}Backend API:${NC} http://localhost:8000"

up: ## Start distributed system (3 backends + load balancer)	@echo "${BLUE}API Docs:${NC} http://localhost:8000/api/"

	docker-compose up -d	@echo "${BLUE}Admin:${NC} http://localhost:8000/admin/"

	@echo "${GREEN}✅ Sistema distribuído iniciado!${NC}"

	@echo "${BLUE}Nginx (Load Balancer):${NC} http://localhost"down: ## Stop all services

	@echo "${BLUE}Backend API:${NC} http://localhost/api/"	docker-compose down

	@echo "${BLUE}Admin:${NC} http://localhost/admin/"

	@echo "${BLUE}PostgreSQL:${NC} localhost:5432"logs: ## View logs from all services

	@echo "${BLUE}Redis:${NC} localhost:6379"	docker-compose logs -f

	@echo ""

	@echo "${YELLOW}Aguardando serviços ficarem saudáveis...${NC}"logs-backend: ## View backend logs only

	@sleep 5	docker-compose logs -f backend



down: ## Stop all serviceslogs-celery: ## View celery worker logs

	docker-compose down	docker-compose logs -f celery-worker



# ========================================logs-beat: ## View celery beat logs

# Logs	docker-compose logs -f celery-beat

# ========================================

restart: ## Restart all services

logs: ## View logs from all services	docker-compose restart

	docker-compose logs -f

restart-backend: ## Restart backend only

logs-all: ## View combined logs with timestamps	docker-compose restart backend

	docker-compose logs -f --tail=100

restart-celery: ## Restart celery services

logs-backend: ## View all backend replica logs	docker-compose restart celery-worker celery-beat

	docker-compose logs -f backend1 backend2 backend3

clean: ## Stop and remove all containers, networks, and volumes

logs-nginx: ## View Nginx (load balancer) logs	docker-compose down -v

	docker-compose logs -f nginx	docker system prune -f



logs-celery: ## View celery worker logs# Database

	docker-compose logs -f celery-worker1 celery-worker2 celery-beatmigrate: ## Run database migrations

	docker-compose exec backend python manage.py migrate

logs-postgres: ## View PostgreSQL logs

	docker-compose logs -f postgresmakemigrations: ## Create new migrations

	docker-compose exec backend python manage.py makemigrations

logs-redis: ## View Redis logs

	docker-compose logs -f redisshell: ## Open Django shell

	docker-compose exec backend python manage.py shell

# ========================================

# Status & Monitoringdbshell: ## Open database shell

# ========================================	docker-compose exec backend python manage.py dbshell



status: ## Show service status# Development

	docker-compose psdev-backend: ## Run backend locally (without Docker)

	cd mutiroes_backend && python manage.py runserver

health: ## Check health of all services

	@echo "${GREEN}🏥 Health Check do Sistema Distribuído${NC}"dev-frontend: ## Run frontend locally (without Docker)

	@echo ""	cd mutiroes-frontend && npm run dev

	@echo "${BLUE}🔹 Nginx (Load Balancer):${NC}"

	@curl -f http://localhost/health 2>/dev/null && echo "   ✅ Healthy" || echo "   ❌ Unhealthy"# Testing

	@echo ""test: ## Run all tests

	@echo "${BLUE}🔹 Backend (através do Nginx):${NC}"	docker-compose exec backend python manage.py test

	@curl -f http://localhost/api/health/ 2>/dev/null && echo "   ✅ Healthy" || echo "   ❌ Unhealthy"

	@echo ""test-events: ## Run events app tests

	@echo "${BLUE}🔹 PostgreSQL:${NC}"	docker-compose exec backend python manage.py test events

	@docker-compose exec -T postgres pg_isready -U mutiroes_user 2>/dev/null && echo "   ✅ Healthy" || echo "   ❌ Unhealthy"

	@echo ""test-users: ## Run users app tests

	@echo "${BLUE}🔹 Redis:${NC}"	docker-compose exec backend python manage.py test users

	@docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG && echo "   ✅ Healthy" || echo "   ❌ Unhealthy"

	@echo ""# Admin

	@echo "${BLUE}🔹 Backend Replicas:${NC}"createsuperuser: ## Create Django superuser

	@docker inspect mutiroes-backend1 --format='   Backend 1: {{.State.Health.Status}}' 2>/dev/null || echo "   Backend 1: ❌ Not running"	docker-compose exec backend python manage.py createsuperuser

	@docker inspect mutiroes-backend2 --format='   Backend 2: {{.State.Health.Status}}' 2>/dev/null || echo "   Backend 2: ❌ Not running"

	@docker inspect mutiroes-backend3 --format='   Backend 3: {{.State.Health.Status}}' 2>/dev/null || echo "   Backend 3: ❌ Not running"collectstatic: ## Collect static files

	docker-compose exec backend python manage.py collectstatic --noinput

celery-status: ## Check Celery worker status

	@echo "${GREEN}📊 Celery Workers Status${NC}"# Data Management

	@docker-compose exec backend1 celery -A mutiroes_backend inspect active 2>/dev/null || echo "❌ Não foi possível conectar aos workers"populate: ## Populate database with sample data

	docker-compose exec backend python populate_data.py

celery-stats: ## Show Celery statistics

	docker-compose exec celery-worker1 celery -A mutiroes_backend inspect statsflush: ## Flush database (WARNING: deletes all data)

	docker-compose exec backend python manage.py flush --noinput

# ========================================

# Escalabilidade# Health & Status

# ========================================health: ## Check backend health

	@curl -s http://localhost:8000/health/ || echo "${BLUE}Backend is not running${NC}"

scale-backends: ## Scale backend replicas (ex: make scale-backends N=5)

	@if [ -z "$(N)" ]; then echo "${YELLOW}❌ Uso: make scale-backends N=5${NC}"; exit 1; fistatus: ## Show service status

	docker-compose up -d --scale backend2=$(N) --scale backend3=$(N)	docker-compose ps

	@echo "${GREEN}✅ Backends escalados para múltiplas réplicas${NC}"

	@make status# Celery Management

celery-status: ## Check Celery worker status

scale-workers: ## Scale Celery workers (ex: make scale-workers N=4)	docker-compose exec celery-worker celery -A mutiroes_backend inspect active

	@if [ -z "$(N)" ]; then echo "${YELLOW}❌ Uso: make scale-workers N=4${NC}"; exit 1; fi

	docker-compose up -d --scale celery-worker1=$(N) --scale celery-worker2=$(N)celery-stats: ## Show Celery statistics

	@echo "${GREEN}✅ Celery workers escalados para $(N) réplicas${NC}"	docker-compose exec celery-worker celery -A mutiroes_backend inspect stats

	@make status

celery-purge: ## Purge all Celery tasks

# ========================================	docker-compose exec celery-worker celery -A mutiroes_backend purge -f

# Restart

# ========================================# Maintenance

clean-pyc: ## Remove Python cache files

restart: ## Restart all services	find . -type f -name "*.pyc" -delete

	docker-compose restart	find . -type d -name "__pycache__" -delete



restart-backends: ## Restart all backend replicasclean-migrations: ## Remove migration files (except __init__.py)

	docker-compose restart backend1 backend2 backend3	find ./mutiroes_backend -path "*/migrations/*.py" -not -name "__init__.py" -delete



restart-nginx: ## Restart Nginx load balancer# Backup & Restore

	docker-compose restart nginxbackup-db: ## Backup database to file

	docker-compose exec -T backend python manage.py dumpdata --natural-foreign --natural-primary --indent 2 > backup_$(shell date +%Y%m%d_%H%M%S).json

restart-celery: ## Restart celery services

	docker-compose restart celery-worker1 celery-worker2 celery-beatrestore-db: ## Restore database from file (usage: make restore-db FILE=backup.json)

	docker-compose exec -T backend python manage.py loaddata $(FILE)

restart-postgres: ## Restart PostgreSQL

	docker-compose restart postgres# Information

info: ## Show system information

restart-redis: ## Restart Redis	@echo "${GREEN}=== System Information ===${NC}"

	docker-compose restart redis	@echo "${BLUE}Docker Compose:${NC}"

	@docker-compose version

clean: ## Stop and remove all containers, networks, and volumes	@echo ""

	docker-compose down -v	@echo "${BLUE}Running Containers:${NC}"

	docker system prune -f	@docker-compose ps

	@echo ""

# ========================================	@echo "${BLUE}Docker Images:${NC}"

# Database Management	@docker images | grep lastaps

# ========================================

# Quick Start

migrate: ## Run database migrations on PostgreSQLquickstart: build up migrate populate ## Build, start services, migrate, and populate data

	docker-compose exec backend1 python manage.py migrate	@echo "${GREEN}✅ Quick start complete!${NC}"

	@echo "${BLUE}Backend:${NC} http://localhost:8000"

makemigrations: ## Create new migrations	@echo "${BLUE}Create superuser:${NC} make createsuperuser"

	docker-compose exec backend1 python manage.py makemigrations

shell: ## Open Django shell
	docker-compose exec backend1 python manage.py shell

dbshell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U mutiroes_user -d mutiroes_db

# ========================================
# Testing
# ========================================

test: ## Run all tests
	docker-compose exec backend1 python manage.py test

test-events: ## Run events app tests
	docker-compose exec backend1 python manage.py test events

test-users: ## Run users app tests
	docker-compose exec backend1 python manage.py test users

# ========================================
# Admin
# ========================================

createsuperuser: ## Create Django superuser
	docker-compose exec backend1 python manage.py createsuperuser

collectstatic: ## Collect static files
	docker-compose exec backend1 python manage.py collectstatic --noinput

# ========================================
# Data Management
# ========================================

populate: ## Populate database with sample data
	docker-compose exec backend1 python populate_data.py

flush: ## Flush database (WARNING: deletes all data)
	docker-compose exec backend1 python manage.py flush --noinput

# ========================================
# Backup & Restore
# ========================================

backup-db: ## Backup PostgreSQL database
	docker-compose exec -T postgres pg_dump -U mutiroes_user mutiroes_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}✅ Backup criado: backup_$(shell date +%Y%m%d_%H%M%S).sql${NC}"

restore-db: ## Restore PostgreSQL database (usage: make restore-db FILE=backup.sql)
	docker-compose exec -T postgres psql -U mutiroes_user -d mutiroes_db < $(FILE)
	@echo "${GREEN}✅ Database restaurado de $(FILE)${NC}"

backup-json: ## Backup database to JSON
	docker-compose exec -T backend1 python manage.py dumpdata --natural-foreign --natural-primary --indent 2 > backup_$(shell date +%Y%m%d_%H%M%S).json

restore-json: ## Restore database from JSON (usage: make restore-json FILE=backup.json)
	docker-compose exec -T backend1 python manage.py loaddata $(FILE)

# ========================================
# Maintenance
# ========================================

clean-pyc: ## Remove Python cache files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

clean-migrations: ## Remove migration files (except __init__.py)
	find ./mutiroes_backend -path "*/migrations/*.py" -not -name "__init__.py" -delete

celery-purge: ## Purge all Celery tasks
	docker-compose exec celery-worker1 celery -A mutiroes_backend purge -f

# ========================================
# Information
# ========================================

info: ## Show system information
	@echo "${GREEN}=== Informações do Sistema Distribuído ===${NC}"
	@echo ""
	@echo "${BLUE}Docker Compose:${NC}"
	@docker-compose version
	@echo ""
	@echo "${BLUE}Containers em Execução:${NC}"
	@docker-compose ps
	@echo ""
	@echo "${BLUE}Uso de Recursos:${NC}"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $$(docker-compose ps -q)

# ========================================
# Quick Start
# ========================================

quickstart: ## Complete initial setup of distributed system
	@echo "${GREEN}🚀 Iniciando setup do sistema distribuído...${NC}"
	@make build
	@make up
	@echo ""
	@echo "${YELLOW}⏳ Aguardando serviços iniciarem (30s)...${NC}"
	@sleep 30
	@echo ""
	@make migrate
	@echo ""
	@echo "${GREEN}✅ Sistema distribuído pronto!${NC}"
	@echo ""
	@echo "${BLUE}📊 Estatísticas do sistema:${NC}"
	@make status
	@echo ""
	@make health
	@echo ""
	@echo "${YELLOW}💡 Próximos passos:${NC}"
	@echo "   - Criar superusuário: ${BLUE}make createsuperuser${NC}"
	@echo "   - Popular dados: ${BLUE}make populate${NC}"
	@echo "   - Ver logs: ${BLUE}make logs-backend${NC}"
