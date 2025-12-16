import { API_BASE_URL, getAuthHeaders, handleApiResponse, ApiResponse } from './config';

export interface CreateProgressLogDto {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  periodStartDate: string;
  periodEndDate: string;
  tasksCompleted?: number;
  tasksTotal?: number;
  completionPercentage?: number;
  goalsProgress?: number;
  skillsImproved?: number;
  summary?: string;
}

export interface ProgressLog {
  id: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  periodStartDate: string;
  periodEndDate: string;
  tasksCompleted?: number;
  tasksTotal?: number;
  completionPercentage?: number;
  goalsProgress?: number;
  skillsImproved?: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export const progressApi = {
  // Create a new progress log
  create: async (userId: string, data: CreateProgressLogDto): Promise<ApiResponse<ProgressLog>> => {
    const url = `${API_BASE_URL}/api/progress-tracking?userId=${userId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<ProgressLog>>(response, 'POST', url);
  },

  // Get all progress logs for a user
  findByUser: async (
    userId: string,
  ): Promise<ApiResponse<ProgressLog[]> & { count: number }> => {
    const url = `${API_BASE_URL}/api/progress-tracking?userId=${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<ProgressLog[]> & { count: number }>(response, 'GET', url);
  },

  // Get logs by period
  findByPeriod: async (userId: string, period: 'DAILY' | 'WEEKLY' | 'MONTHLY'): Promise<ApiResponse<ProgressLog[]>> => {
    const url = `${API_BASE_URL}/api/progress-tracking/period/${period}?userId=${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<ProgressLog[]>>(response, 'GET', url);
  },

  // Get logs by date range
  findByDateRange: async (userId: string, startDate: string, endDate: string): Promise<ApiResponse<ProgressLog[]>> => {
    const queryParams = new URLSearchParams({
      userId,
      startDate,
      endDate,
    });
    
    const url = `${API_BASE_URL}/api/progress-tracking/range?${queryParams}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<ProgressLog[]>>(response, 'GET', url);
  },

  // Get latest summary
  getLatestSummary: async (
    userId: string,
  ): Promise<
    ApiResponse<{
      overallProgress: number;
      completionRate: number;
      onTrack: boolean;
    }>
  > => {
    const url = `${API_BASE_URL}/api/progress-tracking/summary/latest?userId=${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<
      ApiResponse<{
        overallProgress: number;
        completionRate: number;
        onTrack: boolean;
      }>
    >(response, 'GET', url);
  },

  // Get progress trends
  getTrends: async (userId: string, days?: number): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams({ userId });
    if (days) queryParams.append('days', days.toString());
    
    const url = `${API_BASE_URL}/api/progress-tracking/trends?${queryParams}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<any>>(response, 'GET', url);
  },

  // Get progress log by ID
  findById: async (id: string, userId: string): Promise<ApiResponse<ProgressLog>> => {
    const url = `${API_BASE_URL}/api/progress-tracking/${id}?userId=${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<ProgressLog>>(response, 'GET', url);
  },

  // Update progress log
  update: async (id: string, userId: string, data: Partial<CreateProgressLogDto>): Promise<ApiResponse<ProgressLog>> => {
    const url = `${API_BASE_URL}/api/progress-tracking/${id}?userId=${userId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<ProgressLog>>(response, 'PATCH', url);
  },

  // Delete progress log
  delete: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/progress-tracking/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete progress log');
    }
  },
};

