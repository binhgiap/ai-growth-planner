/**
 * Report Service
 * Handles all report-related API calls
 */

import apiClient from "@/lib/api-client";

export interface Report {
  id: string;
  userId: string;
  type: "MONTHLY" | "QUARTERLY" | "FINAL";
  period: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  achievements: Array<{
    skill: string;
    improvement: number;
  }>;
  recommendations: string[];
  overallRating: number;
  completionRate: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReportPayload {
  type: "MONTHLY" | "QUARTERLY" | "FINAL";
  period?: string;
  summary?: string;
}

export interface ReportSummary {
  weeklyReports: Report[];
  monthlyReport: Report;
  finalReport?: Report;
}

export interface ProgressLog {
  id: string;
  userId: string;
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  tasksCompleted: number;
  tasksTotal: number;
  goalsOnTrack: number;
  goalsTotal: number;
  averageProgress: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ReportService {
  /**
   * Get all reports for a user
   */
  static async getReports(userId: string): Promise<Report[]> {
    const response = await apiClient.get("/reports", {
      params: { userId },
    });
    return response.data?.data || [];
  }

  /**
   * Get reports by type
   */
  static async getReportsByType(userId: string, type: "MONTHLY" | "QUARTERLY" | "FINAL"): Promise<Report[]> {
    const response = await apiClient.get(`/reports/type/${type}`, {
      params: { userId },
    });
    return response.data?.data || [];
  }

  /**
   * Get report by ID
   */
  static async getReportById(reportId: string): Promise<Report> {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data?.data;
  }

  /**
   * Get summary report (weekly + monthly + final)
   */
  static async getSummary(userId: string): Promise<ReportSummary> {
    const response = await apiClient.get("/reports/summary", {
      params: { userId },
    });
    return response.data?.data;
  }

  /**
   * Create a new report
   */
  static async createReport(userId: string, payload: CreateReportPayload): Promise<Report> {
    const response = await apiClient.post("/reports", payload, {
      params: { userId },
    });
    return response.data?.data;
  }

  /**
   * Update report
   */
  static async updateReport(reportId: string, payload: Partial<Report>): Promise<Report> {
    const response = await apiClient.patch(`/reports/${reportId}`, payload);
    return response.data?.data;
  }

  /**
   * Delete report
   */
  static async deleteReport(reportId: string): Promise<void> {
    await apiClient.delete(`/reports/${reportId}`);
  }

  /**
   * Get progress logs
   */
  static async getProgressLogs(userId: string): Promise<ProgressLog[]> {
    const response = await apiClient.get("/progress-tracking", {
      params: { userId },
    });
    return response.data?.data || [];
  }

  /**
   * Get progress logs by period
   */
  static async getProgressLogsByPeriod(
    userId: string,
    period: "WEEKLY" | "MONTHLY" | "QUARTERLY"
  ): Promise<ProgressLog[]> {
    const response = await apiClient.get(`/progress-tracking/period/${period}`, {
      params: { userId },
    });
    return response.data?.data || [];
  }
}
