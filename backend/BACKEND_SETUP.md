# AI Growth Planner Backend Setup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- One of: OpenAI API key, OpenRouter API key, or Ollama running locally

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your configuration (see ENV_SETUP_GUIDE.md)
nano .env

# 4. Start development server
npm run start:dev

# 5. Test
curl http://localhost:3000/api/
```

---

## 📝 Configuration

### Option 1: OpenAI (Default)
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
OPENAI_MODEL=gpt-4-turbo
```
👉 Get key: https://platform.openai.com/api-keys

### Option 2: OpenRouter (Recommended - Cheaper)
```bash
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY_HERE
OPENROUTER_MODEL=openai/gpt-3.5-turbo
OPENROUTER_REFERER=http://localhost:3000
```
👉 Get key: https://openrouter.ai/keys

### Option 3: Ollama (Free - Local)
```bash
# Terminal 1: Start Ollama
brew install ollama && ollama serve

# Terminal 2: Download model
ollama pull mistral

# .env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```
👉 Download: https://ollama.ai

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| `.env.example` | Environment variables template |
| `ENV_SETUP_GUIDE.md` | Detailed setup guide |
| `../CONFIG_SUMMARY.md` | Configuration overview |
| `../AI_PROVIDER_SETUP.md` | AI Provider documentation |
| `../OPENROUTER_TROUBLESHOOTING.md` | Troubleshooting guide |

---

## 🛠️ Available Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger

# Production
npm run build              # Build for production
npm run start:prod         # Run production build

# Testing
npm run test               # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Generate coverage report
npm run test:e2e          # Run end-to-end tests

# Code Quality
npm run lint              # Lint and fix code
npm run format            # Format code with Prettier
```

---

## 📂 Project Structure

```
src/
├── ai-agents/              # AI agents orchestration
│   ├── providers/          # AI provider implementations
│   │   ├── ai.provider.ts  # Unified provider (OpenAI, OpenRouter, Ollama)
│   │   └── openai.provider.ts # Backward compatibility
│   ├── agents/             # 5 specialized agents
│   ├── services/           # Agent orchestration
│   └── ai-agents.module.ts
├── users/                  # User management
├── goals/                  # OKRs management
├── daily-tasks/            # Daily task management
├── progress-tracking/      # Progress tracking
├── reports/                # HR reports
├── planning/               # 6-month planning
├── common/                 # Shared utilities
└── main.ts                # Application entry point
```

---

## 🔌 API Endpoints

### Health Check
```bash
GET /api/
# Returns: { "success": true, "data": "Hello World!" }
```

### Planning (AI Generated)
```bash
POST /api/planning/generate
Content-Type: application/json

{
  "userId": "user-123",
  "currentRole": "Junior Developer",
  "targetRole": "Senior Developer",
  "skills": ["JavaScript", "React"]
}
```

### Users
```bash
POST   /api/users              # Create user
GET    /api/users              # Get all users
GET    /api/users/:id          # Get user by ID
PATCH  /api/users/:id          # Update user
```

### Goals
```bash
POST   /api/goals              # Create goal
GET    /api/goals              # Get all goals
GET    /api/goals/:id          # Get goal by ID
```

### Daily Tasks
```bash
GET    /api/daily-tasks/today  # Get today's tasks
POST   /api/daily-tasks/:id/complete  # Mark task complete
```

---

## 🧪 Testing

### Run all tests
```bash
npm run test
```

### Run specific test file
```bash
npm run test -- users.service.spec.ts
```

### Watch mode
```bash
npm run test:watch
```

### Coverage report
```bash
npm run test:cov
```

---

## 📊 API Documentation

Swagger UI: http://localhost:3000/api/docs

Export OpenAPI JSON: http://localhost:3000/api-json

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Ensure PostgreSQL is running
psql postgres
# Create database if not exists
CREATE DATABASE ai_growth_planner;
```

### AI Provider Error
Check logs for "Initialized AI Provider" message:
```bash
npm run start:dev 2>&1 | grep -i "initialized\|error"
```

### Port Already in Use
```bash
# Change port in .env
PORT=3001
```

### API Key Issues
- OpenAI: https://platform.openai.com/api-keys
- OpenRouter: https://openrouter.ai/keys

See `OPENROUTER_TROUBLESHOOTING.md` for more issues.

---

## 🚀 Deployment

### Docker
```bash
docker build -t ai-growth-planner-backend .
docker run -p 3000:3000 --env-file .env ai-growth-planner-backend
```

### Docker Compose
```bash
docker-compose up -d
```

### Environment (Production)
```env
NODE_ENV=production
DATABASE_HOST=your_production_db
AI_PROVIDER=openai  # or openrouter
OPENAI_API_KEY=sk-...
```

---

## 📚 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: NestJS 11
- **Database**: PostgreSQL + TypeORM
- **API Docs**: Swagger/OpenAPI
- **AI**: OpenAI SDK + Axios (for OpenRouter/Ollama)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest

---

## 🔒 Security Notes

- Never commit `.env` file
- API keys should be stored securely
- Use environment variables for secrets
- Database password should be strong
- Consider rate limiting in production

---

## 📞 Support

1. Read the documentation files
2. Check logs: `npm run start:dev 2>&1`
3. Test API: `curl http://localhost:3000/api/`
4. Review code in `src/`

---

## 📄 License

UNLICENSED

---

## 👥 Contributing

Follow the coding guidelines in `Prompt-Rules.md` and project architecture rules.

---

Last Updated: December 14, 2025
