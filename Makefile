.PHONY: help build up down logs shell db-shell restart rebuild clean test lint format

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help:
	@echo "$(GREEN)AI Growth Planner - Docker Make Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Setup:$(NC)"
	@echo "  make setup             - Setup environment (.env file)"
	@echo "  make build             - Build Docker images"
	@echo ""
	@echo "$(YELLOW)Running:$(NC)"
	@echo "  make up                - Start all services"
	@echo "  make down              - Stop all services"
	@echo "  make restart           - Restart all services"
	@echo "  make rebuild           - Rebuild and restart services"
	@echo ""
	@echo "$(YELLOW)Logs & Debugging:$(NC)"
	@echo "  make logs              - View backend logs"
	@echo "  make logs-db           - View database logs"
	@echo "  make logs-all          - View all logs"
	@echo "  make shell             - Access backend container shell"
	@echo "  make db-shell          - Access PostgreSQL shell"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make lint              - Run linter"
	@echo "  make test              - Run tests"
	@echo "  make format            - Format code"
	@echo ""
	@echo "$(YELLOW)Cleanup:$(NC)"
	@echo "  make clean             - Remove containers and volumes"
	@echo "  make clean-hard        - Remove everything including volumes"
	@echo ""

setup:
	@echo "$(YELLOW)Setting up environment...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env file created from .env.example$(NC)"; \
		echo "$(YELLOW)Please edit .env and add your OPENAI_API_KEY$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists$(NC)"; \
	fi

build:
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ Build complete$(NC)"

up:
	@echo "$(YELLOW)Starting services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo ""
	@echo "$(GREEN)Access points:$(NC)"
	@echo "  API:      http://localhost:3000"
	@echo "  pgAdmin:  http://localhost:5050"
	@echo ""

down:
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: down up
	@echo "$(GREEN)✓ Services restarted$(NC)"

rebuild:
	@echo "$(YELLOW)Rebuilding and restarting...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)✓ Rebuild complete$(NC)"

logs:
	docker-compose logs -f backend

logs-db:
	docker-compose logs -f postgres

logs-all:
	docker-compose logs -f

shell:
	@echo "$(YELLOW)Accessing backend container shell...$(NC)"
	docker-compose exec backend sh

db-shell:
	@echo "$(YELLOW)Accessing PostgreSQL shell...$(NC)"
	docker-compose exec postgres psql -U postgres -d ai_growth_planner

lint:
	@echo "$(YELLOW)Running linter...$(NC)"
	docker-compose exec backend npm run lint

test:
	@echo "$(YELLOW)Running tests...$(NC)"
	docker-compose exec backend npm run test

format:
	@echo "$(YELLOW)Formatting code...$(NC)"
	docker-compose exec backend npm run format 2>/dev/null || docker-compose exec backend npm run lint -- --fix

clean:
	@echo "$(RED)Removing containers...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Containers removed$(NC)"

clean-hard:
	@echo "$(RED)Removing containers and volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✓ Containers and volumes removed$(NC)"

ps:
	@echo "$(YELLOW)Running containers:$(NC)"
	docker-compose ps

status:
	@echo "$(YELLOW)Service status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(YELLOW)Health checks:$(NC)"
	@docker-compose exec -T backend curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✓ Backend is healthy$(NC)" || echo "$(RED)✗ Backend is not responding$(NC)"
	@docker-compose exec -T postgres pg_isready -U postgres > /dev/null && echo "$(GREEN)✓ Database is healthy$(NC)" || echo "$(RED)✗ Database is not responding$(NC)"
