import { API_BASE_URL, getAuthHeaders, handleApiResponse, ApiResponse } from './config';

export interface CreateDailyTaskDto {
  title: string;
  description?: string;
  dueDate: string;
  priority?: number;
  estimatedHours?: number;
  goalId?: string;
  notes?: string;
}

export interface UpdateDailyTaskDto {
  title?: string;
  description?: string;
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  completionPercentage?: number;
  priority?: number;
  actualHours?: number;
  notes?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  completed: boolean;
  dueDate: string;
  priority?: number;
  estimatedHours?: number;
  actualHours?: number;
  completionPercentage?: number;
  goalId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const tasksApi = {
  // Create a new task
  create: async (userId: string, data: CreateDailyTaskDto): Promise<ApiResponse<DailyTask>> => {
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks?userId=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<DailyTask>>(response);
  },

  // Get all tasks for a user
  findByUser: async (userId: string, status?: string): Promise<ApiResponse<DailyTask[]>> => {
    const queryParams = new URLSearchParams({ userId });
    if (status) queryParams.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<DailyTask[]>>(response);
  },

  // Get today's tasks
  getTodaysTasks: async (userId: string): Promise<ApiResponse<{ data: DailyTask[]; count: number }>> => {
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks/today?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<{ data: DailyTask[]; count: number }>>(response);
  },

  // Get tasks by date range
  getTasksByDateRange: async (userId: string, startDate: string, endDate: string): Promise<ApiResponse<DailyTask[]>> => {
    const queryParams = new URLSearchParams({
      userId,
      startDate,
      endDate,
    });
    
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks/range?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<DailyTask[]>>(response);
  },

  // Get tasks by goal
  getTasksByGoal: async (goalId: string, userId: string): Promise<ApiResponse<DailyTask[]>> => {
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks/goal/${goalId}?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<DailyTask[]>>(response);
  },

  // Get task statistics
  getStats: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks/stats/summary?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<any>>(response);
  },

  // Get task by ID
  findById: async (id: string, userId: string): Promise<ApiResponse<DailyTask>> => {
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks/${id}?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<DailyTask>>(response);
  },

  // Update task
  update: async (id: string, userId: string, data: UpdateDailyTaskDto): Promise<ApiResponse<DailyTask>> => {
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks/${id}?userId=${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<DailyTask>>(response);
  },

  // Delete task
  delete: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  },

  // Complete task
  completeTask: async (id: string, userId: string): Promise<ApiResponse<DailyTask>> => {
    const response = await fetch(`${API_BASE_URL}/api/daily-tasks/${id}/complete?userId=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<DailyTask>>(response);
  },
};

