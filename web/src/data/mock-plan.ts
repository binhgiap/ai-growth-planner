import { GrowthPlan, UserProfile } from "@/types/growth-plan";

export const generateMockPlan = (profile: UserProfile): GrowthPlan => {
  const skills = [
    { name: "System Design", currentLevel: 4, targetLevel: 8, priority: "high" as const },
    { name: "Code Review", currentLevel: 5, targetLevel: 8, priority: "high" as const },
    { name: "Leadership", currentLevel: 3, targetLevel: 7, priority: "medium" as const },
    { name: "Communication", currentLevel: 5, targetLevel: 8, priority: "medium" as const },
    { name: "Technical Writing", currentLevel: 4, targetLevel: 7, priority: "low" as const },
  ];

  const okrs = [
    {
      month: 1,
      objective: "Master System Design Fundamentals",
      keyResults: [
        "Complete 10 System Design fundamentals lessons",
        "Practice designing 3 simple systems",
        "Write 2 blog posts about learned concepts",
      ],
      progress: 0,
    },
    {
      month: 2,
      objective: "Develop Advanced Code Review Skills",
      keyResults: [
        "Review 20 Pull Requests with detailed feedback",
        "Build personal Code Review checklist",
        "Mentor 1 junior developer in the team",
      ],
      progress: 0,
    },
    {
      month: 3,
      objective: "Enhance Leadership Capabilities in Projects",
      keyResults: [
        "Lead 1 feature from design to deployment",
        "Organize 4 knowledge sharing sessions with team",
        "Improve sprint velocity by 15%",
      ],
      progress: 0,
    },
    {
      month: 4,
      objective: "Build First Complex System",
      keyResults: [
        "Design and implement microservice architecture",
        "Achieve 80% test coverage for new system",
        "Document all technical decisions",
      ],
      progress: 0,
    },
    {
      month: 5,
      objective: "Expand Technical Influence in Company",
      keyResults: [
        "Present 2 internal tech talks",
        "Contribute to company coding standards",
        "Build 1 internal tool for the team",
      ],
      progress: 0,
    },
    {
      month: 6,
      objective: "Prepare and Achieve Promotion",
      keyResults: [
        "Complete portfolio with 5 highlight projects",
        "Receive 3 endorsements from senior engineers",
        "Pass Senior level technical interview",
      ],
      progress: 0,
    },
  ];

  const weeklyPlans = Array.from({ length: 26 }, (_, weekIndex) => {
    const week = weekIndex + 1;
    const monthIndex = Math.floor(weekIndex / 4);
    const focusAreas = [
      "System Design Fundamentals",
      "Design Patterns & Architecture",
      "Code Review Best Practices",
      "Leadership & Mentoring",
      "Advanced System Design",
      "Career Preparation",
    ];

    return {
      week,
      focus: focusAreas[monthIndex] || "Continuous Learning",
      tasks: [],
      goals: [
        `Complete ${3 + Math.floor(Math.random() * 2)} main tasks this week`,
        `Dedicate ${profile.dailyTime * 5}h for learning`,
        "Review learned knowledge at end of week",
      ],
    };
  });

  // Generate 180 days of tasks
  const taskTemplates = [
    { title: "Learn System Design", skill: "System Design", duration: 60 },
    { title: "Read Clean Code chapter", skill: "Code Review", duration: 45 },
    { title: "Practice coding problems", skill: "Problem Solving", duration: 90 },
    { title: "Watch tech talk video", skill: "System Design", duration: 30 },
    { title: "Write technical blog", skill: "Technical Writing", duration: 60 },
    { title: "Review team PRs", skill: "Code Review", duration: 45 },
    { title: "Mentor session", skill: "Leadership", duration: 30 },
    { title: "Read engineering articles", skill: "System Design", duration: 30 },
  ];

  const dailyTasks = Array.from({ length: 180 }, (_, dayIndex) => {
    const day = dayIndex + 1;
    const tasksPerDay = Math.floor(profile.dailyTime * 60 / 45); // ~45 min per task
    
    return Array.from({ length: Math.min(tasksPerDay, 4) }, (_, taskIndex) => {
      const template = taskTemplates[(dayIndex + taskIndex) % taskTemplates.length];
      return {
        id: `task-${day}-${taskIndex}`,
        day,
        date: new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000).toISOString(),
        title: `${template.title} - Day ${day}`,
        description: `Task ${taskIndex + 1} for day ${day}: ${template.title.toLowerCase()}`,
        skill: template.skill,
        duration: template.duration,
        completed: false,
        resources: ["documentation.com", "video-tutorial.com"],
      };
    });
  }).flat();

  return {
    id: `plan-${Date.now()}`,
    userId: "user-1",
    profile,
    skills,
    okrs,
    weeklyPlans,
    dailyTasks,
    consistencyScore: 100,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
};
