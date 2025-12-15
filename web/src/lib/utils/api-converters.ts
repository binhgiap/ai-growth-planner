import { GrowthPlan, UserProfile, OKR, DailyTask, Skill, WeeklyPlan } from "@/types/growth-plan";
import { Goal, DailyTask as ApiTask } from "@/lib/api/goals";
import { GeneratedPlan } from "@/lib/api/planning";

/**
 * Convert API Goal to OKR format
 */
export const convertGoalToOKR = (goal: Goal, month: number): OKR => {
  return {
    month,
    objective: goal.title,
    keyResults: goal.description ? [goal.description] : [],
    progress: goal.progress || 0,
  };
};

/**
 * Convert API Task to DailyTask format
 */
export const convertApiTaskToDailyTask = (apiTask: ApiTask, day: number): DailyTask => {
  return {
    id: apiTask.id,
    day,
    date: apiTask.dueDate,
    title: apiTask.title,
    description: apiTask.description || "",
    skill: "", // Will be set from goal or plan
    duration: apiTask.estimatedHours ? apiTask.estimatedHours * 60 : 60,
    completed: apiTask.completed || apiTask.status === "COMPLETED",
    resources: apiTask.notes ? [apiTask.notes] : undefined,
  };
};

/**
 * Convert API GeneratedPlan to GrowthPlan format
 */
export const convertApiPlanToGrowthPlan = (
  apiPlan: GeneratedPlan,
  userProfile: UserProfile,
  userId: string
): GrowthPlan => {
  const now = new Date();
  const startDate = now.toISOString();

  // Convert skill gaps to skills
  const skills: Skill[] = apiPlan.skillGap.gaps.map((gap, index) => ({
    name: gap,
    currentLevel: 4, // Default, can be adjusted
    targetLevel: 8,
    priority: index < 2 ? "high" : index < 4 ? "medium" : "low",
  }));

  // Convert goals to OKRs
  const okrs: OKR[] = apiPlan.goals
    .filter((g) => g.type === "OBJECTIVE")
    .map((goal, index) => ({
      month: index + 1,
      objective: goal.title,
      keyResults: goal.keyResults || [],
      progress: 0,
    }));

  // Convert daily tasks
  const dailyTasks: DailyTask[] = [];
  apiPlan.dailyTasks.forEach((dayData, dayIndex) => {
    dayData.tasks.forEach((task, taskIndex) => {
      dailyTasks.push({
        id: `task-${dayIndex}-${taskIndex}`,
        day: dayIndex + 1,
        date: dayData.date,
        title: task.title,
        description: "",
        skill: "", // Can be derived from goal
        duration: task.duration * 60, // Convert hours to minutes
        completed: false,
      });
    });
  });

  // Create weekly plans
  const weeklyPlans: WeeklyPlan[] = [];
  for (let week = 1; week <= 26; week++) {
    const weekTasks = dailyTasks.filter((t) => t.day > (week - 1) * 7 && t.day <= week * 7);
    weeklyPlans.push({
      week,
      focus: `Week ${week} Focus`,
      tasks: weekTasks,
      goals: [],
    });
  }

  return {
    id: `plan-${userId}-${Date.now()}`,
    userId,
    profile: userProfile,
    skills,
    okrs,
    weeklyPlans,
    dailyTasks,
    consistencyScore: 0,
    startDate,
    createdAt: startDate,
  };
};

/**
 * Load plan from API (goals + tasks) and convert to GrowthPlan
 */
export const loadPlanFromAPI = async (
  userId: string,
  userProfile: UserProfile
): Promise<GrowthPlan | null> => {
  try {
    console.log(`[API] Loading plan from API for user: ${userId}`);
    const { goalsApi, tasksApi } = await import("@/lib/api");

    // Fetch goals and tasks in parallel
    console.log(`[API] Fetching goals and tasks for user: ${userId}`);
    const [goalsResponse, tasksResponse] = await Promise.all([
      goalsApi.findByUser(userId).catch(err => {
        console.error(`[API] Error fetching goals:`, err);
        throw err;
      }),
      tasksApi.findByUser(userId).catch(err => {
        console.error(`[API] Error fetching tasks:`, err);
        throw err;
      }),
    ]);

    if (!goalsResponse.success || !tasksResponse.success) {
      return null;
    }

    const goals = goalsResponse.data.data || [];
    const tasks = tasksResponse.data || [];

    // Convert to GrowthPlan format
    const now = new Date();
    const startDate = now.toISOString();

    // Group goals by month (assuming 6 months)
    const okrs: OKR[] = goals
      .filter((g) => g.type === "OBJECTIVE")
      .slice(0, 6)
      .map((goal, index) => ({
        month: index + 1,
        objective: goal.title,
        keyResults: goal.description ? [goal.description] : [],
        progress: goal.progress || 0,
      }));

    // Convert tasks
    const dailyTasks: DailyTask[] = tasks.map((task, index) => ({
      id: task.id,
      day: Math.floor(index / 3) + 1, // Distribute tasks across days
      date: task.dueDate,
      title: task.title,
      description: task.description || "",
      skill: "",
      duration: task.estimatedHours ? task.estimatedHours * 60 : 60,
      completed: task.completed || task.status === "COMPLETED",
    }));

    // Create weekly plans
    const weeklyPlans: WeeklyPlan[] = [];
    for (let week = 1; week <= 26; week++) {
      const weekTasks = dailyTasks.filter((t) => t.day > (week - 1) * 7 && t.day <= week * 7);
      weeklyPlans.push({
        week,
        focus: `Week ${week} Focus`,
        tasks: weekTasks,
        goals: [],
      });
    }

    // Calculate consistency score
    const completedTasks = dailyTasks.filter((t) => t.completed).length;
    const totalTasks = dailyTasks.length;
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const consistencyScore = Math.max(60, 100 - (100 - progressPercent) * 0.4);

    return {
      id: `plan-${userId}`,
      userId,
      profile: userProfile,
      skills: [], // Skills would need to be loaded separately
      okrs,
      weeklyPlans,
      dailyTasks,
      consistencyScore,
      startDate,
      createdAt: startDate,
    };
  } catch (error) {
    console.error("Error loading plan from API:", error);
    return null;
  }
};

/**
 * Create goals and tasks in API from GrowthPlan
 */
export const persistPlanToAPI = async (
  userId: string,
  plan: GrowthPlan
): Promise<void> => {
  try {
    const { goalsApi, tasksApi } = await import("@/lib/api");

    // Create goals (OKRs)
    const goalPromises = plan.okrs.map((okr, index) => {
      const startDate = new Date(plan.startDate);
      startDate.setMonth(startDate.getMonth() + index);
      const targetDate = new Date(startDate);
      targetDate.setMonth(targetDate.getMonth() + 1);

      return goalsApi.create(userId, {
        title: okr.objective,
        description: okr.keyResults.join(", "),
        type: "OBJECTIVE",
        startDate: startDate.toISOString(),
        targetDate: targetDate.toISOString(),
        priority: 1,
        notes: `Month ${okr.month} objective`,
      });
    });

    await Promise.all(goalPromises);

    // Create tasks
    const taskPromises = plan.dailyTasks.map((task) => {
      return tasksApi.create(userId, {
        title: task.title,
        description: task.description,
        dueDate: task.date,
        priority: 1,
        estimatedHours: task.duration / 60,
        notes: task.skill,
      });
    });

    await Promise.all(taskPromises);
  } catch (error) {
    console.error("Error persisting plan to API:", error);
    throw error;
  }
};

