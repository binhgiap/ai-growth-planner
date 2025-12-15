# 🤖 GitHub Copilot – Global Coding Instructions

# 1. Purpose & Scope

## Purpose
The **AI Growth Planner** project aims to automate and personalize the employee development process by generating a fully customized **6-month growth plan** using an AI multi-agent system.

The platform helps employees understand what they need to learn to advance their careers and provides companies with a **transparent, data-driven performance evaluation tool**.

Primary goals include:
- Generating individualized 6-month development plans based on the employee’s current role, skills, and target level.
- Breaking high-level OKRs into **weekly milestones** and **180 daily actionable tasks**.
- Tracking progress objectively through daily check-ins and completion logs.
- Producing monthly and final HR reports summarizing performance, growth trajectory, and promotion readiness.
- Standardizing the personal development and performance evaluation workflow across the company.

The system acts both as an **AI-driven personal growth assistant** and an **HR evaluation support tool**.

---

## Scope

### 1. User Input
Employees will provide:
- Current role (e.g., Backend Developer – Mid level)
- Current skills and proficiency levels
- Target role or development goal for the next 6 months
- Available daily study/work time

### 2. AI Multi-Agent Workflow
The backend uses OpenAI to run multiple coordinated agents:

- **SkillGapAgent:** analyzes current vs. target skill gaps  
- **GoalPlannerAgent:** generates SMART 6-month OKRs  
- **DailyTaskAgent:** produces a detailed 180-day task plan  
- **ProgressTrackerAgent:** calculates weekly/monthly progress, completion rate, and consistency  
- **HRReportAgent:** generates monthly and final performance evaluation reports  

### 3. Backend (NestJS)
The backend responsibilities include:
- REST API for Users, Goals, Daily Tasks, Progress, and Reports  
- Multi-agent orchestration pipeline using OpenAI  
- Dedicated AI provider for model interaction  
- Data storage using PostgreSQL  
- Generating key outputs (OKRs, daily tasks, reports)

### 4. Web Frontend (Next.js App Router)
The web dashboard supports:
- User onboarding & goal setup workflow  
- Skill gap visualization  
- 6-month OKR overview  
- 180-day timeline viewer  
- Weekly & monthly progress analytics  
- HR report viewer  

### 5. Deliverables
This project will deliver:
- Fully functional backend with AI multi-agent system  
- Next.js dashboard for planning and analytics  
- React Native mobile app for daily progress tracking  
- Auto-generated HR reports (monthly + final)  
- Demo-ready dataset and flow for hackathon presentation  

---

# 2. ARCHITECTURE RULES

## 2.1 Backend Structure (NestJS)

Follow this folder pattern:

### Each module MUST contain:

- `*.module.ts`
- `*.service.ts`
- `*.controller.ts`
- `/dto/*.dto.ts`
- `/entities/*.entity.ts`
- Unit-testable functions

### Requirements:

- Use **Dependency Injection**
- Avoid business logic in controllers
- Agents must be isolated in providers
- Use DTO validation (`class-validator`, `class-transformer`)
- API must return **JSON only**

---

# 3. AI MULTI-AGENT RULES

System contains 5 agents:

1. **SkillGapAgent**

   - Input: user profile + target role
   - Output: skill gap analysis, prioritized

2. **GoalPlannerAgent**

   - Converts skill gap → 6-month OKRs

3. **DailyTaskAgent**

   - Converts OKRs → 180 daily tasks

4. **ProgressTrackerAgent**

   - Evaluates task completion, weekly & monthly progress

5. **HRReportAgent**
   - Summary for review: strengths, weaknesses, completion, recommendations

### AI-related rules:

- Always use a `OpenAIProvider` wrapper
- Never put prompts directly inside controllers
- Return structured JSON only (no natural language output unless required)
- Each agent has `systemPrompt`, `exampleInputs`, `expectedOutputs` templates

---

# 4. FRONTEND RULES (Next.js App Router)

Folder structure:

### UI Rules:

- Use TailwindCSS
- Use shadcn/ui components
- Create reusable components (Card, Button, ProgressRing, TaskItem)
- Use **Server Components by default**
- Fetch data using async server functions
- Use Zod for schema validation (client + server)

### Pages:

