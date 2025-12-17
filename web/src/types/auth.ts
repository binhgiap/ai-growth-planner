// Auth-related TypeScript types aligned with backend AUTH_API_DOCUMENTATION.md

// User as returned by the backend auth endpoints
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "manager";
  createdAt: string;
}

// Authenticated user state stored in localStorage for the frontend
export interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "manager";
  createdAt: string;
  // Convenience field for displaying full name in the UI
  name: string;
}

// Login payload for the backend
export interface LoginData {
  email: string;
  password: string;
}

// Registration payload for the backend
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  walletAddress: string;
  currentRole?: string;
  targetRole?: string;
}

// Local registration form state (includes confirmPassword & full name)
export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  walletAddress: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}


