export interface UserProfile {
  role: string;
  currentLevel: string;
  dailyTime: number; // hours
  targetGoal: string;
  targetLevel: string;
}

export interface Skill {
  name: string;
  currentLevel: number; // 1-10
  targetLevel: number;
  priority: 'high' | 'medium' | 'low';
}

export interface OKR {
  objective: string;
  keyResults: string[];
  progress: number;
  month: number;
}

export interface DailyTask {
  id: string;
  day: number;
  date: string;
  title: string;
  description: string;
  skill: string;
  duration: number; // minutes
  completed: boolean;
  resources?: string[];
}

export interface WeeklyPlan {
  week: number;
  focus: string;
  tasks: DailyTask[];
  goals: string[];
}

export interface GrowthPlan {
  id: string;
  userId: string;
  profile: UserProfile;
  skills: Skill[];
  okrs: OKR[];
  weeklyPlans: WeeklyPlan[];
  dailyTasks: DailyTask[];
  consistencyScore: number;
  startDate: string;
  createdAt: string;
}

export interface AgentStatus {
  name: string;
  status: 'idle' | 'processing' | 'complete';
  progress: number;
  output?: string;
}

export type AgentType = 'skill-gap' | 'goal-planning' | 'daily-breakdown' | 'progress-tracker' | 'hr-summary';
