import axios, { AxiosError, AxiosResponse } from "axios";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3000";
const DEBUG = process.env["NEXT_PUBLIC_ENABLE_DEBUG"] === "true";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor for logging and auth token
apiClient.interceptors.request.use((config) => {
  // Log request in development
  if (DEBUG) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params || "");
  }

  // Add auth token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor for error handling and data extraction
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    if (DEBUG) {
      console.log(`[API] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || error.message || "An error occurred";

    if (DEBUG) {
      console.error("[API Error]", {
        status,
        message,
        url: error.config?.url,
        data: error.response?.data,
      });
    }

    // Handle specific error codes
    if (status === 401) {
      // Unauthorized - clear token and redirect
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        // Don't redirect here - let the component handle it
        // window.location.href = '/setup'
      }
    } else if (status === 403) {
      console.error("[API] Access forbidden");
    } else if (status === 404) {
      console.error("[API] Resource not found");
    } else if (status === 500) {
      console.error("[API] Server error");
    }

    return Promise.reject(error);
  }
);

/**
 * Helper to extract data from API response
 */
export function getResponseData<T>(response: AxiosResponse<ApiResponse<T>>): T | null {
  return response.data?.data || null;
}

export default apiClient;
