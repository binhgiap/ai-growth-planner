import { useState, useEffect } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { AgentProcessing } from "@/components/dashboard/AgentProcessing";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { UserProfile, GrowthPlan } from "@/types/growth-plan";
import { generateMockPlan } from "@/data/mock-plan";
import { planningApi, tasksApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loadPlanFromAPI, persistPlanToAPI, convertApiPlanToGrowthPlan } from "@/lib/utils/api-converters";

type AppState = "landing" | "onboarding" | "processing" | "dashboard";

const getPlanStorageKey = (email: string) => `user_growth_plan_${email}`;

const UserDashboard = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for existing plan on mount - try API first, then localStorage
  useEffect(() => {
    const loadPlan = async () => {
      // Get current user
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.email) {
        setIsLoading(false);
        return;
      }

      const userId = user.id || "user-1";
      
      // Try to load from API first
      try {
        // We need userProfile to load plan, so check localStorage first for profile
        const planKey = getPlanStorageKey(user.email);
        const savedPlan = localStorage.getItem(planKey);
        
        if (savedPlan) {
          try {
            const plan: GrowthPlan = JSON.parse(savedPlan);
            // Verify plan belongs to current user
            if (plan.userId === userId || plan.userId === "user-1") {
              setGrowthPlan(plan);
              setUserProfile(plan.profile);
              setAppState("dashboard");
              
              // Try to sync with API in background
              try {
                const apiPlan = await loadPlanFromAPI(userId, plan.profile);
                if (apiPlan) {
                  // Merge API data with local data
                  setGrowthPlan(apiPlan);
                  localStorage.setItem(planKey, JSON.stringify(apiPlan));
                }
              } catch (error) {
                console.warn("Failed to sync with API:", error);
              }
            } else {
              // Plan belongs to different user, clear it
              localStorage.removeItem(planKey);
            }
          } catch (error) {
            console.error("Error loading saved plan:", error);
            localStorage.removeItem(planKey);
          }
        } else {
          // No local plan, try to load from API
          try {
            // We need profile, so we'll need to get it from user data or create default
            const defaultProfile: UserProfile = {
              role: user.currentRole || "",
              currentLevel: "",
              dailyTime: 2,
              targetGoal: user.targetRole || "",
              targetLevel: "",
            };
            
            const apiPlan = await loadPlanFromAPI(userId, defaultProfile);
            if (apiPlan) {
              setGrowthPlan(apiPlan);
              setUserProfile(apiPlan.profile);
              setAppState("dashboard");
              const planKey = getPlanStorageKey(user.email);
              localStorage.setItem(planKey, JSON.stringify(apiPlan));
            } else {
              // No plan found - user needs to create one
              // This is not an error, just no plan exists yet
            }
          } catch (error: unknown) {
            // Only log, don't show error - user just needs to create a plan
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.warn("Failed to load plan from API (user may not have a plan yet):", errorMessage);
          }
        }
      } catch (error) {
        console.error("Error in loadPlan:", error);
      }
      
      setIsLoading(false);
    };

    loadPlan();
  }, []);

  const handleGetStarted = () => {
    setAppState("onboarding");
  };

  const handleOnboardingSubmit = (profile: UserProfile) => {
    setUserProfile(profile);
    setAppState("processing");
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
        // Generate plan via API - NO FALLBACK TO MOCK
        console.log(`[API] Generating plan for user: ${userId}`);
        const apiResponse = await planningApi.generatePlan(userId);
        
        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(apiResponse.message || "Failed to generate plan. API returned unsuccessful response.");
        }
        
        // Convert API response to GrowthPlan format
        const plan = convertApiPlanToGrowthPlan(apiResponse.data, userProfile, userId);
        
        // Persist goals and tasks to API
        try {
          await persistPlanToAPI(userId, plan);
          // Also call the persist endpoint
          await planningApi.persistPlan(userId, apiResponse.data);
        } catch (persistError: unknown) {
          const persistErrorMsg = persistError instanceof Error ? persistError.message : "Failed to save plan to database";
          console.error("Failed to persist plan to API:", persistError);
          toast({
            title: "Warning",
            description: persistErrorMsg,
            variant: "destructive",
          });
          // Continue - plan is created but not persisted
        }
        
        // Save plan to localStorage using email as key
        const planKey = getPlanStorageKey(userEmail);
        localStorage.setItem(planKey, JSON.stringify(plan));
        setGrowthPlan(plan);
        setAppState("dashboard");
        
        toast({
          title: "Success",
          description: "Your 6-month growth plan has been generated successfully!",
        });
      } catch (error: unknown) {
        // NO FALLBACK - Show error to user
        const errorMessage = error instanceof Error ? error.message : "Failed to generate plan. Please check your connection and try again.";
        console.error("API plan generation failed:", error);
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
    
    // Save to localStorage
    const planKey = getPlanStorageKey(userEmail);
    localStorage.setItem(planKey, JSON.stringify(updatedPlan));

    // Try to update via API (non-blocking)
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
          onRetry={error ? () => {
            setError(null);
            handleProcessingComplete();
          } : undefined}
        />
      )}

      {appState === "dashboard" && growthPlan && (
        <DashboardOverview plan={growthPlan} onUpdateTask={handleUpdateTask} />
      )}
    </div>
  );
};

export default UserDashboard;
