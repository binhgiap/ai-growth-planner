// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Debug mode - set to true to see API calls in console
export const API_DEBUG = import.meta.env.VITE_API_DEBUG === "true" || false;

// Log API calls if debug mode is enabled
export const logApiCall = (method: string, url: string, data?: any) => {
  if (API_DEBUG) {
    console.log(`[API] ${method} ${url}`, data ? { data } : "");
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
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
export const handleApiResponse = async <T>(
  response: Response,
  method: string = "GET",
  url: string = "",
): Promise<T> => {
  // Handle unauthorized responses consistently across the app
  if (response.status === 401) {
    // Try a best-effort token refresh using the current access token
    const currentToken = localStorage.getItem("accessToken");
    if (currentToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData?.data?.accessToken) {
            localStorage.setItem("accessToken", refreshData.data.accessToken);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
    }

    // Clear any stale auth state and force the user back to login
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    const error401 = await response.json().catch(() => ({ message: "Unauthorized" }));
    const error401Message = error401.message || "Unauthorized";
    logApiResponse(method, url, null, error401Message);
    throw new Error(error401Message);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    const errorMessage = error.message || `HTTP error! status: ${response.status}`;
    logApiResponse(method, url, null, errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  logApiResponse(method, url, data);
  return data;
};



