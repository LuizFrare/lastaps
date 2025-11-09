.PHONY: help build up down logs restart clean migrate shell test

# Colors
BLUE=\033[0;34m
NC=\033[0m # No Color

help: ## Show this help message
	@echo '${BLUE}Available commands:${NC}'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${BLUE}%-20s${NC} %s\n", $$1, $$2}'

# Development
dev-up: ## Start development environment
	docker-compose up --build

dev-down: ## Stop development environment
	docker-compose down

# Distributed System
build: ## Build all Docker images
	docker-compose -f docker-compose.distributed.yml build

up: ## Start distributed system
	docker-compose -f docker-compose.distributed.yml up -d
	@echo "${BLUE}Services starting...${NC}"
	@echo "App: http://localhost"
	@echo "Flower: http://localhost:5555"
	@echo "Consul: http://localhost:8500"

down: ## Stop distributed system
	docker-compose -f docker-compose.distributed.yml down

logs: ## View logs
	docker-compose -f docker-compose.distributed.yml logs -f

restart: ## Restart distributed system
	docker-compose -f docker-compose.distributed.yml restart

clean: ## Clean up containers, networks, and volumes
	docker-compose -f docker-compose.distributed.yml down -v
	docker system prune -f

# Database
migrate: ## Run database migrations
	docker-compose -f docker-compose.distributed.yml exec backend1 python manage.py migrate

makemigrations: ## Create new migrations
	docker-compose -f docker-compose.distributed.yml exec backend1 python manage.py makemigrations

shell: ## Django shell
	docker-compose -f docker-compose.distributed.yml exec backend1 python manage.py shell

dbshell: ## PostgreSQL shell
	docker-compose -f docker-compose.distributed.yml exec postgres-primary psql -U mutiroes_user -d mutiroes_db

# Testing
test: ## Run tests
	docker-compose -f docker-compose.distributed.yml exec backend1 python manage.py test

# Scaling
scale-backend: ## Scale backend (usage: make scale-backend N=5)
	docker-compose -f docker-compose.distributed.yml up -d --scale backend1=$(N) --no-recreate

scale-frontend: ## Scale frontend (usage: make scale-frontend N=3)
	docker-compose -f docker-compose.distributed.yml up -d --scale frontend1=$(N) --no-recreate

scale-celery: ## Scale celery workers (usage: make scale-celery N=4)
	docker-compose -f docker-compose.distributed.yml up -d --scale celery-worker1=$(N) --no-recreate

# Health Checks
health: ## Check system health
	@echo "${BLUE}Checking system health...${NC}"
	@curl -s http://localhost/health | python3 -m json.tool || echo "Health check failed"

status: ## Show service status
	docker-compose -f docker-compose.distributed.yml ps

# Monitoring
flower: ## Open Flower UI
	@echo "${BLUE}Opening Flower...${NC}"
	@open http://localhost:5555 || xdg-open http://localhost:5555

consul: ## Open Consul UI
	@echo "${BLUE}Opening Consul...${NC}"
	@open http://localhost:8500 || xdg-open http://localhost:8500

# Maintenance
cleanup-tasks: ## Cleanup old Celery tasks
	docker-compose -f docker-compose.distributed.yml exec backend1 python manage.py shell -c "from django_celery_beat.models import PeriodicTask; PeriodicTask.objects.filter(enabled=False).delete()"

collectstatic: ## Collect static files
	docker-compose -f docker-compose.distributed.yml exec backend1 python manage.py collectstatic --noinput

# Backup
backup-db: ## Backup PostgreSQL database
	docker-compose -f docker-compose.distributed.yml exec -T postgres-primary pg_dump -U mutiroes_user mutiroes_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database (usage: make restore-db FILE=backup.sql)
	docker-compose -f docker-compose.distributed.yml exec -T postgres-primary psql -U mutiroes_user mutiroes_db < $(FILE)
