# Planning APIs Documentation

This document describes the three-step planning workflow APIs for frontend integration. These endpoints orchestrate the AI multi-agent workflow to generate a complete 6-month development plan.

---

## Base Information

- **Base URL (dev)**: `http://localhost:3000/api`
- **Base path**: `/api/planning`
- **Content-Type**: `application/json`
- **Authentication**: All endpoints require JWT authentication
  - Header: `Authorization: Bearer <accessToken>`
  - The user ID is automatically extracted from the JWT token (no need to pass `userId` as query parameter)
- **Standard response envelope**:

  ```json
  {
    "success": true,
    "data": { /* response data */ },
    "message": "Human-readable success message"
  }
  ```

- **Error responses**:

  ```json
  {
    "statusCode": 400,
    "message": "Error message",
    "error": "Bad Request"
  }
  ```

---

## Workflow Overview

The planning workflow consists of **3 sequential steps** that must be executed in order:

1. **Skill Gap Analysis** → Analyzes gaps between current and target skills
2. **Goal Planning (OKRs)** → Generates 6-month OKRs based on skill gaps
3. **Daily Task Generation** → Generates 180 daily tasks based on OKRs

**Important**: Each step requires the previous step to be completed successfully. The frontend should guide users through this workflow sequentially.

---

## API Endpoints

### 1. Analyze Skill Gaps

Analyzes the gap between the user's current skills/role and their target skills/role using AI. The analysis is saved to the database and used as input for the next step.

