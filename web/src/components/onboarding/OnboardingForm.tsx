import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { UserProfile } from "@/types/growth-plan";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket, Briefcase, Target, Clock } from "lucide-react";

interface OnboardingFormProps {
  onSubmit: (profile: UserProfile) => void;
  onBack: () => void;
}

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "QA Engineer",
  "Mobile Developer",
];

const levels = ["Junior", "Middle", "Senior", "Lead", "Principal"];

export const OnboardingForm = ({ onSubmit, onBack }: OnboardingFormProps) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    role: "",
    currentLevel: "",
    dailyTime: 2,
    targetGoal: "",
    targetLevel: "",
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
    else onBack();
  };

  const handleSubmit = () => {
    onSubmit(profile);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profile.role && profile.currentLevel;
      case 2:
        return profile.targetLevel && profile.targetGoal;
      case 3:
        return profile.dailyTime > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const steps = [
    { icon: Briefcase, title: "Current Position" },
    { icon: Target, title: "Goals" },
    { icon: Clock, title: "Time" },
    { icon: Rocket, title: "Confirm" },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center py-8 md:py-20 px-4">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 md:mb-12 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center shrink-0">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  i + 1 <= step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all duration-300 ${
                    i + 1 < step ? "bg-primary" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 sm:p-6 md:p-8 lg:p-12"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                    Your Current Position
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Tell us about your current role
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={profile.role}
                      onValueChange={(value) =>
                        setProfile({ ...profile, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Current Level</Label>
                    <Select
                      value={profile.currentLevel}
                      onValueChange={(value) =>
                        setProfile({ ...profile, currentLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                    6-Month Goals
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    What do you want to achieve in the next 6 months?
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetLevel">Target Level</Label>
                    <Select
                      value={profile.targetLevel}
                      onValueChange={(value) =>
                        setProfile({ ...profile, targetLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Specific Goal</Label>
                    <Input
                      id="goal"
                      placeholder="E.g., Advance to Senior Developer"
                      value={profile.targetGoal}
                      onChange={(e) =>
                        setProfile({ ...profile, targetGoal: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                    Daily Learning Time
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    How many hours per day can you dedicate to development?
                  </p>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <div className="text-center">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-display font-bold gradient-text">
                      {profile.dailyTime}
                    </span>
                    <span className="text-xl sm:text-2xl text-muted-foreground ml-2">
                      hours/day
                    </span>
                  </div>

                  <Slider
                    value={[profile.dailyTime]}
                    onValueChange={(value) =>
                      setProfile({ ...profile, dailyTime: value[0] })
                    }
                    max={8}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>30 min</span>
                    <span>8 hours</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                    Confirm Information
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    AI will create your plan based on this information
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="glass-card p-4 flex justify-between items-center">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">{profile.role}</span>
                  </div>
                  <div className="glass-card p-4 flex justify-between items-center">
                    <span className="text-muted-foreground">Current Level</span>
                    <span className="font-medium">{profile.currentLevel}</span>
                  </div>
                  <div className="glass-card p-4 flex justify-between items-center">
                    <span className="text-muted-foreground">Target Level</span>
                    <span className="font-medium text-primary">
                      {profile.targetLevel}
                    </span>
                  </div>
                  <div className="glass-card p-4 flex justify-between items-center">
                    <span className="text-muted-foreground">Goal</span>
                    <span className="font-medium">{profile.targetGoal}</span>
                  </div>
                  <div className="glass-card p-4 flex justify-between items-center">
                    <span className="text-muted-foreground">Time/Day</span>
                    <span className="font-medium">{profile.dailyTime} hours</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between gap-2 mt-6 md:mt-10">
            <Button variant="ghost" onClick={handlePrev} className="flex-1 sm:flex-initial">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex-1 sm:flex-initial"
            >
              {step === 4 ? (
                <>
                  <span className="hidden sm:inline">Create Plan</span>
                  <span className="sm:hidden">Create</span>
                  <Rocket className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
