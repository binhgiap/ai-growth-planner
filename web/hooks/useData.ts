/**
 * Custom hooks for data fetching and management
 * These hooks combine useApi with service layer for better DX
 */

import { useCallback, useEffect, useState } from "react";
import { UserService, GoalService, DailyTaskService, ReportService } from "@/lib/services";
import { useApi, usePost, usePatch } from "./useApi";

/**
 * Hook to fetch and manage user profile
 */
export function useUser(userId?: string) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const userData = await UserService.getUserById(userId);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}

/**
 * Hook to fetch and manage goals
 */
export function useGoals(userId?: string, status?: string) {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const goalsData = await GoalService.getGoals(userId, status);
      setGoals(goalsData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  }, [userId, status]);

  useEffect(() => {
    if (userId) {
      fetchGoals();
    }
  }, [userId, status, fetchGoals]);

  const createGoal = useCallback(
    async (payload: any) => {
      if (!userId) throw new Error("User ID required");
      const newGoal = await GoalService.createGoal(userId, payload);
      setGoals((prev) => [...prev, newGoal]);
      return newGoal;
    },
    [userId]
  );

  const updateGoal = useCallback(async (goalId: string, payload: any) => {
    const updated = await GoalService.updateGoal(goalId, payload);
    setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
    return updated;
  }, []);

  const deleteGoal = useCallback(async (goalId: string) => {
    await GoalService.deleteGoal(goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }, []);

  return { goals, loading, error, refetch: fetchGoals, createGoal, updateGoal, deleteGoal };
}

/**
 * Hook to fetch and manage daily tasks
 */
export function useDailyTasks(userId?: string) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const tasksData = await DailyTaskService.getTodaysTasks(userId);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId, fetchTasks]);

  const createTask = useCallback(
    async (payload: any) => {
      if (!userId) throw new Error("User ID required");
      const newTask = await DailyTaskService.createTask(userId, payload);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [userId]
  );

  const updateTask = useCallback(async (taskId: string, payload: any) => {
    const updated = await DailyTaskService.updateTask(taskId, payload);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  }, []);

  const completeTask = useCallback(async (taskId: string) => {
    const updated = await DailyTaskService.completeTask(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    return updated;
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    await DailyTaskService.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  return { tasks, loading, error, refetch: fetchTasks, createTask, updateTask, completeTask, deleteTask };
}

/**
 * Hook to fetch and manage reports
 */
export function useReports(userId?: string) {
  const [reports, setReports] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const reportsData = await ReportService.getReports(userId);
      setReports(reportsData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const summaryData = await ReportService.getSummary(userId);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch summary");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSummary();
    }
  }, [userId, fetchSummary]);

  return { reports, summary, loading, error, refetch: fetchReports, refetchSummary: fetchSummary };
}
