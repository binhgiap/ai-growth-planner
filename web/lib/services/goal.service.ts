/**
 * Goal Service
 * Handles all goal/OKR-related API calls
 */

import apiClient from "@/lib/api-client";

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: "OBJECTIVE" | "KEY_RESULT";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  progress: number;
  priority: number;
  startDate: string;
  targetDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGoalPayload {
  title: string;
  description: string;
  type: "OBJECTIVE" | "KEY_RESULT";
  startDate: string;
  targetDate: string;
  priority?: number;
  notes?: string;
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  progress?: number;
  priority?: number;
  notes?: string;
}

export class GoalService {
  /**
   * Get all goals for a user
   */
  static async getGoals(userId: string, status?: string): Promise<Goal[]> {
    const params: Record<string, any> = { userId };
    if (status) params["status"] = status;

    const response = await apiClient.get("/goals", { params });
    return response.data?.data || [];
  }

  /**
   * Create a new goal
   */
  static async createGoal(userId: string, payload: CreateGoalPayload): Promise<Goal> {
    const response = await apiClient.post("/goals", payload, {
      params: { userId },
    });
    return response.data?.data;
  }

  /**
   * Get goal by ID
   */
  static async getGoalById(goalId: string): Promise<Goal> {
    const response = await apiClient.get(`/goals/${goalId}`);
    return response.data?.data;
  }

  /**
   * Update goal
   */
  static async updateGoal(goalId: string, payload: UpdateGoalPayload): Promise<Goal> {
    const response = await apiClient.patch(`/goals/${goalId}`, payload);
    return response.data?.data;
  }

  /**
   * Delete goal
   */
  static async deleteGoal(goalId: string): Promise<void> {
    await apiClient.delete(`/goals/${goalId}`);
  }
}