- `/dashboard` → summary of goals and progress
- `/plan` → 6-month OKRs + skill gap
- `/daily` → daily tasks (optional web view)
- `/reports` → HR evaluation

---

# 5. CODING STYLE

### General Rules:

- Use **TypeScript** everywhere
- Prefer **async/await**
- Avoid `any`
- Use consistent naming: `kebab-case` for files, `camelCase` for variables
- Avoid deeply nested logic – refactor into pure functions

### Backend:

- Keep services small & focused
- Controllers should only:
  - validate request
  - forward to service
  - return response
- Handle errors using `HttpException`

### Frontend:

- Create small reusable UI components
- Use layout primitives: `<Container>`, `<Section>`, `<Card>`
- No inline styling (always classes)
- Use hooks only for client components

---

# 6. API CONTRACT RULES

When Copilot generates APIs, they must follow this:

### Endpoint rules:

| Feature         | Endpoint                    | Method             |
| --------------- | --------------------------- | ------------------ |
| Profile         | `/users/profile`            | GET / POST / PATCH |
| Goals           | `/goals`                    | GET / POST         |
| Daily Tasks     | `/daily-tasks/today`        | GET                |
| Mark Complete   | `/daily-tasks/:id/complete` | POST               |
| Reports         | `/reports/summary`          | GET                |
| HR Final Report | `/reports/final`            | GET                |

### Response format:

```json
{
  "success": true,
  "data": { ... }
}
```

## 7. Coding Standards

### TypeScript Best Practices:

- **Strict mode**: Always use `strict: true` in `tsconfig.json`
- **No implicit any**: Every variable and parameter must have explicit type
- **Discriminated unions**: Use for complex state management
- **Type guards**: Implement custom type guards for safety
- **Interfaces over implementations**: Define contracts before implementation
- **Immutability**: Prefer `readonly` and `const` assertions

### Testing Standards:

- Unit tests for all services
- Integration tests for API endpoints
- Coverage target: **≥80%** for business logic
- Use Jest with `describe` and `it` patterns
- Mock external dependencies (OpenAI, Database)
- Test both happy path and error cases

### Code Quality:

- ESLint configuration must pass without warnings
- Prettier formatting enforced (2-space indentation)
- No console.log in production code (use NestJS Logger)
- No hardcoded secrets or API keys
- Comments only for complex business logic, not obvious code

---

## 8. Architecture Principles & Single Responsibility & Anti-Duplication Rules

### SOLID Principles:

- **Single Responsibility**: Each class/function has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Interfaces must be properly implemented
- **Interface Segregation**: Don't force unnecessary dependencies
- **Dependency Inversion**: Depend on abstractions, not concrete implementations

### Anti-Duplication Strategy:

