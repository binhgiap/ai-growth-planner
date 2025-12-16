import { API_BASE_URL, logApiCall, handleApiResponse } from "./config";
import type { AuthResponse, LoginData, RegisterData } from "@/types/auth";
import type { ApiResponse } from "./config";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

// Helpers for token & user storage
export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  setUser(user: unknown) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser(): any | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  clearUser() {
    localStorage.removeItem(USER_KEY);
  },
  clearAll() {
    this.clearToken();
    this.clearUser();
  },
};

export const authApi = {
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const url = `${API_BASE_URL}/api/auth/register`;
    logApiCall("POST", url, data);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleApiResponse<ApiResponse<AuthResponse>>(response, "POST", url);
  },

  async login(credentials: LoginData): Promise<ApiResponse<AuthResponse>> {
    const url = `${API_BASE_URL}/api/auth/login`;
    logApiCall("POST", url, credentials);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return handleApiResponse<ApiResponse<AuthResponse>>(response, "POST", url);
  },

  async me(): Promise<ApiResponse<{ id: string; email: string; role: string }>> {
    const url = `${API_BASE_URL}/api/auth/me`;
    logApiCall("GET", url);
    const token = authStorage.getToken();
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleApiResponse<ApiResponse<{ id: string; email: string; role: string }>>(
      response,
      "GET",
      url,
    );
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<
    ApiResponse<{
      message: string;
    }>
  > {
    const url = `${API_BASE_URL}/api/auth/change-password`;
    logApiCall("POST", url, { oldPassword, newPassword });
    const token = authStorage.getToken();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return handleApiResponse<ApiResponse<{ message: string }>>(response, "POST", url);
  },

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    const url = `${API_BASE_URL}/api/auth/refresh`;
    logApiCall("POST", url);
    const token = authStorage.getToken();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return handleApiResponse<ApiResponse<{ accessToken: string }>>(response, "POST", url);
  },

  logout() {
    authStorage.clearAll();
  },
};


