/**
 * Form validation schemas using Zod
 * Used for both client and server-side validation
 */

import { z } from "zod";

// User/Profile validation
export const ProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  currentRole: z.string().min(1, "Current role is required"),
  targetRole: z.string().min(1, "Target role is required"),
  skills: z.array(z.string()).optional(),
  hoursPerWeek: z.number().min(1).max(168).optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// Goal validation
export const GoalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["OBJECTIVE", "KEY_RESULT"]),
  startDate: z.string().or(z.date()),
  targetDate: z.string().or(z.date()),
  priority: z.number().min(1).max(5).optional(),
});

export type Goal = z.infer<typeof GoalSchema>;

// Task validation
export const TaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.string().or(z.date()),
  priority: z.number().min(1).max(5).optional(),
  estimatedHours: z.number().positive().optional(),
  goalId: z.string().uuid().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Auth validation
export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type Login = z.infer<typeof LoginSchema>;

export const SignupSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type Signup = z.infer<typeof SignupSchema>;

// Pagination validation
export const PaginationSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Filters validation
export const FiltersSchema = z.object({
  status: z.string().optional(),
  priority: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type Filters = z.infer<typeof FiltersSchema>;
