import { API_BASE_URL, getAuthHeaders, handleApiResponse, ApiResponse, logApiCall } from './config';
import type { Goal } from './goals';
import type { DailyTask } from './tasks';

export interface GeneratedPlan {
  skillGap: {
    currentLevel: string;
    targetLevel: string;
    gaps: string[];
  };
  goals: Array<{
    title: string;
    type: 'OBJECTIVE' | 'KEY_RESULT';
    keyResults?: string[];
  }>;
  dailyTasks: Array<{
    date: string;
    tasks: Array<{
      title: string;
      duration: number;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  }>;
}

export interface PersistedPlan {
  userId: string;
  goalsCreated: number;
  tasksCreated: number;
  createdAt: string;
}

// Skill Gap Analysis Response
export interface SkillGapResponse {
  id: string;
  userId: string;
  currentLevel: string;
  targetLevel: string;
  gaps: Array<{
    skill: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    currentLevel: number;
    targetLevel: number;
  }>;
  gapCount: number;
  priority: string;
  createdAt: string;
}

// Goal Planning (OKRs) Response
export interface GoalPlanningResponse {
  userId: string;
  goalsCreated: number;
  okrs: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    startDate: string;
    targetDate: string;
    progress: number;
    status: string;
    priority: number;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
}

// Daily Task Generation Response
export interface DailyTaskResponse {
  userId: string;
  tasksCreated: number;
  taskSummary: {
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    totalEstimatedHours: number;
  };
  startDate: string;
  endDate: string;
  createdAt: string;
}

export const planningApi = {
  // Step 1: Analyze skill gaps
  analyzeSkillGap: async (): Promise<ApiResponse<SkillGapResponse>> => {
    const url = `${API_BASE_URL}/api/planning/skill-gap`;
    logApiCall('POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<SkillGapResponse>>(response, 'POST', url);
  },

  // Step 2: Generate goal planning (OKRs)
  generateGoalPlanning: async (): Promise<ApiResponse<GoalPlanningResponse>> => {
    const url = `${API_BASE_URL}/api/planning/goal-planning`;
    logApiCall('POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<GoalPlanningResponse>>(response, 'POST', url);
  },

  // Step 3: Generate daily tasks
  generateDailyTasks: async (): Promise<ApiResponse<DailyTaskResponse>> => {
    const url = `${API_BASE_URL}/api/planning/daily-task`;
    logApiCall('POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<DailyTaskResponse>>(response, 'POST', url);
  },

  // Legacy: Generate a complete 6-month development plan (deprecated - use the three-step workflow above)
  generatePlan: async (userId: string): Promise<ApiResponse<GeneratedPlan>> => {
    const url = `${API_BASE_URL}/api/planning/generate?userId=${userId}`;
    logApiCall('POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<GeneratedPlan>>(response, 'POST', url);
  },

  // Legacy: Persist/save the generated plan to database (deprecated)
  persistPlan: async (userId: string, plan: GeneratedPlan): Promise<ApiResponse<PersistedPlan>> => {
    const queryParams = new URLSearchParams({
      userId,
      plan: JSON.stringify(plan),
    });
    const url = `${API_BASE_URL}/api/planning/persist?${queryParams.toString()}`;
    logApiCall('POST', url, { plan });
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<PersistedPlan>>(response, 'POST', url);
  },

  // Cancel planning: Call backend cancel endpoint
  cancel: async (): Promise<ApiResponse<{ message: string }>> => {
    const url = `${API_BASE_URL}/api/planning/cancel`;
    logApiCall('POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<{ message: string }>>(response, 'POST', url);
  },

  // Cancel planning: Delete all goals and tasks for a user (fallback if cancel endpoint doesn't exist)
  cancelPlanning: async (userId: string): Promise<void> => {
    const { goalsApi, tasksApi } = await import('./index');
    
    try {
      // Fetch all goals and tasks
      const [goalsResponse, tasksResponse] = await Promise.all([
        goalsApi.findByUser(userId).catch(() => ({ success: false, data: [] as Goal[], count: 0 })),
        tasksApi.findByUser(userId).catch(() => ({ success: false, data: [] as DailyTask[] })),
      ]);

      // Handle goals response - findByUser returns ApiResponse<Goal[]> & { count: number }
      const goals: Goal[] = goalsResponse?.success && Array.isArray(goalsResponse.data)
        ? goalsResponse.data
        : [];

      // Handle tasks response - findByUser returns ApiResponse<DailyTask[]>
      const tasks: DailyTask[] = tasksResponse?.success && Array.isArray(tasksResponse.data)
        ? tasksResponse.data
        : [];

      // Delete all goals
      await Promise.all(
        goals.map((goal) => 
          goalsApi.delete(goal.id, userId).catch(err => {
            console.warn(`Failed to delete goal ${goal.id}:`, err);
          })
        )
      );

      // Delete all tasks
      await Promise.all(
        tasks.map((task) => 
          tasksApi.delete(task.id, userId).catch(err => {
            console.warn(`Failed to delete task ${task.id}:`, err);
          })
        )
      );
    } catch (error) {
      console.error('Error canceling planning:', error);
      throw error;
    }
  },
};

