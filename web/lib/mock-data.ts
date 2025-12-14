// Mock data for development and testing

export const mockDashboardData = {
  profile: {
    name: "John Doe",
    currentRole: "Mid-level Developer",
    targetRole: "Senior Developer",
    experience: 3,
  },
  progress: {
    tasksCompleted: 45,
    tasksTotal: 180,
    goalsOnTrack: 4,
    goalsTotal: 6,
    weeklyProgress: 65,
  },
  nextTasks: [
    {
      id: "1",
      title: "Complete TypeScript advanced tutorial",
      priority: "high",
      dueDate: "2025-12-15",
    },
    {
      id: "2",
      title: "Review system design patterns",
      priority: "medium",
      dueDate: "2025-12-16",
    },
    {
      id: "3",
      title: "Implement caching strategy",
      priority: "high",
      dueDate: "2025-12-17",
    },
  ],
  upcomingGoals: [
    {
      id: "1",
      title: "Master TypeScript",
      progress: 75,
    },
    {
      id: "2",
      title: "System Design Proficiency",
      progress: 50,
    },
    {
      id: "3",
      title: "Leadership Skills",
      progress: 40,
    },
  ],
};

export const mockPlanData = {
  skillGaps: [
    {
      skill: "System Design",
      current: 5,
      target: 8,
      priority: "high",
    },
    {
      skill: "TypeScript Advanced",
      current: 6,
      target: 9,
      priority: "high",
    },
    {
      skill: "Leadership",
      current: 4,
      target: 7,
      priority: "medium",
    },
    {
      skill: "AWS Services",
      current: 3,
      target: 8,
      priority: "medium",
    },
  ],
  goals: [
    {
      id: "1",
      title: "Master Advanced TypeScript Concepts",
      description: "Deep dive into TypeScript generics, decorators, and advanced type system",
      progress: 60,
      startDate: "2025-12-14",
      endDate: "2026-02-14",
      priority: "high",
      skills: ["TypeScript", "OOP", "Type System"],
    },
    {
      id: "2",
      title: "System Design & Architecture",
      description: "Learn to design scalable systems and make architectural decisions",
      progress: 40,
      startDate: "2025-12-14",
      endDate: "2026-03-14",
      priority: "high",
      skills: ["System Design", "Architecture", "Scalability"],
    },
    {
      id: "3",
      title: "Cloud Infrastructure (AWS)",
      description: "Become proficient with AWS services and cloud architecture",
      progress: 25,
      startDate: "2026-01-14",
      endDate: "2026-04-14",
      priority: "medium",
      skills: ["AWS", "CloudFormation", "DevOps"],
    },
  ],
  timeline: "6 months",
};

export const mockDailyTasksData = {
  date: "2025-12-14",
  tasks: [
    {
      id: "1",
      title: "Read TypeScript Handbook - Generics",
      description: "Study and understand TypeScript generics patterns",
      status: "pending",
      priority: "high",
      dueDate: "2025-12-14",
      category: "Learning",
    },
    {
      id: "2",
      title: "Complete system design exercise",
      description: "Design a URL shortening service",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-12-14",
      category: "Practice",
    },
    {
      id: "3",
      title: "Review peer code",
      description: "Code review for team members",
      status: "pending",
      priority: "medium",
      dueDate: "2025-12-14",
      category: "Collaboration",
    },
    {
      id: "4",
      title: "Watch AWS tutorial",
      description: "Lambda functions deep dive",
      status: "completed",
      priority: "medium",
      dueDate: "2025-12-14",
      category: "Learning",
    },
  ],
  completedToday: 1,
  totalToday: 4,
  motivation: "Great progress so far! Keep pushing and you'll reach your goals. Every small step counts!",
};

export const mockReportsData = {
  weeklyReports: [
    {
      period: "Week 1",
      summary:
        "Excellent start! You completed 12 out of 15 daily tasks and made significant progress on your TypeScript learning goals.",
      strengths: ["Strong commitment to daily learning", "Consistent task completion", "Great documentation reading"],
      weaknesses: ["Need more practical coding exercises", "System design practice is lagging"],
      achievements: [
        { skill: "TypeScript", improvement: 15 },
        { skill: "Reading", improvement: 20 },
      ],
      recommendations: [
        "Increase hands-on coding practice",
        "Schedule dedicated system design sessions",
        "Consider pair programming sessions",
      ],
      overallRating: 82,
    },
  ],
  monthlyReport: {
    period: "December 2025",
    summary:
      "Outstanding monthly performance! You're on track with your 6-month plan and showing consistent growth across all key skills.",
    strengths: [
      "Excellent task completion rate (85%)",
      "Strong TypeScript progress",
      "Good system design fundamentals",
      "Consistent daily engagement",
    ],
    weaknesses: [
      "AWS knowledge still developing",
      "Leadership skills need more focus",
      "Documentation could be better",
    ],
    achievements: [
      { skill: "TypeScript", improvement: 20 },
      { skill: "System Design", improvement: 15 },
      { skill: "AWS", improvement: 10 },
    ],
    recommendations: [
      "Start AWS certification course",
      "Join team leadership meetings",
      "Create technical blog posts",
      "Mentor junior developers",
    ],
    overallRating: 85,
  },
  finalReport: {
    period: "Final Report (6 Months)",
    summary:
      "Exceptional growth! You've successfully completed your 6-month development plan and are now ready for your target role as a Senior Developer.",
    strengths: [
      "Mastered TypeScript advanced concepts",
      "Strong system design skills",
      "Excellent leadership development",
      "Cloud infrastructure knowledge",
      "Consistent high performance",
    ],
    weaknesses: [],
    achievements: [
      { skill: "TypeScript", improvement: 50 },
      { skill: "System Design", improvement: 50 },
      { skill: "AWS", improvement: 45 },
      { skill: "Leadership", improvement: 40 },
    ],
    recommendations: [
      "Apply for Senior Developer position",
      "Lead technical architecture decisions",
      "Mentor multiple junior developers",
      "Continue AWS learning path",
    ],
    overallRating: 92,
  },
};
