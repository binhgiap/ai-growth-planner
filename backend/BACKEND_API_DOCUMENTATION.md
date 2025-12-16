## AI Growth Planner – Backend API Documentation

This document describes the main REST API endpoints that the frontend uses to integrate with the AI Growth Planner backend.

It complements `AUTH_API_DOCUMENTATION.md` (which documents `/auth` in detail) by covering the rest of the feature modules.

---

## Base Information

- **Base URL (dev)**: `http://localhost:3000/api`
- **Global prefix**: All routes are prefixed with `/api`
- **Content-Type**: `application/json`
- **Authentication**
  - Auth endpoints use **JWT** and return an `accessToken` (see `AUTH_API_DOCUMENTATION.md`)
  - Protected endpoints require: `Authorization: Bearer <accessToken>`
- **Standard response envelope**
  - Most endpoints wrap data as:

    ```json
    {
      "success": true,
      "data": { /* resource or list */ },
      "message": "Optional human-readable message",
      "count": 0,
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 0,
        "totalPages": 0
      }
    }
    ```

  - Error responses follow NestJS HTTP exception format:

    ```json
    {
      "statusCode": 400,
      "message": "Error message",
      "error": "Bad Request"
    }
    ```

> **Note**: Full interactive docs are always available at `http://localhost:3000/api/docs` (Swagger UI).

---

## Authentication & Users

### Auth (`/auth`)

Authentication endpoints (`/auth/register`, `/auth/login`, `/auth/me`, `/auth/change-password`, `/auth/refresh`) are already fully documented in `AUTH_API_DOCUMENTATION.md`. The frontend should:

- Use those endpoints to obtain and refresh `accessToken`
- Persist the token (e.g. `localStorage`) and include `Authorization: Bearer <token>` for protected routes below

### Users (`/users`)

All `/users` endpoints are **protected** with JWT. Some are **admin-only**.

#### 1. Create user (Admin only)

- **Endpoint**: `POST /api/users`
- **Auth**: `Authorization: Bearer <accessToken>` (role: `admin`)
- **Body** (`CreateUserDto` – simplified):

  ```json
  {
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "password": "Password123!",
    "role": "user"
  }
  ```

- **Response** `201`:

  ```json
  {
    "success": true,
    "data": { /* created user */ },
    "message": "User created successfully"
  }
  ```

#### 2. List users (Admin only, paginated)

- **Endpoint**: `GET /api/users`
- **Auth**: `Authorization: Bearer <accessToken>` (role: `admin`)
- **Query params**:
  - `page` (number, optional, default `1`)
  - `limit` (number, optional, default `10`)
- **Response** `200`:

  ```json
  {
    "success": true,
    "data": [ /* users */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "totalPages": 5
    }
  }
  ```

#### 3. Get user profile with related data

- **Endpoint**: `GET /api/users/profile/:id`
- **Auth**: `Authorization: Bearer <accessToken>`
- **Path params**:
  - `id`: user ID (UUID)
- **Response** `200`:

  ```json
  {
    "success": true,
    "data": {
      /* user plus related entities (goals, tasks, etc.) depending on service implementation */
    }
  }
  ```

#### 4. Get user by ID

- **Endpoint**: `GET /api/users/:id`
- **Auth**: `Authorization: Bearer <accessToken>`
- **Path params**:
  - `id`: user ID
- **Response** `200`:

  ```json
  { "success": true, "data": { /* user */ } }
  ```

#### 5. Update user

