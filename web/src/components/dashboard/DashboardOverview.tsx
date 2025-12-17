import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Target, Calendar, TrendingUp, Award, CheckCircle2, 
  Clock, Flame, ChevronRight, Brain, BarChart3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GrowthPlan, DailyTask, OKR } from "@/types/growth-plan";
import { DailyTasksView } from "./DailyTasksView";
import { OKRsView } from "./OKRsView";
import { ProgressChart } from "./ProgressChart";
import { UserProfileMenu } from "@/components/user/UserProfileMenu";
import { goalsApi } from "@/lib/api";
import type { Goal } from "@/lib/api/goals";

interface DashboardOverviewProps {
  plan: GrowthPlan;
  onUpdateTask: (taskId: string, completed: boolean) => void;
  userInfo?: { currentRole: string; targetRole: string; currentLevel?: string; targetLevel?: string } | null;
}

export const DashboardOverview = ({ plan, onUpdateTask, userInfo }: DashboardOverviewProps) => {
  const [activeView, setActiveView] = useState<"overview" | "daily" | "okrs" | "progress">("overview");
  const [okrs, setOkrs] = useState<OKR[]>(plan.okrs || []);
  const [isLoadingOkrs, setIsLoadingOkrs] = useState(false);

  // Fetch goals from API and convert to OKRs
  useEffect(() => {
    const fetchGoals = async () => {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id;

      if (!userId) return;

      setIsLoadingOkrs(true);
      try {
        const goalsResponse = await goalsApi.findByUser(userId);
        const goals = goalsResponse?.data || [];

        if (Array.isArray(goals) && goals.length > 0) {
          // Filter OBJECTIVE goals and convert to OKRs
          const objectives = goals
            .filter((g: Goal) => g.type === "OBJECTIVE")
            .slice(0, 6) // Limit to 6 months
            .map((goal: Goal, index: number) => ({
              month: index + 1,
              objective: goal.title,
              keyResults: goal.description ? goal.description.split(/[,;]/).map(kr => kr.trim()).filter(Boolean) : [],
              progress: goal.progress || 0,
            }));

          setOkrs(objectives);
        }
      } catch (error) {
        console.error("Failed to fetch goals:", error);
        // Keep existing okrs from plan if API fails
      } finally {
        setIsLoadingOkrs(false);
      }
    };

    fetchGoals();
  }, []);

  const todayTasks = plan.dailyTasks.filter((task) => task.day === 1);
  const completedTasks = plan.dailyTasks.filter((task) => task.completed).length;
  const totalTasks = plan.dailyTasks.length;
  // Fix NaN issue - check for division by zero
  const progressPercent = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  // Get Week 1 tasks (days 1-7)
  const week1Tasks = plan.dailyTasks.filter((task) => task.day >= 1 && task.day <= 7);
  
  // Derive focus from Week 1 tasks
  const deriveFocus = (tasks: typeof week1Tasks): string => {
    if (tasks.length === 0) return "Week 1 Focus";
    
    // Extract keywords from task titles, descriptions, and skills
    const textCorpus = tasks
      .flatMap((t) => [t.title || "", t.description || "", t.skill || ""])
      .join(" ")
      .toLowerCase();

    const keywords = textCorpus
      .split(/[^a-z0-9+]+/i)
      .filter((w) => w.length > 4)
      .filter((w) => !["focus", "week", "daily", "tasks", "design", "build", "learn", "practice"].includes(w));

    const freq: Record<string, number> = {};
    keywords.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });
    
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1))
      .slice(0, 2);

    if (topWords.length > 0) {
      return `Focus: ${topWords.join(" & ")}`;
    }
    
    // Fallback: use most common skill
    const skills = tasks.map(t => t.skill).filter(Boolean);
    if (skills.length > 0) {
      const skillFreq: Record<string, number> = {};
      skills.forEach(s => {
        skillFreq[s] = (skillFreq[s] || 0) + 1;
      });
      const topSkill = Object.entries(skillFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topSkill) {
        return `Focus: ${topSkill}`;
      }
    }
    
    return "Week 1 Focus";
  };

  // Derive goals from Week 1 tasks (top 3-5 unique task titles)
  const deriveGoals = (tasks: typeof week1Tasks): string[] => {
    if (tasks.length === 0) return [];
    
    // Get unique task titles, prioritizing by importance (can be enhanced with priority if available)
    const uniqueTasks = Array.from(new Set(tasks.map(t => t.title).filter(Boolean)));
    
    // Return top 3-5 goals
    return uniqueTasks.slice(0, 5);
  };

  const week1Focus = deriveFocus(week1Tasks);
  const week1Goals = deriveGoals(week1Tasks);
  
  // Use derived focus and goals, or fallback to weeklyPlans data
  const currentWeek = plan.weeklyPlans[0];
  const displayFocus = week1Focus !== "Week 1 Focus" ? week1Focus : (currentWeek?.focus || "Week 1 Focus");
  const displayGoals = week1Goals.length > 0 ? week1Goals : (currentWeek?.goals || []);

  if (activeView === "daily") {
    return <DailyTasksView plan={plan} onUpdateTask={onUpdateTask} onBack={() => setActiveView("overview")} />;
  }

  if (activeView === "okrs") {
    // Create updated plan with fetched OKRs
    const planWithOkrs = {
      ...plan,
      okrs: okrs.length > 0 ? okrs : plan.okrs,
    };
    return <OKRsView plan={planWithOkrs} onBack={() => setActiveView("overview")} />;
  }

  if (activeView === "progress") {
    return <ProgressChart plan={plan} onBack={() => setActiveView("overview")} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-lg md:text-2xl font-bold gradient-text truncate">
                AI Growth Planner
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {userInfo 
                  ? `${userInfo.currentRole}${userInfo.currentLevel ? ` • ${userInfo.currentLevel}` : ""} → ${userInfo.targetLevel || userInfo.targetRole || ""}`
                  : `${plan.profile.role} • ${plan.profile.currentLevel} → ${plan.profile.targetLevel}`
                }
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <div className="glass-card px-2 md:px-4 py-1.5 md:py-2 flex items-center gap-1 md:gap-2">
                <Flame className="w-4 h-4 md:w-5 md:h-5 text-agent-progress" />
                <span className="font-semibold text-sm md:text-base">{typeof plan.consistencyScore === 'number' ? plan.consistencyScore.toFixed(2) : '0.00'}%</span>
                <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">Consistency</span>
              </div>
              <UserProfileMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          {[
            { label: "Current Day", value: "1/180", icon: Calendar, color: "text-agent-daily" },
            { label: "Tasks Completed", value: `${completedTasks}/${totalTasks}`, icon: CheckCircle2, color: "text-primary" },
            { label: "Hours/Day", value: `${typeof plan.profile.dailyTime === 'number' ? plan.profile.dailyTime.toFixed(2) : '0.00'}h`, icon: Clock, color: "text-agent-skill" },
            { label: "OKRs Completed", value: "0/6", icon: Target, color: "text-agent-goal" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-3 md:p-5"
            >
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color} mb-2 md:mb-3`} />
              <p className="text-xl md:text-2xl font-display font-bold">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg md:text-xl font-bold">Today's Tasks</h2>
                <p className="text-xs md:text-sm text-muted-foreground">Day 1 - Journey Begins</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveView("daily")} className="shrink-0 ml-2">
                <span className="hidden sm:inline">View All</span>
                <ChevronRight className="w-4 h-4 sm:ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {todayTasks.map((task) => (
                <TaskCard key={task.id} task={task} onToggle={onUpdateTask} />
              ))}
            </div>
          </motion.div>

          {/* This Week Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Brain className="w-5 h-5 text-agent-skill" />
              <h2 className="font-display text-lg md:text-xl font-bold">Week 1</h2>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Focus</p>
              <p className="font-medium">{displayFocus}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">This week's goals:</p>
              {displayGoals.length > 0 ? (
                displayGoals.map((goal, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <span className="text-xs text-primary">{i + 1}</span>
                    </div>
                    <p className="text-sm">{goal}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No goals set for this week</p>
              )}
            </div>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4 md:p-6 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setActiveView("progress")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <BarChart3 className="w-5 h-5 text-agent-progress shrink-0" />
                <h2 className="font-display text-lg md:text-xl font-bold truncate">Overall Progress</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">
                  {isNaN(progressPercent) || totalTasks === 0 ? "0" : progressPercent}%
                </span>
              </div>
              <Progress 
                value={isNaN(progressPercent) || totalTasks === 0 ? 0 : progressPercent} 
                className="h-2" 
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {totalTasks === 0 ? (
                <span className="italic">No tasks available</span>
              ) : (
                `${completedTasks} / ${totalTasks} tasks completed`
              )}
            </p>
          </motion.div>

          {/* OKRs Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 glass-card p-4 md:p-6 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setActiveView("okrs")}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <Target className="w-5 h-5 text-agent-goal shrink-0" />
                <h2 className="font-display text-lg md:text-xl font-bold truncate">6-Month OKRs</h2>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </div>

            {isLoadingOkrs ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Loading OKRs...</p>
              </div>
            ) : okrs.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                {okrs.slice(0, 2).map((okr, i) => (
                  <div key={i} className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Month {okr.month}</span>
                      <span className="text-xs text-primary">
                        {isNaN(okr.progress) ? 0 : okr.progress}%
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-2">{okr.objective || "No objective set"}</p>
                    <Progress 
                      value={isNaN(okr.progress) ? 0 : Math.max(0, Math.min(100, okr.progress))} 
                      className="h-1" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground italic">No OKRs available</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const TaskCard = ({ 
  task, 
  onToggle 
}: { 
  task: DailyTask; 
  onToggle: (id: string, completed: boolean) => void;
}) => {
  return (
    <div
      className={`p-3 md:p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
        task.completed
          ? "bg-primary/10 border-primary/30"
          : "bg-secondary/50 border-border hover:border-primary/30"
      }`}
      onClick={() => onToggle(task.id, !task.completed)}
    >
      <div className="flex items-start gap-2 md:gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors shrink-0 ${
            task.completed
              ? "bg-primary border-primary"
              : "border-muted-foreground"
          }`}
        >
          {task.completed && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm md:text-base ${task.completed ? "line-through text-muted-foreground" : ""} break-words`}>
            {task.title}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 break-words">{task.description}</p>
          <div className="flex items-center gap-2 md:gap-3 mt-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
              {task.skill}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {task.duration} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
