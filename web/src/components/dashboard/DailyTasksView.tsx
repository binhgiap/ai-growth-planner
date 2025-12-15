import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrowthPlan, DailyTask } from "@/types/growth-plan";
import { UserProfileMenu } from "@/components/user/UserProfileMenu";

interface DailyTasksViewProps {
  plan: GrowthPlan;
  onUpdateTask: (taskId: string, completed: boolean) => void;
  onBack: () => void;
}

export const DailyTasksView = ({ plan, onUpdateTask, onBack }: DailyTasksViewProps) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const daysInWeek = Array.from({ length: 7 }, (_, i) => (selectedWeek - 1) * 7 + i + 1);
  const currentDayTasks = plan.dailyTasks.filter((task) => task.day === selectedDay);
  const weekPlan = plan.weeklyPlans.find((w) => w.week === selectedWeek);

  const completedToday = currentDayTasks.filter((t) => t.completed).length;
  const totalToday = currentDayTasks.length;

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
                <h1 className="font-display text-lg md:text-xl font-bold truncate">180-Day Plan</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  Week {selectedWeek} • {weekPlan?.focus}
                </p>
              </div>
            </div>
            <UserProfileMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedWeek === 1}
            onClick={() => setSelectedWeek((w) => w - 1)}
            className="text-xs sm:text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Previous Week</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          <span className="font-display font-semibold text-sm sm:text-base">Week {selectedWeek} / 26</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectedWeek === 26}
            onClick={() => setSelectedWeek((w) => w + 1)}
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Next Week</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Day Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 overflow-x-auto pb-4 mb-4 md:mb-6 scrollbar-hide"
        >
          {daysInWeek.map((day) => {
            const dayTasks = plan.dailyTasks.filter((t) => t.day === day);
            const dayCompleted = dayTasks.filter((t) => t.completed).length;
            const isSelected = day === selectedDay;
            const isComplete = dayCompleted === dayTasks.length && dayTasks.length > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 p-3 md:p-4 rounded-xl border transition-all duration-300 min-w-[70px] sm:min-w-[80px] ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : isComplete
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <p className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  Day
                </p>
                <p className="text-xl sm:text-2xl font-display font-bold">{day}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {isComplete ? (
                    <CheckCircle2 className={`w-3 h-3 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                  ) : (
                    <span className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {dayCompleted}/{dayTasks.length}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Day Stats */}
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 md:p-4 mb-4 md:mb-6"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-agent-daily shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm md:text-base">Day {selectedDay}</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {completedToday} / {totalToday} tasks completed
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl md:text-2xl font-display font-bold gradient-text">
                {totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tasks List */}
        <div className="space-y-3">
          {currentDayTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 md:p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                task.completed
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border hover:border-primary/30"
              }`}
              onClick={() => onUpdateTask(task.id, !task.completed)}
            >
              <div className="flex items-start gap-3 md:gap-4">
                <div
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    task.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-base md:text-lg ${task.completed ? "line-through text-muted-foreground" : ""} break-words`}>
                    {task.title}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground mt-1 break-words">{task.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 md:mt-3">
                    <span className="px-2 md:px-3 py-1 rounded-full bg-secondary text-xs md:text-sm text-muted-foreground">
                      {task.skill}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      {task.duration} min
                    </span>
                  </div>

                  {task.resources && task.resources.length > 0 && (
                    <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Resources:</p>
                      <div className="flex flex-wrap gap-2">
                        {task.resources.map((resource, i) => (
                          <a
                            key={i}
                            href="#"
                            className="text-xs text-primary hover:underline break-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {resource}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};
