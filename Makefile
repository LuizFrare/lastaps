.PHONY: help build up down logs restart clean migrate shell test

# Colors
BLUE=\033[0;34m
GREEN=\033[0;32m
NC=\033[0m # No Color

help: ## Show this help message
	@echo '${GREEN}=== Mutirões - Commands ===${NC}'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${BLUE}%-20s${NC} %s\n", $$1, $$2}'

# Docker Compose
build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d
	@echo "${GREEN}✅ Services started!${NC}"
	@echo "${BLUE}Backend API:${NC} http://localhost:8000"
	@echo "${BLUE}API Docs:${NC} http://localhost:8000/api/"
	@echo "${BLUE}Admin:${NC} http://localhost:8000/admin/"

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs only
	docker-compose logs -f backend

logs-celery: ## View celery worker logs
	docker-compose logs -f celery-worker

logs-beat: ## View celery beat logs
	docker-compose logs -f celery-beat

restart: ## Restart all services
	docker-compose restart

restart-backend: ## Restart backend only
	docker-compose restart backend

restart-celery: ## Restart celery services
	docker-compose restart celery-worker celery-beat

clean: ## Stop and remove all containers, networks, and volumes
	docker-compose down -v
	docker system prune -f

# Database
migrate: ## Run database migrations
	docker-compose exec backend python manage.py migrate

makemigrations: ## Create new migrations
	docker-compose exec backend python manage.py makemigrations

shell: ## Open Django shell
	docker-compose exec backend python manage.py shell

dbshell: ## Open database shell
	docker-compose exec backend python manage.py dbshell

# Development
dev-backend: ## Run backend locally (without Docker)
	cd mutiroes_backend && python manage.py runserver

dev-frontend: ## Run frontend locally (without Docker)
	cd mutiroes-frontend && npm run dev

# Testing
test: ## Run all tests
	docker-compose exec backend python manage.py test

test-events: ## Run events app tests
	docker-compose exec backend python manage.py test events

test-users: ## Run users app tests
	docker-compose exec backend python manage.py test users

# Admin
createsuperuser: ## Create Django superuser
	docker-compose exec backend python manage.py createsuperuser

collectstatic: ## Collect static files
	docker-compose exec backend python manage.py collectstatic --noinput

# Data Management
populate: ## Populate database with sample data
	docker-compose exec backend python populate_data.py

flush: ## Flush database (WARNING: deletes all data)
	docker-compose exec backend python manage.py flush --noinput

# Health & Status
health: ## Check backend health
	@curl -s http://localhost:8000/health/ || echo "${BLUE}Backend is not running${NC}"

status: ## Show service status
	docker-compose ps

# Celery Management
celery-status: ## Check Celery worker status
	docker-compose exec celery-worker celery -A mutiroes_backend inspect active

celery-stats: ## Show Celery statistics
	docker-compose exec celery-worker celery -A mutiroes_backend inspect stats

celery-purge: ## Purge all Celery tasks
	docker-compose exec celery-worker celery -A mutiroes_backend purge -f

# Maintenance
clean-pyc: ## Remove Python cache files
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

clean-migrations: ## Remove migration files (except __init__.py)
	find ./mutiroes_backend -path "*/migrations/*.py" -not -name "__init__.py" -delete

# Backup & Restore
backup-db: ## Backup database to file
	docker-compose exec -T backend python manage.py dumpdata --natural-foreign --natural-primary --indent 2 > backup_$(shell date +%Y%m%d_%H%M%S).json

restore-db: ## Restore database from file (usage: make restore-db FILE=backup.json)
	docker-compose exec -T backend python manage.py loaddata $(FILE)

# Information
info: ## Show system information
	@echo "${GREEN}=== System Information ===${NC}"
	@echo "${BLUE}Docker Compose:${NC}"
	@docker-compose version
	@echo ""
	@echo "${BLUE}Running Containers:${NC}"
	@docker-compose ps
	@echo ""
	@echo "${BLUE}Docker Images:${NC}"
	@docker images | grep lastaps

# Quick Start
quickstart: build up migrate populate ## Build, start services, migrate, and populate data
	@echo "${GREEN}✅ Quick start complete!${NC}"
	@echo "${BLUE}Backend:${NC} http://localhost:8000"
	@echo "${BLUE}Create superuser:${NC} make createsuperuser"
