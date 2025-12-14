/**
 * Daily Task Service
 * Handles all daily task-related API calls
 */

import apiClient from "@/lib/api-client";

export interface DailyTask {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  priority: number;
  completionPercentage: number;
  dueDate: string;
  estimatedHours?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDailyTaskPayload {
  title: string;
  description?: string;
  dueDate: string;
  priority?: number;
  estimatedHours?: number;
  goalId?: string;
  notes?: string;
}

export interface UpdateDailyTaskPayload {
  title?: string;
  description?: string;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  completionPercentage?: number;
  priority?: number;
  estimatedHours?: number;
  notes?: string;
}

export class DailyTaskService {
  /**
   * Get today's tasks
   */
  static async getTodaysTasks(userId: string): Promise<DailyTask[]> {
    const response = await apiClient.get("/daily-tasks/today", {
      params: { userId },
    });
    return response.data?.data || [];
  }

  /**
   * Get tasks by date range
   */
  static async getTasksByRange(userId: string, startDate: string, endDate: string): Promise<DailyTask[]> {
    const response = await apiClient.get("/daily-tasks/range", {
      params: { userId, startDate, endDate },
    });
    return response.data?.data || [];
  }

  /**
   * Get all tasks for a user
   */
  static async getAllTasks(userId: string): Promise<DailyTask[]> {
    const response = await apiClient.get("/daily-tasks", {
      params: { userId },
    });
    return response.data?.data || [];
  }

  /**
   * Create a new task
   */
  static async createTask(userId: string, payload: CreateDailyTaskPayload): Promise<DailyTask> {
    const response = await apiClient.post("/daily-tasks", payload, {
      params: { userId },
    });
    return response.data?.data;
  }

  /**
   * Get task by ID
   */
  static async getTaskById(taskId: string): Promise<DailyTask> {
    const response = await apiClient.get(`/daily-tasks/${taskId}`);
    return response.data?.data;
  }

  /**
   * Update task
   */
  static async updateTask(taskId: string, payload: UpdateDailyTaskPayload): Promise<DailyTask> {
    const response = await apiClient.patch(`/daily-tasks/${taskId}`, payload);
    return response.data?.data;
  }

  /**
   * Mark task as complete
   */
  static async completeTask(taskId: string): Promise<DailyTask> {
    const response = await apiClient.post(`/daily-tasks/${taskId}/complete`);
    return response.data?.data;
  }

  /**
   * Delete task
   */
  static async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/daily-tasks/${taskId}`);
  }
}
