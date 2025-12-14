/**
 * User Service
 * Handles all user-related API calls
 */

import apiClient from "@/lib/api-client";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  currentRole?: string;
  targetRole?: string;
  skills?: string[];
  targetSkills?: string[];
  hoursPerWeek?: number;
  bio?: string;
  preferences?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  currentRole: string;
  targetRole: string;
  skills?: string[];
  targetSkills?: string[];
  hoursPerWeek?: number;
  bio?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  currentRole?: string;
  targetRole?: string;
  skills?: string[];
  targetSkills?: string[];
  hoursPerWeek?: number;
  bio?: string;
}

export class UserService {
  /**
   * Get all users with pagination
   */
  static async getUsers(page: number = 1, limit: number = 10) {
    const response = await apiClient.get("/users", {
      params: { page, limit },
    });
    return response.data?.data || [];
  }

  /**
   * Create a new user profile
   */
  static async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await apiClient.post("/users", payload);
    return response.data?.data;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data?.data;
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    const response = await apiClient.get("/users/profile");
    return response.data?.data;
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
    const response = await apiClient.patch(`/users/${userId}`, payload);
    return response.data?.data;
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  }
}
