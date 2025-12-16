import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Target, Calendar, TrendingUp, Users, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { AgentStatus } from "@/types/growth-plan";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { planningApi, goalsApi, tasksApi, progressApi, reportsApi } from "@/lib/api";

interface AgentProcessingProps {
  onComplete: () => void;
  error?: string | null;
  onRetry?: () => void;
  onError?: (error: string, agentId: string) => void;
}

const agents: { id: string; name: string; icon: React.ElementType; description: string; color: string }[] = [
  {
    id: "skill-gap",
    name: "Skill Gap Agent",
    icon: Brain,
    description: "Analyzing skill gaps...",
    color: "text-agent-skill",
  },
  {
    id: "goal-planning",
    name: "Goal Planning Agent",
    icon: Target,
    description: "Creating SMART 6-month goals...",
    color: "text-agent-goal",
  },
  {
    id: "daily-breakdown",
    name: "Daily Breakdown Agent",
    icon: Calendar,
    description: "Breaking down into 180 days...",
    color: "text-agent-daily",
  },
  {
    id: "progress-tracker",
    name: "Progress Tracker Agent",
    icon: TrendingUp,
    description: "Setting up tracking system...",
    color: "text-agent-progress",
  },
  {
    id: "hr-summary",
    name: "HR Summary Agent",
    icon: Users,
    description: "Preparing evaluation report...",
    color: "text-agent-hr",
  },
];

