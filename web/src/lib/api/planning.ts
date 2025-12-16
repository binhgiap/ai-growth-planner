import { API_BASE_URL, getAuthHeaders, handleApiResponse, ApiResponse, logApiCall } from './config';

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

export const planningApi = {
  // Generate a complete 6-month development plan
  generatePlan: async (userId: string): Promise<ApiResponse<GeneratedPlan>> => {
    const url = `${API_BASE_URL}/api/planning/generate?userId=${userId}`;
    logApiCall('POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<GeneratedPlan>>(response, 'POST', url);
  },

  // Persist/save the generated plan to database
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
};