- **DRY (Don't Repeat Yourself)**:
  - Extract shared logic into utility functions
  - Create reusable service methods
  - Use inheritance and composition appropriately
- **Common patterns**:

  - Validation logic → DTOs + `class-validator`
  - API response formatting → Interceptors
  - Error handling → Exception filters
  - Database queries → Repository patterns
  - AI prompt templates → Dedicated files in `/ai-agents/agents/`

- **When duplication is unavoidable**:
  - Document why with comments
  - Link between duplicated sections
  - Plan future refactoring

### Service Layer Rules:

- Services handle business logic only
- One service = one domain concept (User, Goal, Task, etc.)
- Inject dependencies via constructor
- Methods should be atomic (one operation per method)
- Return DTOs, never raw entities

### Database Layer Rules:

- Use TypeORM entities as data models
- Repositories for data access
- Keep database logic out of services
- Use migrations for schema changes

---

## 9. Change Rules

### When Adding Features:

1. **Plan before coding**:

   - Identify all affected modules
   - Design DTOs and entities
   - Plan API endpoints
   - Review existing code for reuse

2. **Modification checklist**:

   - Update all related DTOs
   - Add/modify database migrations
   - Update services with new business logic
   - Add controller endpoints
   - Update frontend components if needed

3. **Breaking Changes**:
   - Never break existing API contracts without discussion
   - Version API endpoints if needed
   - Provide migration guides for clients

### When Modifying Existing Code:
- Check for related code that may need updates

### When Adding Dependencies:

- Prefer established, well-maintained packages
- Check package.json lock files before adding
- Avoid duplicate dependencies

---

## 10. Security Rules

### Authentication & Authorization:

- All endpoints except `/auth/*` require valid JWT token
- Use `@UseGuards(JwtAuthGuard)` on protected routes
- Implement role-based access control (RBAC) where needed
- Validate user ownership of resources before operations

### Data Protection:

- Never log sensitive data (passwords, tokens, API keys)
- Sanitize user inputs using class-validator
- Use parameterized queries (TypeORM handles this)
- Encrypt sensitive data at rest if applicable
- Never store passwords in plain text

### API Security:

- Validate all incoming requests against DTOs
- Return generic error messages (don't expose internal details)
- Implement rate limiting for public endpoints (future enhancement)
- Use CORS properly (only allow trusted origins)
- Implement request size limits

### Environment Variables:

- Store all secrets in `.env` files (never in git)
- Validate environment variables on startup (use `env-validation.config.ts`)
- Use `process.env` with type safety through config services
- Different configs for dev/test/production

### Frontend Security:

- Never hardcode API URLs (use environment variables)
- Use HTTPS only in production
- Implement CSP headers
- Sanitize user-generated content
- Validate API responses using Zod schemas

---

## 11. Communication Style

### Code Comments:

- Explain **why**, not **what** (code shows what)
- Mark TODOs with context: `// TODO: [reason] - [deadline/ticket]`

### Git Commits:

- Format: `[type]: [short description]`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Example: `feat: add skill-gap analysis agent`
- Include issue/ticket number if applicable

### API Documentation:

- Use Swagger/OpenAPI annotations in controllers
- Explain error responses

### PR/Code Review:

- Link to issue/ticket
- Describe changes and why they're needed
- Note any breaking changes
- Highlight areas needing review
- Ask questions respectfully

### Error Messages:

- Be specific about what went wrong
- Suggest corrective action when possible
- Include context (e.g., user ID, timestamp)
- Use consistent error code format

---

## 12. Hard Constraints

### Must Always Follow:

1. **No shortcutting architecture**: Every feature must follow the full module structure (controller → service → database)
2. **Type safety**: Zero `any` types allowed without explicit justification
3. **No business logic in controllers**: All logic must be in services
4. **No prompts in controllers**: All AI prompts must be in dedicated agent files
5. **Test coverage**: All public methods must have corresponding tests
6. **Structured JSON responses**: All APIs return `{ success: boolean, data: T, error?: string }`

### Forbidden Patterns:

- ❌ Direct database queries in controllers
- ❌ Business logic in routes/pages
- ❌ Fetch/axios calls without error handling
- ❌ Async operations without try-catch or proper error handling
- ❌ Inline styling in React components (use Tailwind classes)
- ❌ Global state management (use Context API or props drilling for this size app)
- ❌ Direct imports across module boundaries (use services/interfaces)

### Frontend Constraints:

- ❌ No class components (use functional components only)
- ❌ No useState for data fetching (use server components or proper hooks)
- ❌ No multiple useState calls for related state (use useReducer)
- ❌ No prop drilling beyond 2 levels (refactor into smaller components)

### Backend Constraints:

- ❌ No circular dependencies between modules
- ❌ No direct entity export to client (always use DTOs)
- ❌ No unhandled promise rejections
- ❌ No magic numbers/strings (extract to constants or enums)
- ❌ No N+1 query problems (eager load related entities)

### Performance:

- Implement pagination for list endpoints (default 20 items/page)
- Cache AI agent responses when appropriate
- Use database indexes on frequently queried fields
- Lazy load heavy computations
- Implement request/response compression

### Database Constraints:

- All table names must be `snake_case`
- All columns must have appropriate indexes
- Foreign keys must be explicitly defined
- Implement soft deletes where needed (add `deletedAt` timestamp)
- Never hardcode database connection strings

### Logging & Monitoring:

- Use NestJS Logger with context (module name)
- Log all API requests (method, URL, response code, duration)
- Log errors with stack traces
- Don't log sensitive information
- Include request IDs for tracing

### Deployment:

- Docker images must be multi-stage builds
- Health check endpoints required (`/health`)
- Graceful shutdown implementation
- Environment-specific configurations
- Database migrations must run automatically on startup
