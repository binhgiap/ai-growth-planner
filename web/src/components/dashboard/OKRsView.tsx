import { motion } from "framer-motion";
import { ArrowLeft, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GrowthPlan } from "@/types/growth-plan";
import { UserProfileMenu } from "@/components/user/UserProfileMenu";

interface OKRsViewProps {
  plan: GrowthPlan;
  onBack: () => void;
}

export const OKRsView = ({ plan, onBack }: OKRsViewProps) => {
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
                <h1 className="font-display text-lg md:text-xl font-bold truncate">6-Month OKRs</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  Objectives and Key Results
                </p>
              </div>
            </div>
            <UserProfileMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 md:p-6 mb-6 md:mb-8"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl md:text-2xl font-bold break-words">{plan.profile.targetGoal}</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {plan.profile.currentLevel} → {plan.profile.targetLevel}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">
                {Math.round(plan.okrs.reduce((acc, okr) => acc + okr.progress, 0) / plan.okrs.length)}%
              </span>
            </div>
            <Progress 
              value={Math.round(plan.okrs.reduce((acc, okr) => acc + okr.progress, 0) / plan.okrs.length)} 
              className="h-3" 
            />
          </div>
        </motion.div>

        {/* OKRs Timeline */}
        <div className="space-y-4 md:space-y-6">
          {plan.okrs.map((okr, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 md:p-6"
            >
              <div className="flex items-start gap-3 md:gap-4">
                {/* Month Indicator */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                    okr.progress === 100 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary"
                  }`}>
                    <span className="font-display font-bold text-sm md:text-base">M{okr.month}</span>
                  </div>
                  {index < plan.okrs.length - 1 && (
                    <div className="w-0.5 h-12 md:h-16 bg-border mt-2" />
                  )}
                </div>

                {/* OKR Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2 md:mb-3 gap-2">
                    <h3 className="font-display text-base md:text-lg font-semibold">
                      Month {okr.month}
                    </h3>
                    <span className={`text-xs md:text-sm font-medium shrink-0 ${
                      okr.progress === 100 ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {okr.progress}%
                    </span>
                  </div>

                  {/* Objective */}
                  <div className="bg-secondary/50 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Objective</p>
                    <p className="font-medium text-sm md:text-base break-words">{okr.objective}</p>
                  </div>

                  {/* Key Results */}
                  <div className="space-y-2 md:space-y-3">
                    <p className="text-xs md:text-sm text-muted-foreground">Key Results:</p>
                    {okr.keyResults.map((kr, krIndex) => (
                      <div 
                        key={krIndex}
                        className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-card border border-border"
                      >
                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                          okr.progress > (krIndex + 1) * (100 / okr.keyResults.length)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}>
                          {okr.progress > (krIndex + 1) * (100 / okr.keyResults.length) && (
                            <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary-foreground" />
                          )}
                        </div>
                        <p className="text-xs md:text-sm flex-1 break-words">{kr}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <Progress value={okr.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};
