// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Debug mode - set to true to see API calls in console
export const API_DEBUG = import.meta.env.VITE_API_DEBUG === 'true' || false;

// Log API calls if debug mode is enabled
export const logApiCall = (method: string, url: string, data?: any) => {
  if (API_DEBUG) {
    console.log(`[API] ${method} ${url}`, data ? { data } : '');
  }
};

export const logApiResponse = (method: string, url: string, response: any, error?: any) => {
  if (API_DEBUG) {
    if (error) {
      console.error(`[API] ${method} ${url} - ERROR:`, error);
    } else {
      console.log(`[API] ${method} ${url} - SUCCESS:`, response);
    }
  }
};

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status?: number;
}

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  return {
    'Content-Type': 'application/json',
    ...(user?.token && { Authorization: `Bearer ${user.token}` }),
  };
};

// Helper function to handle API responses
export const handleApiResponse = async <T>(response: Response, method: string, url: string): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    const errorMessage = error.message || `HTTP error! status: ${response.status}`;
    logApiResponse(method, url, null, errorMessage);
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  logApiResponse(method, url, data);
  return data;
};

