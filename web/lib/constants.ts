export const ROLES = [
  "Junior Developer",
  "Mid-level Developer",
  "Senior Developer",
  "Tech Lead",
  "Engineering Manager",
  "Product Manager",
  "Designer",
  "DevOps Engineer",
  "Data Engineer",
  "Architect",
  "Full-stack Developer",
];

export const PRIORITIES = {
  high: {
    label: "High",
    badge: "error",
    color: "red",
  },
  medium: {
    label: "Medium",
    badge: "warning",
    color: "yellow",
  },
  low: {
    label: "Low",
    badge: "info",
    color: "blue",
  },
} as const;

export const STATUS = {
  pending: {
    label: "Pending",
    badge: "default",
    color: "gray",
  },
  "in-progress": {
    label: "In Progress",
    badge: "info",
    color: "blue",
  },
  completed: {
    label: "Completed",
    badge: "success",
    color: "green",
  },
} as const;

export const AVAILABLE_HOURS = [
  { value: "3", label: "3 hours/week" },
  { value: "5", label: "5 hours/week" },
  { value: "10", label: "10 hours/week" },
  { value: "15", label: "15 hours/week" },
  { value: "20", label: "20+ hours/week" },
];

export const COMMON_SKILLS = [
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "AWS",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "REST API",
  "SQL",
  "MongoDB",
  "Git",
  "CI/CD",
  "Testing",
  "System Design",
  "Leadership",
  "Communication",
  "Problem Solving",
];

export const REPORT_PERIODS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "final", label: "Final" },
];

export const API_ENDPOINTS = {
  users: {
    profile: "/users/profile",
    update: "/users/profile",
  },
  goals: {
    list: "/goals",
    create: "/goals",
    update: "/goals/:id",
    delete: "/goals/:id",
  },
  dailyTasks: {
    today: "/daily-tasks/today",
    list: "/daily-tasks",
    create: "/daily-tasks",
    complete: "/daily-tasks/:id/complete",
    update: "/daily-tasks/:id",
  },
  reports: {
    summary: "/reports/summary",
    weekly: "/reports/weekly",
    monthly: "/reports/monthly",
    final: "/reports/final",
  },
  progress: {
    tracking: "/progress-tracking",
    weekly: "/progress-tracking/weekly",
    monthly: "/progress-tracking/monthly",
  },
};

export const MESSAGES = {
  loading: "Loading...",
  loadingFailed: "Failed to load data",
  success: "Operation successful",
  error: "An error occurred",
  confirmDelete: "Are you sure you want to delete this?",
  networkError: "Network error. Please check your connection.",
};

export const MOTIVATIONAL_QUOTES = [
  "Success is not final, failure is not fatal.",
  "The only way to do great work is to love what you do.",
  "Your limitation—it's only your imagination.",
  "Dream it. Believe it. Build it.",
  "Do something today that your future self will thank you for.",
];