- **Endpoint**: `PATCH /api/users/:id`
- **Auth**: `Authorization: Bearer <accessToken>`
- **Body** (`UpdateUserDto`, all fields optional):

  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "manager"
  }
  ```

- **Response** `200`:

  ```json
  {
    "success": true,
    "data": { /* updated user */ },
    "message": "User updated successfully"
  }
  ```

#### 6. Delete user (soft delete, Admin only)

- **Endpoint**: `DELETE /api/users/:id`
- **Auth**: `Authorization: Bearer <accessToken>` (role: `admin`)
- **Response** `204`:

  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

---

## Goals / OKRs (`/goals`)

> **Important**: These endpoints currently **do not validate JWT** and identify the user via `userId` query param. The frontend must always pass `userId`. In a future hardening step, you may want to secure them with JWT and derive `userId` from the token instead.

### 1. Create goal

- **Endpoint**: `POST /api/goals?userId=<user-id>`
- **Body** (`CreateGoalDto`):

  ```json
  {
    "title": "Master System Design",
    "description": "Learn and implement large-scale system design patterns",
    "type": "OBJECTIVE",             // 'OBJECTIVE' | 'KEY_RESULT'
    "startDate": "2024-01-01T00:00:00.000Z",
    "targetDate": "2024-06-30T00:00:00.000Z",
    "priority": 1,
    "notes": "Focus on distributed systems and microservices"
  }
  ```

- **Response** `201`:

  ```json
  {
    "success": true,
    "data": { /* GoalResponseDto */ },
    "message": "Goal created successfully"
  }
  ```

### 2. List goals for a user

- **Endpoint**: `GET /api/goals?userId=<user-id>&status=IN_PROGRESS`
- **Query params**:
  - `userId` (required)
  - `status` (optional): `'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'`
- **Response** `200`:

  ```json
  {
    "success": true,
    "data": [ /* GoalResponseDto[] */ ],
    "count": 3
  }
  ```

### 3. Get goals by type

- **Endpoint**: `GET /api/goals/type/:type?userId=<user-id>`
- **Path params**:
  - `type`: `'OBJECTIVE' | 'KEY_RESULT'`
- **Query params**:
  - `userId` (required)

### 4. Get overall goal progress summary

- **Endpoint**: `GET /api/goals/progress/summary?userId=<user-id>`
- **Response** `200`:

  ```json
  {
    "success": true,
    "data": { "overallProgress": 45.5 }
  }
  ```

### 5. Get goal by ID

- **Endpoint**: `GET /api/goals/:id?userId=<user-id>`

### 6. Update goal

- **Endpoint**: `PATCH /api/goals/:id?userId=<user-id>`
- **Body** (`UpdateGoalDto`, all optional):

  ```json
  {
    "title": "Master System Design and Architecture",
    "description": "Hands-on projects included",
    "progress": 60.5,
    "status": "IN_PROGRESS",
    "priority": 1,
    "notes": "Updated focus areas"
  }
  ```

### 7. Delete goal

- **Endpoint**: `DELETE /api/goals/:id?userId=<user-id>`
- **Response** `204` with `{ "success": true, "message": "Goal deleted successfully" }` body.

---

## Daily Tasks (`/daily-tasks`)

Similar to goals, daily task endpoints are keyed by `userId` query param.

### 1. Create daily task

- **Endpoint**: `POST /api/daily-tasks?userId=<user-id>`
- **Body** (`CreateDailyTaskDto`):

  ```json
  {
    "title": "Read system design chapter 3",
    "description": "Focus on distributed transactions and consistency models",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "priority": 1,
    "estimatedHours": 2.5,
    "goalId": "goal-uuid-123",
    "notes": "Use Notion for note-taking"
  }
  ```

- **Response** `201`:

  ```json
  {
    "success": true,
    "data": { /* DailyTaskResponseDto */ },
    "message": "Task created successfully"
  }
  ```

### 2. Get today’s tasks

- **Endpoint**: `GET /api/daily-tasks/today?userId=<user-id>`
- **Response** `200`:

  ```json
  {
    "success": true,
    "data": [ /* tasks */ ],
    "count": 0
  }
  ```

### 3. Get tasks by date range

- **Endpoint**: `GET /api/daily-tasks/range?userId=<user-id>&startDate=2024-01-01&endDate=2024-01-07`
- **Query params**:
  - `userId` (required)
  - `startDate` (ISO string)
  - `endDate` (ISO string)

### 4. Get tasks by goal

- **Endpoint**: `GET /api/daily-tasks/goal/:goalId?userId=<user-id>`

### 5. Get task completion stats

- **Endpoint**: `GET /api/daily-tasks/stats/summary?userId=<user-id>`
- **Response**: aggregated stats object (completion rates, counts, etc.).

### 6. List all tasks for a user

- **Endpoint**: `GET /api/daily-tasks?userId=<user-id>&status=IN_PROGRESS`
- **Query**:
  - `userId` (required)
  - `status` (optional)

### 7. Get task by ID

- **Endpoint**: `GET /api/daily-tasks/:id?userId=<user-id>`

### 8. Update task

- **Endpoint**: `PATCH /api/daily-tasks/:id?userId=<user-id>`
- **Body** (`UpdateDailyTaskDto`, all optional):

  ```json
  {
    "title": "Read and summarize system design chapter 3",
    "description": "Updated description with more focus",
    "status": "COMPLETED",
    "completionPercentage": 100,
    "priority": 1,
    "actualHours": 2.75,
    "notes": "Completed with additional research"
  }
  ```

### 9. Mark task as completed

- **Endpoint**: `POST /api/daily-tasks/:id/complete?userId=<user-id>`

### 10. Delete task

- **Endpoint**: `DELETE /api/daily-tasks/:id?userId=<user-id>`

---

## Progress Tracking (`/progress-tracking`)

Tracks progress over time (daily/weekly/monthly).

### 1. Create progress log

- **Endpoint**: `POST /api/progress-tracking?userId=<user-id>`
- **Body** (`CreateProgressLogDto`):

  ```json
  {
    "period": "WEEKLY",                        // 'DAILY' | 'WEEKLY' | 'MONTHLY'
    "periodStartDate": "2024-01-08T00:00:00.000Z",
    "periodEndDate": "2024-01-14T00:00:00.000Z",
    "tasksCompleted": 12,
    "tasksTotal": 15,
    "completionPercentage": 80,
    "goalsProgress": 75.5,
    "skillsImproved": 3,
    "summary": "Strong progress on system design..."
  }
  ```

### 2. List all progress logs

- **Endpoint**: `GET /api/progress-tracking?userId=<user-id>`

### 3. Get logs by period type

- **Endpoint**: `GET /api/progress-tracking/period/:period?userId=<user-id>`
- **Path**:
  - `period`: `'DAILY' | 'WEEKLY' | 'MONTHLY'`

### 4. Get logs by date range

- **Endpoint**: `GET /api/progress-tracking/range?userId=<user-id>&startDate=...&endDate=...`

### 5. Get latest progress summary

- **Endpoint**: `GET /api/progress-tracking/summary/latest?userId=<user-id>`
- **Response** example:

  ```json
  {
    "success": true,
    "data": {
      "overallProgress": 65.3,
      "completionRate": 72.5,
      "onTrack": true
    }
  }
  ```

### 6. Get progress trends

- **Endpoint**: `GET /api/progress-tracking/trends?userId=<user-id>&days=30`

### 7. Get / update / delete specific log

- **Get by ID**: `GET /api/progress-tracking/:id?userId=<user-id>`
- **Update**: `PATCH /api/progress-tracking/:id?userId=<user-id>`
  - Body: arbitrary partial update object, e.g.

    ```json
    {
      "tasksCompleted": 20,
      "notes": "Good progress this week"
    }
    ```

- **Delete**: `DELETE /api/progress-tracking/:id?userId=<user-id>`

---

## Reports (`/reports`)

HR-facing reports over a period or the full 6‑month program.

### 1. Create report

- **Endpoint**: `POST /api/reports?userId=<user-id>`
- **Body** (`CreateReportDto`):

  ```json
  {
    "type": "MONTHLY",                       // 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'FINAL'
    "reportPeriodStart": "2024-01-01T00:00:00.000Z",
    "reportPeriodEnd": "2024-01-31T23:59:59.000Z",
    "title": "January 2024 Progress Review"
  }
  ```

### 2. List reports for a user

- **Endpoint**: `GET /api/reports?userId=<user-id>`

### 3. Get reports by type

- **Endpoint**: `GET /api/reports/type/:type?userId=<user-id>`
- **Path**:
  - `type`: `'MONTHLY' | 'QUARTERLY' | 'FINAL' | 'WEEKLY'`

### 4. Get final 6‑month report

- **Endpoint**: `GET /api/reports/summary/final?userId=<user-id>`
- **Response** example:

  ```json
  {
    "success": true,
    "data": {
      "overallProgress": 87.3,
      "strengths": ["Leadership", "Communication"],
      "areasForImprovement": ["Technical depth"],
      "recommendations": ["Continue current trajectory"]
    }
  }
  ```

### 5. Get latest report

- **Endpoint**: `GET /api/reports/summary/latest?userId=<user-id>`

### 6. Get reports by date range

- **Endpoint**: `GET /api/reports/range?userId=<user-id>&startDate=...&endDate=...`

### 7. Get / update / delete specific report

- **Get**: `GET /api/reports/:id?userId=<user-id>`
- **Update**: `PATCH /api/reports/:id?userId=<user-id>`

  ```json
  {
    "status": "COMPLETED",
    "notes": "Report review completed"
  }
  ```

- **Delete**: `DELETE /api/reports/:id?userId=<user-id>`

---

## AI Planning Workflow (`/planning`)

Endpoints that orchestrate the AI multi‑agent workflow for a 6‑month plan.

> **Note**: These endpoints currently use `userId` query parameter and are not protected by JWT. The frontend should call them only for the logged‑in user and can add its own guard/authorization checks.

### 1. Generate 6‑month plan

- **Endpoint**: `POST /api/planning/generate?userId=<user-id>`
- **Body**: *none* (the service pulls required context from existing profile/goals/tasks for the user).
- **Response** `201` (simplified example):

  ```json
  {
    "success": true,
    "data": {
      "skillGap": {
        "currentLevel": "Intermediate",
        "targetLevel": "Advanced",
        "gaps": ["System Design", "Leadership"]
      },
      "goals": [
        {
          "title": "Master System Design",
          "type": "OBJECTIVE",
          "keyResults": ["Design 3 large-scale systems"]
        }
      ],
      "dailyTasks": [
        {
          "date": "2024-01-01",
          "tasks": [
            {
              "title": "Read system design case study",
              "duration": 2,
              "priority": "HIGH"
            }
          ]
        }
      ]
    },
    "message": "6-month development plan generated successfully"
  }
  ```

### 2. Persist/save generated plan

- **Endpoint**: `POST /api/planning/persist?userId=<user-id>&plan=<url-encoded-json>`
- **Parameters**:
  - `userId` (query, required)
  - `plan` (query, required): **URL‑encoded JSON string** of the generated plan object returned by `/planning/generate`

  Example URL:

  ```text
  POST /api/planning/persist?userId=<user-id>&plan=%7B%22skillGap%22%3A...%7D
  ```

- **Response** `201`:

  ```json
  {
    "success": true,
    "data": {
      "userId": "uuid",
      "goalsCreated": 6,
      "tasksCreated": 180,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Plan saved to database successfully"
  }
  ```

> **Implementation note for future refactor**: for easier frontend integration, it would be more ergonomic to move `plan` into the JSON **request body** instead of a query parameter. That change would involve adjusting `PlanningController.persistPlan` to use `@Body()` and updating Swagger decorators.

---

## Frontend Integration Checklist

- **Auth**
  - Implement login/register using `/auth` (see `AUTH_API_DOCUMENTATION.md`)
  - Store JWT `accessToken` and send `Authorization: Bearer <token>` for `/users` and any future protected endpoints
- **User‑scoped data**
  - For now, pass `userId` as query parameter for most feature modules:
    - `/goals`, `/daily-tasks`, `/progress-tracking`, `/reports`, `/planning`
  - Recommended: always derive `userId` from the authenticated user profile in the frontend and avoid letting end‑users change it directly
- **Error handling**
  - Handle HTTP status codes `400/401/403/404/500` and read `message` from the error JSON
- **Base URL configuration**
  - Centralize base URL (`http://localhost:3000/api` in dev) in a single config (e.g. `API_BASE_URL`) and reuse it across services


