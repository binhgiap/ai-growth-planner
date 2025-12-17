import { API_BASE_URL, getAuthHeaders, handleApiResponse, ApiResponse } from './config';

export interface CreateGoalDto {
  title: string;
  description: string;
  type: 'OBJECTIVE' | 'KEY_RESULT';
  startDate: string;
  targetDate: string;
  priority?: number;
  notes?: string;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  progress?: number;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  priority?: number;
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'OBJECTIVE' | 'KEY_RESULT';
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  startDate: string;
  targetDate: string;
  priority?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const goalsApi = {
  // Create a new goal
  create: async (userId: string, data: CreateGoalDto): Promise<ApiResponse<Goal>> => {
    const url = `${API_BASE_URL}/api/goals?userId=${userId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<Goal>>(response, 'POST', url);
  },

  // Get all goals for a user
  findByUser: async (
    userId: string,
    status?: string,
  ): Promise<ApiResponse<Goal[]> & { count: number }> => {
    const queryParams = new URLSearchParams({ userId });
    if (status) queryParams.append('status', status);

    // Use /user endpoint for admin portal
    const url = `${API_BASE_URL}/api/goals/user?${queryParams}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<Goal[]> & { count: number }>(response, 'GET', url);
  },

  // Get goals by type
  findByType: async (userId: string, type: 'OBJECTIVE' | 'KEY_RESULT'): Promise<ApiResponse<Goal[]>> => {
    const url = `${API_BASE_URL}/api/goals/type/${type}?userId=${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<Goal[]>>(response, 'GET', url);
  },

  // Get progress summary
  getProgress: async (userId: string): Promise<ApiResponse<{ overallProgress: number }>> => {
    const url = `${API_BASE_URL}/api/goals/progress/summary?userId=${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<{ overallProgress: number }>>(response, 'GET', url);
  },

  // Get goal by ID
  findById: async (id: string, userId: string): Promise<ApiResponse<Goal>> => {
    const url = `${API_BASE_URL}/api/goals/${id}?userId=${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<Goal>>(response, 'GET', url);
  },

  // Update goal
  update: async (id: string, userId: string, data: UpdateGoalDto): Promise<ApiResponse<Goal>> => {
    const url = `${API_BASE_URL}/api/goals/${id}?userId=${userId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<Goal>>(response, 'PATCH', url);
  },

  // Delete goal
  delete: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete goal');
    }
  },
};