export const AgentProcessing = ({ onComplete, error, onRetry, onError }: AgentProcessingProps) => {
  const [currentAgent, setCurrentAgent] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>(
    agents.reduce((acc, agent) => ({
      ...acc,
      [agent.id]: { name: agent.name, status: "idle", progress: 0 },
    }), {})
  );

  useEffect(() => {
    const processAgent = async (index: number) => {
      if (index >= agents.length) {
        setTimeout(onComplete, 500);
        return;
      }

      const agent = agents[index];
      
      // Start processing
      setStatuses((prev) => ({
        ...prev,
        [agent.id]: { ...prev[agent.id], status: "processing", progress: 0 },
      }));

      let apiError: Error | null = null;

      // Handle the first 3 planning APIs sequentially
      try {
        if (agent.id === "skill-gap") {
          // Step 1: Analyze skill gaps
          setStatuses((prev) => ({
            ...prev,
            [agent.id]: { ...prev[agent.id], progress: 20 },
          }));

          const response = await planningApi.analyzeSkillGap();
          
          // Extract skill names from gap objects
          const skillNames = response.data.gaps
            .slice(0, 3)
            .map((gap) => gap.skill)
            .join(", ");
          const moreGaps = response.data.gaps.length > 3 ? "..." : "";
          
          setStatuses((prev) => ({
            ...prev,
            [agent.id]: { 
              ...prev[agent.id], 
              progress: 80,
              output: `Found ${response.data.gapCount} skill gaps: ${skillNames}${moreGaps}`
            },
          }));

        } else if (agent.id === "goal-planning") {
          // Step 2: Generate OKRs (requires skill gap analysis to be completed first)
          setStatuses((prev) => ({
            ...prev,
            [agent.id]: { ...prev[agent.id], progress: 20 },
          }));

          const response = await planningApi.generateGoalPlanning();
          
          setStatuses((prev) => ({
            ...prev,
            [agent.id]: { 
              ...prev[agent.id], 
              progress: 80,
              output: `Generated ${response.data.goalsCreated} OKRs for 6-month plan`
            },
          }));

        } else if (agent.id === "daily-breakdown") {
          // Step 3: Generate daily tasks (requires OKRs to be completed first)
          setStatuses((prev) => ({
            ...prev,
            [agent.id]: { ...prev[agent.id], progress: 20 },
          }));

          const response = await planningApi.generateDailyTasks();
          
          setStatuses((prev) => ({
            ...prev,
            [agent.id]: { 
              ...prev[agent.id], 
              progress: 80,
              output: `Generated ${response.data.tasksCreated} daily tasks (${response.data.taskSummary.highPriority} high, ${response.data.taskSummary.mediumPriority} medium, ${response.data.taskSummary.lowPriority} low priority)`
            },
          }));

        } else {
          // Legacy agents (progress-tracker, hr-summary) - keep existing behavior
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          const userId: string | undefined = user?.id;

          if (userId) {
            if (agent.id === "progress-tracker") {
              // Progress Tracker Agent -> create a sample weekly progress log
              void progressApi.create(userId, {
                period: "WEEKLY",
                periodStartDate: "2024-01-08",
                periodEndDate: "2024-01-14",
                tasksCompleted: 12,
                tasksTotal: 15,
                completionPercentage: 80,
                goalsProgress: 75.5,
                skillsImproved: 3,
                summary:
                  "Strong progress on system design. Completed 4 major topics. On track with all goals.",
              });
            } else if (agent.id === "hr-summary") {
              // HR Summary Agent -> create a sample monthly report
              void reportsApi.create(userId, {
                type: "MONTHLY",
                reportPeriodStart: "2024-01-01",
                reportPeriodEnd: "2024-01-31",
                title: "January 2024 Progress Review",
              });
            }
          }

          // Simulate progress for legacy agents (UI only)
          for (let i = 20; i <= 100; i += 20) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            setStatuses((prev) => ({
              ...prev,
              [agent.id]: { ...prev[agent.id], progress: i },
            }));
          }
        }
      } catch (e) {
        console.error(`Agent ${agent.id} API call failed:`, e);
        apiError = e instanceof Error ? e : new Error(String(e));
        const errorMessage = apiError?.message || "An error occurred";
        
        // Update status to show error
        setStatuses((prev) => ({
          ...prev,
          [agent.id]: { 
            ...prev[agent.id], 
            status: "error",
            progress: 0,
            output: errorMessage
          },
        }));

        // Notify parent component of the error
        if (onError) {
          onError(errorMessage, agent.id);
        }

        // Stop processing if it's one of the first 3 critical steps
        if (["skill-gap", "goal-planning", "daily-breakdown"].includes(agent.id)) {
          // Don't proceed to next agent if a critical step failed
          return;
        }
      }

      // Complete the step (if no error or if it's a legacy agent)
      if (!apiError || !["skill-gap", "goal-planning", "daily-breakdown"].includes(agent.id)) {
        setStatuses((prev) => ({
          ...prev,
          [agent.id]: { ...prev[agent.id], status: "complete", progress: 100 },
        }));

        setCurrentAgent(index + 1);
        setTimeout(() => processAgent(index + 1), 300);
      }
    };

    processAgent(0);
  }, [onComplete, onError]);

  return (
    <section className="min-h-screen flex items-center justify-center py-8 md:py-20 px-4">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="font-display text-2xl md:text-4xl font-bold mb-2 md:mb-4">
            {error ? "Error Generating Plan" : "AI Agents at Work"}
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground">
            {error ? "Failed to generate your growth plan" : "5 AI Agents are collaborating to create your growth plan"}
          </p>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="mb-4">{error}</AlertDescription>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm" className="mt-2">
                Retry
              </Button>
            )}
          </Alert>
        )}

        <div className="space-y-3 md:space-y-4">
          {agents.map((agent, index) => {
            const status = statuses[agent.id];
            const isActive = index === currentAgent;
            const isComplete = status.status === "complete";
            const hasError = status.status === "error";
            const Icon = agent.icon;

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card p-4 md:p-6 transition-all duration-500 ${
                  isActive ? "border-primary glow-effect" : ""
                } ${isComplete ? "border-primary/50" : ""} ${
                  hasError ? "border-destructive" : ""
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${
                      isComplete
                        ? "bg-primary/20"
                        : hasError
                        ? "bg-destructive/20"
                        : isActive
                        ? "bg-primary/10"
                        : "bg-secondary"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                    ) : hasError ? (
                      <AlertCircle className="w-6 h-6 md:w-7 md:h-7 text-destructive" />
                    ) : isActive ? (
                      <Loader2 className={`w-6 h-6 md:w-7 md:h-7 ${agent.color} animate-spin`} />
                    ) : (
                      <Icon className={`w-6 h-6 md:w-7 md:h-7 ${agent.color} opacity-50`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-base md:text-lg truncate">{agent.name}</h3>
                      {isComplete && (
                        <span className="text-xs text-primary font-medium shrink-0">
                          Complete
                        </span>
                      )}
                      {hasError && (
                        <span className="text-xs text-destructive font-medium shrink-0">
                          Error
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 break-words">
                      {hasError && status.output
                        ? status.output
                        : status.output || agent.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          hasError
                            ? "bg-destructive"
                            : "bg-gradient-to-r from-primary to-accent"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${status.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
