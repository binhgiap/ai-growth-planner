#!/bin/bash

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Growth Planner - Render Deployment Setup${NC}\n"

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Git not initialized${NC}"
    echo "Run: git init && git remote add origin <your-github-url>"
    exit 1
fi
echo -e "${GREEN}✅ Git initialized${NC}"

# Check if backend exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend directory found${NC}"

# Check if web exists
if [ ! -d "web" ]; then
    echo -e "${RED}❌ Web directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Web directory found${NC}"

# Check environment files
echo -e "\n${YELLOW}🔐 Checking environment files...${NC}"

if [ ! -f "backend/.env.example" ]; then
    echo -e "${RED}❌ backend/.env.example not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ backend/.env.example exists${NC}"

if [ ! -f "web/.env.local.example" ]; then
    echo -e "${RED}❌ web/.env.local.example not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ web/.env.local.example exists${NC}"

# Check package.json files
echo -e "\n${YELLOW}📦 Checking package.json files...${NC}"

if [ ! -f "backend/package.json" ]; then
    echo -e "${RED}❌ backend/package.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ backend/package.json exists${NC}"

if [ ! -f "web/package.json" ]; then
    echo -e "${RED}❌ web/package.json not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ web/package.json exists${NC}"

# Check lock files
echo -e "\n${YELLOW}🔒 Checking lock files...${NC}"

if [ ! -f "backend/pnpm-lock.yaml" ]; then
    echo -e "${YELLOW}⚠️  backend/pnpm-lock.yaml not found${NC}"
    echo "This is needed for Render to install dependencies"
    read -p "Would you like to generate it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend
        npm install -g pnpm
        pnpm install
        cd ..
        echo -e "${GREEN}✅ pnpm-lock.yaml generated${NC}"
    fi
fi

# Verify build scripts
echo -e "\n${YELLOW}🔧 Verifying build scripts...${NC}"

# Check backend build
if grep -q '"build": "nest build"' backend/package.json; then
    echo -e "${GREEN}✅ Backend build script configured${NC}"
else
    echo -e "${RED}❌ Backend build script missing${NC}"
    exit 1
fi

# Check backend start
if grep -q '"start": "node dist/main' backend/package.json || grep -q '"start:prod"' backend/package.json; then
    echo -e "${GREEN}✅ Backend start script configured${NC}"
else
    echo -e "${RED}❌ Backend start script missing${NC}"
    exit 1
fi

# Check frontend build
if grep -q '"build": "next build"' web/package.json; then
    echo -e "${GREEN}✅ Frontend build script configured${NC}"
else
    echo -e "${RED}❌ Frontend build script missing${NC}"
    exit 1
fi

# Check frontend start
if grep -q '"start": "next start"' web/package.json; then
    echo -e "${GREEN}✅ Frontend start script configured${NC}"
else
    echo -e "${RED}❌ Frontend start script missing${NC}"
    exit 1
fi

# Check if .env files are in .gitignore
echo -e "\n${YELLOW}🛡️  Checking .gitignore...${NC}"

if grep -q "\.env" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .env files in .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  .env files might not be in .gitignore${NC}"
    read -p "Add .env to .gitignore? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ".env*" >> .gitignore
        echo -e "${GREEN}✅ Added to .gitignore${NC}"
    fi
fi

# Final summary
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All checks passed!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📝 Next steps for Render deployment:${NC}\n"

echo "1. Push to GitHub:"
echo "   ${BLUE}git add .${NC}"
echo "   ${BLUE}git commit -m 'Prepare for Render deployment'${NC}"
echo "   ${BLUE}git push origin main${NC}\n"

echo "2. Create PostgreSQL database on Render.com\n"

echo "3. Deploy Backend:"
echo "   - New Web Service → GitHub repo"
echo "   - Root directory: ./backend"
echo "   - Build: npm install -g pnpm && pnpm install && pnpm run build"
echo "   - Start: node dist/main.js"
echo "   - Add environment variables (see .env.example)\n"

echo "4. Deploy Frontend:"
echo "   - New Web Service → GitHub repo"
echo "   - Root directory: ./web"
echo "   - Build: npm install && npm run build"
echo "   - Start: npm run start"
echo "   - Set NEXT_PUBLIC_API_URL to backend URL\n"

echo -e "${YELLOW}📚 Documentation:${NC}"
echo "   - See: RENDER_DEPLOYMENT_GUIDE.md"
echo "   - See: RENDER_DEPLOYMENT_CHECKLIST.md\n"

echo -e "${GREEN}Good luck! 🚀${NC}"
