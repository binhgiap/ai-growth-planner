#!/bin/bash
# AI Growth Planner - Docker Startup Script

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.example"

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}AI Growth Planner - Docker Setup${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}[1/4] Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}✗ Docker is not installed${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}✗ Docker Compose is not installed${NC}"; exit 1; }
echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Step 2: Setup environment file
echo -e "${YELLOW}[2/4] Setting up environment...${NC}"
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file from .env.example..."
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo -e "${GREEN}✓ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠ Please update the following in .env:${NC}"
    echo "  - OPENAI_API_KEY: Add your OpenAI API key"
    echo "  - DATABASE_PASSWORD: Change default password"
    echo "  - JWT_SECRET: Change to a secure secret"
    echo ""
    echo -e "${YELLOW}Edit .env and run: make up${NC}"
    exit 0
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi
echo ""

# Step 3: Validate required environment variables
echo -e "${YELLOW}[3/4] Validating environment...${NC}"
required_vars=(
    "OPENAI_API_KEY"
    "DATABASE_USERNAME"
    "DATABASE_PASSWORD"
    "DATABASE_NAME"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE" || grep "^${var}=$" "$ENV_FILE" >/dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}✗ Missing or empty environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo -e "${YELLOW}Please update .env file and try again${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All required environment variables are set${NC}"
echo ""

# Step 4: Build and start services
echo -e "${YELLOW}[4/4] Building and starting services...${NC}"
cd "$SCRIPT_DIR"

echo "Building Docker images..."
docker-compose build --quiet

echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be healthy..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "ai-growth-planner-backend.*Up"; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend failed to start${NC}"
    docker-compose logs backend
    exit 1
fi

if docker-compose ps | grep -q "ai-growth-planner-db.*Up"; then
    echo -e "${GREEN}✓ Database is running${NC}"
else
    echo -e "${RED}✗ Database failed to start${NC}"
    docker-compose logs postgres
    exit 1
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${GREEN}Access your services:${NC}"
echo "  • Backend API:      http://localhost:3000"
echo "  • pgAdmin Console:  http://localhost:5050"
echo ""
echo -e "${YELLOW}Default pgAdmin Credentials:${NC}"
echo "  • Email:     admin@example.com"
echo "  • Password:  admin"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  • View logs:     make logs"
echo "  • Open shell:    make shell"
echo "  • Stop services: make down"
echo "  • Restart:       make restart"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
