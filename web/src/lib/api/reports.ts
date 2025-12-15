import { API_BASE_URL, getAuthHeaders, handleApiResponse, ApiResponse } from './config';

export interface CreateReportDto {
  type: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'FINAL';
  reportPeriodStart: string;
  reportPeriodEnd: string;
  title?: string;
}

export interface Report {
  id: string;
  type: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'FINAL';
  reportPeriodStart: string;
  reportPeriodEnd: string;
  title?: string;
  completionRate?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinalReport {
  overallProgress: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

export const reportsApi = {
  // Create a new report
  create: async (userId: string, data: CreateReportDto): Promise<ApiResponse<Report>> => {
    const response = await fetch(`${API_BASE_URL}/api/reports?userId=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<Report>>(response);
  },

  // Get all reports for a user
  findByUser: async (userId: string): Promise<ApiResponse<{ data: Report[]; count: number }>> => {
    const response = await fetch(`${API_BASE_URL}/api/reports?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<{ data: Report[]; count: number }>>(response);
  },

  // Get reports by type
  findByType: async (userId: string, type: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'FINAL'): Promise<ApiResponse<Report[]>> => {
    const response = await fetch(`${API_BASE_URL}/api/reports/type/${type}?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<Report[]>>(response);
  },

  // Get final report
  getFinalReport: async (userId: string): Promise<ApiResponse<FinalReport>> => {
    const response = await fetch(`${API_BASE_URL}/api/reports/summary/final?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<FinalReport>>(response);
  },

  // Get latest report
  getLatestReport: async (userId: string): Promise<ApiResponse<Report>> => {
    const response = await fetch(`${API_BASE_URL}/api/reports/summary/latest?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<Report>>(response);
  },

  // Get reports by date range
  findByDateRange: async (userId: string, startDate: string, endDate: string): Promise<ApiResponse<Report[]>> => {
    const queryParams = new URLSearchParams({
      userId,
      startDate,
      endDate,
    });
    
    const response = await fetch(`${API_BASE_URL}/api/reports/range?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<Report[]>>(response);
  },

  // Get report by ID
  findById: async (id: string, userId: string): Promise<ApiResponse<Report>> => {
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}?userId=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleApiResponse<ApiResponse<Report>>(response);
  },

  // Update report
  update: async (id: string, userId: string, data: Partial<CreateReportDto>): Promise<ApiResponse<Report>> => {
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}?userId=${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<Report>>(response);
  },

  // Delete report
  delete: async (id: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete report');
    }
  },
};

