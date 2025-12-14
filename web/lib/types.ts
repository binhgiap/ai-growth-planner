/* Types for API responses */

export interface User {
  id: string;
  name: string;
  email: string;
  currentRole: string;
  targetRole: string;
  experience: number;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  progress: number;
  startDate: string;
  endDate: string;
  skills: string[];
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface DailyTask {
  id: string;
  goalId: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressLog {
  id: string;
  userId: string;
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  goalsOnTrack: number;
  goalsTotal: number;
  weeklyProgress: number;
  createdAt: string;
}

export interface Report {
  id: string;
  userId: string;
  period: string;
  type: "weekly" | "monthly" | "final";
  summary: string;
  strengths: string[];
  weaknesses: string[];
  achievements: Array<{
    skill: string;
    improvement: number;
  }>;
  recommendations: string[];
  overallRating: number;
  createdAt: string;
}

/* API Response Wrappers */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
}
