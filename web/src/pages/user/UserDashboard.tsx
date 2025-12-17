import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection } from "@/components/landing/HeroSection";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { AgentProcessing } from "@/components/dashboard/AgentProcessing";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { UserProfile, GrowthPlan } from "@/types/growth-plan";
import { tasksApi, goalsApi, usersApi, planningApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loadPlanFromAPI, persistPlanToAPI, convertApiPlanToGrowthPlan } from "@/lib/utils/api-converters";

type AppState = "landing" | "onboarding" | "processing" | "dashboard";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>("landing");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ currentRole: string; targetRole: string; currentLevel?: string; targetLevel?: string } | null>(null);
  const { toast } = useToast();
  const hasCheckedGoals = useRef(false);

  // Load plan from API only (no localStorage)
  useEffect(() => {
    // Prevent multiple calls
    if (hasCheckedGoals.current) {
      return;
    }
    hasCheckedGoals.current = true;

    const loadPlan = async () => {
      // Get current user
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.id) {
        // Not authenticated, redirect will be handled by ProtectedRoute
        setIsLoading(false);
        return;
      }

      const userId = user.id;
      
      // Check goals first - if not available, show landing page
      try {
        const goalsResponse = await goalsApi.findByUser(userId);
        const goals = goalsResponse?.data;
        
        // Check if goals is not an array or is an empty array
        if (!Array.isArray(goals) || goals.length === 0) {
          // No goals available - show landing page
          setAppState("landing");
          setIsLoading(false);
          return;
        }
      } catch (error) {
        // If fetching goals fails, show landing page
        console.warn("Failed to fetch goals:", error);
        setAppState("landing");
        setIsLoading(false);
        return;
      }

      // Fetch user profile info for header display
      try {
        const profileResponse = await usersApi.getProfile(userId);
        if (profileResponse?.data) {
          setUserInfo({
            currentRole: profileResponse.data.currentRole || "",
            targetRole: profileResponse.data.targetRole || "",
            currentLevel: "", // Can be added if available in API
            targetLevel: "", // Can be added if available in API
          });
        }
      } catch (error) {
        console.warn("Failed to fetch user profile:", error);
        // Fallback to localStorage user data
        setUserInfo({
          currentRole: user.currentRole || "",
          targetRole: user.targetRole || "",
        });
      }
      
      try {
        // Create default profile from user data
        const defaultProfile: UserProfile = {
          role: user.currentRole || "",
          currentLevel: "",
          dailyTime: 2,
          targetGoal: user.targetRole || "",
          targetLevel: "",
        };
        
        // Try to load plan from API
        const apiPlan = await loadPlanFromAPI(userId, defaultProfile);
        if (apiPlan && (apiPlan.okrs.length > 0 || apiPlan.dailyTasks.length > 0)) {
          // User has plan data with actual content - show dashboard
          setGrowthPlan(apiPlan);
          setUserProfile(apiPlan.profile);
          setAppState("dashboard");
        } else {
          // No plan found or plan is empty - show landing page for user to create a plan
          setAppState("landing");
        }
      } catch (error: unknown) {
        // Only log, don't show error - user just needs to create a plan
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.warn("Failed to load plan from API (user may not have a plan yet):", errorMessage);
        // Show landing page so user can create a plan
        setAppState("landing");
      }
      
      setIsLoading(false);
    };

    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetStarted = () => {
    setAppState("onboarding");
  };

  const handleOnboardingSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
    setAppState("processing");
  };

  const handleProcessingError = (error: string, agentId: string) => {
    setError(`Failed at ${agentId}: ${error}`);
    // Stop processing - stay on processing screen to show error
  };

  const handleProcessingComplete = async () => {
    if (userProfile) {
      // Get current user
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || "user-1";
      const userEmail = user?.email || "";

      if (!userEmail) {
        setError("User email not found. Please log in again.");
        return;
      }

      setError(null);

      try {
        // Load the plan that was generated by the agents (skill-gap, goals, daily tasks, etc.)
        console.log(`[API] Loading generated plan for user: ${userId}`);
        const apiPlan = await loadPlanFromAPI(userId, userProfile);

        if (!apiPlan) {
          throw new Error("Failed to load generated plan from server. Please try again.");
        }

        setGrowthPlan(apiPlan);
        setAppState("dashboard");

        toast({
          title: "Success",
          description: "Your 6-month growth plan has been generated successfully!",
        });
      } catch (error: unknown) {
        // NO FALLBACK - Show error to user
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load generated plan. Please check your connection and try again.";
        console.error("Loading plan from API failed:", error);
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        // Don't change appState - stay on processing screen so user can see error
      }
    }
  };

  const handleUpdateTask = async (taskId: string, completed: boolean) => {
    if (!growthPlan) return;

    // Get current user
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || "user-1";
    const userEmail = user?.email || "";
    
    if (!userEmail) {
      console.error("User email not found");
      return;
    }

    // Update local state immediately for better UX
    const updatedPlan = {
      ...growthPlan,
      dailyTasks: growthPlan.dailyTasks.map((task) =>
        task.id === taskId ? { ...task, completed } : task
      ),
    };
    
    // Recalculate consistency score
    const completedTasks = updatedPlan.dailyTasks.filter((t) => t.completed).length;
    const totalTasks = updatedPlan.dailyTasks.length;
    const progressPercent = (completedTasks / totalTasks) * 100;
    updatedPlan.consistencyScore = Math.max(60, 100 - (100 - progressPercent) * 0.4);
    
    setGrowthPlan(updatedPlan);
    
    // Update via API (non-blocking)
    try {
      const task = growthPlan.dailyTasks.find(t => t.id === taskId);
      if (task) {
        // Check if task ID looks like an API ID (UUID format) or is a local ID
        const isApiId = taskId.includes('-') && taskId.length > 10;
        
        if (isApiId) {
          // Task exists in API, update it
          if (completed) {
            await tasksApi.completeTask(taskId, userId);
          } else {
            await tasksApi.update(taskId, userId, {
              status: 'NOT_STARTED',
              completionPercentage: 0,
            });
          }
        } else {
          // Local task, try to find or create in API
          // For now, we'll just log - in production, you'd want to create the task
          console.log("Local task updated, would sync to API on next save");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.warn("Failed to update task via API:", errorMessage);
      // Don't show error to user as local state is already updated
    }
  };

  // Show loading state while checking for existing plan
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {appState === "landing" && (
        <HeroSection onGetStarted={handleGetStarted} />
      )}

      {appState === "onboarding" && (
        <OnboardingForm
          onSubmit={handleOnboardingSubmit}
          onBack={() => setAppState("landing")}
        />
      )}

      {appState === "processing" && (
        <AgentProcessing 
          onComplete={handleProcessingComplete} 
          error={error}
          onRetry={error ? async () => {
            try {
              // Always call cancel API
              await planningApi.cancel().catch(err => {
                // Log error but continue - we'll navigate to landing page anyway
                console.warn("Cancel API call failed (may not exist yet):", err);
              });
            } catch (error) {
              // Ignore errors - we'll navigate to landing page anyway
              console.warn("Error calling cancel API:", error);
            }

            // Always navigate to landing page regardless of cancel success/failure
            setError(null);
            setAppState("landing");
          } : undefined}
          onError={handleProcessingError}
        />
      )}

      {appState === "dashboard" && growthPlan && (
        <DashboardOverview plan={growthPlan} onUpdateTask={handleUpdateTask} userInfo={userInfo} />
      )}
    </div>
  );
};

export default UserDashboard;
