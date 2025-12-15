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
    const response = await fetch(`${API_BASE_URL}/api/goals?userId=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<Goal>>(response);
  },

  // Get all goals for a user
  findByUser: async (userId: string, status?: string): Promise<ApiResponse<{ data: Goal[]; count: number }>> => {
    const queryParams = new URLSearchParams({ userId });
    if (status) queryParams.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/api/goals?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<{ data: Goal[]; count: number }>>(response);
  },

  // Get goals by type
  findByType: async (userId: string, type: 'OBJECTIVE' | 'KEY_RESULT'): Promise<ApiResponse<Goal[]>> => {
    const response = await fetch(`${API_BASE_URL}/api/goals/type/${type}?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<Goal[]>>(response);
  },

  // Get progress summary
  getProgress: async (userId: string): Promise<ApiResponse<{ overallProgress: number }>> => {
    const response = await fetch(`${API_BASE_URL}/api/goals/progress/summary?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<{ overallProgress: number }>>(response);
  },

  // Get goal by ID
  findById: async (id: string, userId: string): Promise<ApiResponse<Goal>> => {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<Goal>>(response);
  },

  // Update goal
  update: async (id: string, userId: string, data: UpdateGoalDto): Promise<ApiResponse<Goal>> => {
    const response = await fetch(`${API_BASE_URL}/api/goals/${id}?userId=${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<Goal>>(response);
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