- **Endpoint**: `POST /api/planning/skill-gap`
- **Auth**: `Authorization: Bearer <accessToken>` (required)
- **Body**: None (user data is retrieved from the authenticated user's profile)
- **Response** `201`:

  ```json
  {
    "success": true,
    "data": {
      "id": "skill-gap-uuid",
      "userId": "user-uuid",
      "currentLevel": "Intermediate",
      "targetLevel": "Advanced",
      "gaps": ["System Design", "Leadership", "Distributed Systems"],
      "gapCount": 3,
      "priority": "HIGH",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Skill gap analysis completed and saved successfully"
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: User profile incomplete or invalid (e.g., missing `currentRole`, `targetRole`, `skills`, or `targetSkills`)
  - `401 Unauthorized`: Missing or invalid JWT token
  - `500 Internal Server Error`: Error analyzing skill gaps (AI service failure, database error, etc.)

- **Frontend Integration Notes**:
  - This is the **first step** in the planning workflow
  - Ensure the user has completed their profile setup before calling this endpoint
  - Store the returned `id` or `userId` if needed for subsequent steps (though it's not required since user is identified from JWT)
  - Display the `gaps` array to show users what skills need improvement

---

### 2. Generate Goal Planning (OKRs)

Generates 6-month OKRs (Objectives and Key Results) based on the skill gap analysis. The OKRs are saved as goals in the database.

- **Endpoint**: `POST /api/planning/goal-planning`
- **Auth**: `Authorization: Bearer <accessToken>` (required)
- **Body**: None (skill gap analysis is retrieved from the database)
- **Response** `201`:

  ```json
  {
    "success": true,
    "data": {
      "userId": "user-uuid",
      "goalsCreated": 6,
      "okrs": [
        {
          "id": "goal-uuid-1",
          "title": "Master System Design",
          "description": "Design 3 large-scale systems\nImplement distributed architecture patterns\nComplete system design course",
          "type": "OBJECTIVE",
          "startDate": "2024-01-01T00:00:00.000Z",
          "targetDate": "2024-06-30T00:00:00.000Z",
          "progress": 0,
          "status": "NOT_STARTED",
          "priority": 1,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
        // ... more OKRs
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "OKRs generated and saved successfully"
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: 
    - Skill gap analysis not found (user must run skill gap analysis first)
    - User not found
  - `401 Unauthorized`: Missing or invalid JWT token
  - `500 Internal Server Error`: Error generating OKRs (AI service failure, database error, etc.)

- **Frontend Integration Notes**:
  - This is the **second step** in the planning workflow
  - **Requires**: Skill gap analysis must be completed first (step 1)
  - The `okrs` array contains the generated goals/objectives
  - Each OKR in the response is a full goal object that can be displayed in the UI
  - The `goalsCreated` count indicates how many OKRs were generated
  - Display the OKRs to users for review before proceeding to daily task generation

---

### 3. Generate Daily Tasks

Generates 180 daily tasks (6 months × 30 days) based on the OKRs. Tasks are distributed across the 6-month period and saved to the database.

- **Endpoint**: `POST /api/planning/daily-task`
- **Auth**: `Authorization: Bearer <accessToken>` (required)
- **Body**: None (OKRs and skill gaps are retrieved from the database)
- **Response** `201`:

  ```json
  {
    "success": true,
    "data": {
      "userId": "user-uuid",
      "tasksCreated": 180,
      "taskSummary": {
        "highPriority": 45,
        "mediumPriority": 90,
        "lowPriority": 45,
        "totalEstimatedHours": 540
      },
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-07-30T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Daily tasks generated and saved successfully"
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: 
    - OKRs not found (user must run goal planning first)
    - Skill gap analysis not found (user must run skill gap analysis first)
    - User not found
  - `401 Unauthorized`: Missing or invalid JWT token
  - `500 Internal Server Error`: Error generating daily tasks (AI service failure, database error, etc.)

- **Frontend Integration Notes**:
  - This is the **third and final step** in the planning workflow
  - **Requires**: Both skill gap analysis (step 1) and goal planning (step 2) must be completed first
  - The `tasksCreated` count should be 180 (one task per day for 6 months)
  - The `taskSummary` provides aggregated statistics:
    - `highPriority`: Number of high-priority tasks (priority = 5)
    - `mediumPriority`: Number of medium-priority tasks (priority = 3)
    - `lowPriority`: Number of low-priority tasks (priority = 1)
    - `totalEstimatedHours`: Sum of all estimated hours across all tasks
  - After this step, users can view their complete 6-month plan with all tasks
  - Use the `/api/daily-tasks` endpoints to retrieve and display the generated tasks

---

## Frontend Integration Guide

### Step-by-Step Workflow

1. **User Authentication**
   - User must be logged in and have a valid JWT token
   - Token should be stored (e.g., `localStorage`) and included in all requests

2. **Profile Setup Check**
   - Before starting the planning workflow, ensure the user has completed their profile:
     - `currentRole` (string)
     - `targetRole` (string)
     - `skills` (array)
     - `targetSkills` (array)
     - `hoursPerWeek` (number, optional, defaults to 10)

3. **Execute Planning Workflow**
   ```typescript
   // Step 1: Analyze skill gaps
   const skillGapResponse = await fetch('/api/planning/skill-gap', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json'
     }
   });
   
   if (!skillGapResponse.ok) {
     // Handle error (check if profile is incomplete)
     throw new Error('Skill gap analysis failed');
   }
   
   // Step 2: Generate OKRs (after step 1 succeeds)
   const okrResponse = await fetch('/api/planning/goal-planning', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json'
     }
   });
   
   if (!okrResponse.ok) {
     // Handle error (check if skill gap analysis is missing)
     throw new Error('OKR generation failed');
   }
   
   // Step 3: Generate daily tasks (after step 2 succeeds)
   const tasksResponse = await fetch('/api/planning/daily-task', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${accessToken}`,
       'Content-Type': 'application/json'
     }
   });
   
   if (!tasksResponse.ok) {
     // Handle error (check if OKRs are missing)
     throw new Error('Daily task generation failed');
   }
   ```

### Error Handling

- **400 Bad Request**: Usually indicates a missing prerequisite step or incomplete user profile
  - Check the error message to determine what's missing
  - Guide users to complete the required step first

- **401 Unauthorized**: Token expired or invalid
  - Redirect to login or refresh the token using `/auth/refresh`

- **500 Internal Server Error**: Server-side error
  - Log the error for debugging
  - Show a user-friendly message and suggest retrying

### UI/UX Recommendations

1. **Progress Indicator**: Show a 3-step progress bar (Skill Gap → OKRs → Daily Tasks)
2. **Loading States**: Each API call may take several seconds (AI processing), show loading indicators
3. **Success Feedback**: After each step, show a success message and preview of generated data
4. **Error Recovery**: If a step fails, allow users to retry without restarting the entire workflow
5. **Review Step**: After OKR generation, allow users to review OKRs before generating tasks
6. **Completion**: After all 3 steps, redirect users to their dashboard to view the complete plan

### State Management

Consider storing the workflow state:
- Which steps have been completed
- Generated data from each step (for preview/display)
- Error states for each step

Example state structure:
```typescript
interface PlanningWorkflowState {
  skillGap: {
    completed: boolean;
    data: SkillGapResponse | null;
    error: string | null;
  };
  okrs: {
    completed: boolean;
    data: OKRResponse | null;
    error: string | null;
  };
  dailyTasks: {
    completed: boolean;
    data: DailyTaskResponse | null;
    error: string | null;
  };
}
```

---

## Related Endpoints

After completing the planning workflow, use these endpoints to retrieve and manage the generated data:

- **Goals**: `GET /api/goals?userId=<user-id>` - Retrieve generated OKRs
- **Daily Tasks**: `GET /api/daily-tasks?userId=<user-id>` - Retrieve generated tasks
- **Skill Gap**: Check skill-gap module endpoints for retrieving skill gap analysis

---

## Notes

- All three endpoints are **idempotent** in the sense that they will create new records each time they're called. If you want to regenerate the plan, simply call the endpoints again (they will create new records).
- The endpoints use AI agents which may take several seconds to process. Implement appropriate timeout handling and loading states.
- The generated plan spans exactly 6 months from the current date.
- Tasks are automatically distributed across the 6-month period based on the OKRs and skill gaps.

