import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Flame, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrowthPlan } from "@/types/growth-plan";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { UserProfileMenu } from "@/components/user/UserProfileMenu";

interface ProgressChartProps {
  plan: GrowthPlan;
  onBack: () => void;
}

export const ProgressChart = ({ plan, onBack }: ProgressChartProps) => {
  // Generate mock data for charts
  const weeklyData = Array.from({ length: 26 }, (_, i) => {
    const baseProgress = (i / 26) * 100;
    return {
      week: `W${i + 1}`,
      progress: Math.min(100, Math.round(baseProgress + Math.random() * 10 - 5)),
      tasks: Math.round(7 + Math.random() * 3),
      hours: Math.round((plan.profile.dailyTime * 7) * (0.8 + Math.random() * 0.4)),
    };
  });

  const skillData = plan.skills.map((skill) => ({
    name: skill.name,
    current: skill.currentLevel * 10,
    target: skill.targetLevel * 10,
  }));

  const completedTasks = plan.dailyTasks.filter((t) => t.completed).length;
  const totalTasks = plan.dailyTasks.length;
  const avgDailyHours = plan.profile.dailyTime;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="font-display text-lg md:text-xl font-bold truncate">Progress & Statistics</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  Track your development journey
                </p>
              </div>
            </div>
            <UserProfileMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          {[
            { 
              label: "Consistency Score", 
              value: `${plan.consistencyScore}%`, 
              icon: Flame, 
              color: "text-agent-progress",
              bg: "bg-agent-progress/10"
            },
            { 
              label: "Tasks Completed", 
              value: completedTasks, 
              icon: Award, 
              color: "text-primary",
              bg: "bg-primary/10"
            },
            { 
              label: "Days Passed", 
              value: "1/180", 
              icon: Calendar, 
              color: "text-agent-daily",
              bg: "bg-agent-daily/10"
            },
            { 
              label: "Avg Study Hours", 
              value: `${avgDailyHours}h`, 
              icon: TrendingUp, 
              color: "text-agent-skill",
              bg: "bg-agent-skill/10"
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-3 md:p-5"
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-2 md:mb-3`}>
                <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl md:text-3xl font-display font-bold">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Over Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 md:p-6 mb-4 md:mb-6"
        >
          <h2 className="font-display text-lg md:text-xl font-bold mb-4 md:mb-6">Weekly Progress</h2>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData.slice(0, 4)}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis 
                  dataKey="week" 
                  stroke="hsl(215, 20%, 55%)" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(215, 20%, 55%)" 
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 9%)",
                    border: "1px solid hsl(217, 33%, 17%)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={2}
                  fill="url(#progressGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skills Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 md:p-6"
        >
          <h2 className="font-display text-lg md:text-xl font-bold mb-4 md:mb-6">Skills Progress</h2>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis 
                  type="number" 
                  stroke="hsl(215, 20%, 55%)" 
                  fontSize={10}
                  domain={[0, 100]}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(215, 20%, 55%)" 
                  fontSize={10}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 9%)",
                    border: "1px solid hsl(217, 33%, 17%)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                />
                <Bar 
                  dataKey="current" 
                  fill="hsl(160, 84%, 39%)" 
                  radius={[0, 4, 4, 0]}
                  name="Current"
                />
                <Bar 
                  dataKey="target" 
                  fill="hsl(199, 89%, 48%)" 
                  radius={[0, 4, 4, 0]}
                  name="Target"
                  opacity={0.5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
