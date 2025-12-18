import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Calendar, Target, TrendingUp, CheckCircle2, 
  Clock, Award, Brain, BarChart3, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/types/admin";
import { NFTDetailsDialog } from "./NFTDetailsDialog";
import { usersApi } from "@/lib/api";
import { loadPlanFromAPI } from "@/lib/utils/api-converters";
import { UserProfile } from "@/types/growth-plan";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from "recharts";

interface MemberDetailViewProps {
  member: TeamMember;
  onBack: () => void;
}

interface UserProfileData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    currentRole: string;
    targetRole: string;
    hoursPerWeek?: number;
  };
  goals: Array<{
    id: string;
    title: string;
    status: string;
    isMintedNft: boolean;
    progress: number;
  }>;
  tasksCount: number;
  progressLogs: Array<{
    tasksCompleted: number;
    tasksTotal: number;
    completionPercentage: number;
  }>;
  nfts: Array<{
    tokenId: string | null;
    contractAddress: string;
    txHash: string;
    description: string;
    userInfo: string;
    mintedAt: Date | null;
  }>;
}

export const MemberDetailView = ({ member, onBack }: MemberDetailViewProps) => {
  const [nftDialogOpen, setNftDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [refreshedMember, setRefreshedMember] = useState<TeamMember | null>(null);

  // Fetch user profile data when component mounts or member.id changes
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        console.log(`[Admin] Fetching profile for member: ${member.id}`);
        const response = await usersApi.getProfile(member.id);
        if (response.success && response.data) {
          const profile = response.data as unknown as UserProfileData;
          setProfileData(profile);
          
          console.log(`[Admin] Profile data received:`, {
            goals: profile.goals?.length || 0,
            tasksCount: profile.tasksCount || 0,
            nfts: profile.nfts?.length || 0,
          });

          // Create user profile for loading growth plan
          const userProfile: UserProfile = {
            role: profile.user.currentRole || "",
            currentLevel: "Middle", // Default
            dailyTime: profile.user.hoursPerWeek ? profile.user.hoursPerWeek / 7 : 2,
            targetGoal: profile.user.targetRole || "",
            targetLevel: "Senior", // Default
          };

          // Load growth plan from API (goals + tasks)
          console.log(`[Admin] Loading growth plan for member: ${member.id}`);
          const growthPlan = await loadPlanFromAPI(member.id, userProfile);
          
          if (growthPlan) {
            console.log(`[Admin] Growth plan loaded:`, {
              okrs: growthPlan.okrs.length,
              tasks: growthPlan.dailyTasks.length,
              completedTasks: growthPlan.dailyTasks.filter(t => t.completed).length,
              consistencyScore: growthPlan.consistencyScore,
            });
          } else {
            console.warn(`[Admin] No growth plan found for member: ${member.id}`);
          }

          // Map NFTs from profile
          const mappedNFTs = (profile.nfts || []).map((apiNft) => {
            let nftType: "okr" | "consistency" | "skill" | "milestone" = "okr";
            const descLower = apiNft.description.toLowerCase();
            if (descLower.includes("consistency")) {
              nftType = "consistency";
            } else if (descLower.includes("skill") || descLower.includes("master")) {
              nftType = "skill";
            } else if (descLower.includes("milestone")) {
              nftType = "milestone";
            }

            return {
              id: apiNft.tokenId || `nft-${apiNft.txHash.slice(0, 8)}`,
              name: apiNft.description || "Achievement NFT",
              description: apiNft.description || "Earned through completing goals",
              type: nftType,
              earnedAt: apiNft.mintedAt ? new Date(apiNft.mintedAt).toISOString() : new Date().toISOString(),
              blockchainHash: apiNft.txHash || apiNft.tokenId || "",
            };
          });

          // Update member with fresh data
          setRefreshedMember({
            ...member,
            name: `${profile.user.firstName} ${profile.user.lastName}`.trim() || profile.user.email,
            email: profile.user.email,
            profile: {
              role: profile.user.currentRole || "",
              currentLevel: "Middle",
              dailyTime: profile.user.hoursPerWeek ? profile.user.hoursPerWeek / 7 : 2,
              targetGoal: profile.user.targetRole || "",
              targetLevel: "Senior",
            },
            growthPlan,
            nftCount: mappedNFTs.length,
            nfts: mappedNFTs,
          });
        }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          // Try to load growth plan even if profile fetch fails
          try {
            const userProfile: UserProfile = {
              role: member.profile.role || "",
              currentLevel: member.profile.currentLevel || "Middle",
              dailyTime: member.profile.dailyTime || 2,
              targetGoal: member.profile.targetGoal || "",
              targetLevel: member.profile.targetLevel || "Senior",
            };
            const growthPlan = await loadPlanFromAPI(member.id, userProfile);
            if (growthPlan) {
              setRefreshedMember({
                ...member,
                growthPlan,
              });
            } else {
              setRefreshedMember(member);
            }
          } catch (planError) {
            console.error("Failed to load growth plan:", planError);
            // Fallback to original member data
            setRefreshedMember(member);
          }
        } finally {
          setIsLoadingProfile(false);
        }
      };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id]);

  // Use refreshed member data if available, otherwise fall back to original member
  const displayMember = member || refreshedMember;
  const plan = displayMember?.growthPlan;
  
  if (isLoadingProfile) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading member profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-muted-foreground">No growth plan available for this member.</p>
      </div>
    );
  }

  const completedTasks = plan.dailyTasks.filter(t => t.completed).length;
  const totalTasks = plan.dailyTasks.length;
  const progressPercent = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  // Generate weekly progress data
  const weeklyData = plan.weeklyPlans.slice(0, 8).map((week, i) => ({
    week: `W${i + 1}`,
    progress: Math.min(100, Math.round(Math.random() * 30 + 50 + i * 5)),
    consistency: Math.min(100, Math.round(Math.random() * 20 + 60 + i * 3)),
  }));

  // Skill radar data
  const skillData = plan.skills.map(skill => ({
    skill: skill.name,
    current: skill.currentLevel * 10,
    target: skill.targetLevel * 10,
  }));

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" onClick={onBack} size="sm" className="text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Member Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 md:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
          <Avatar className="w-16 h-16 md:w-20 md:h-20 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xl md:text-2xl font-bold">
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
              <h1 className="font-display text-xl md:text-2xl font-bold break-words">{displayMember.name}</h1>
              <Badge variant="secondary" className="text-xs">{displayMember.department}</Badge>
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 break-all">{displayMember.email}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-0">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Current Role</p>
                <p className="font-medium text-sm md:text-base break-words">{displayMember.profile.role}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Level</p>
                <p className="font-medium text-sm md:text-base">{displayMember.profile.currentLevel} → {displayMember.profile.targetLevel}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Daily Commitment</p>
                <p className="font-medium text-sm md:text-base">{typeof displayMember.profile.dailyTime === 'number' ? displayMember.profile.dailyTime.toFixed(2) : '0.00'}h/day</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Joined</p>
                <p className="font-medium text-sm md:text-base">{new Date(displayMember.joinedAt).toLocaleDateString('en-US')}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4 w-full sm:w-auto sm:flex-col">
            <div className="text-center glass-card px-4 md:px-6 py-3 md:py-4 flex-1 sm:flex-initial">
              <p className="text-2xl md:text-4xl font-display font-bold text-primary">{typeof plan.consistencyScore === 'number' ? plan.consistencyScore.toFixed(2) : '0.00'}%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Consistency Score</p>
            </div>
            <div 
              className="text-center glass-card px-4 md:px-6 py-3 md:py-4 cursor-pointer hover:bg-primary/10 transition-colors flex-1 sm:flex-initial"
              onClick={() => setNftDialogOpen(true)}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <p className="text-2xl md:text-4xl font-display font-bold text-primary">{displayMember.nftCount}</p>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">NFTs</p>
              <p className="text-xs text-primary mt-1 hover:underline">Click to view</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {[
          { label: "Tasks Completed", value: `${completedTasks}/${totalTasks}`, icon: CheckCircle2, color: "text-primary" },
          { label: "Overall Progress", value: `${progressPercent}%`, icon: TrendingUp, color: "text-agent-progress" },
          { label: "OKRs Active", value: plan.okrs.length, icon: Target, color: "text-agent-goal" },
          { label: "Skills Tracked", value: plan.skills.length, icon: Brain, color: "text-agent-skill" },
        ].map((stat, i) => (
          <div key={stat.label} className="glass-card p-3 md:p-4">
            <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color} mb-2`} />
            <p className="text-lg md:text-xl font-bold">{stat.value}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-agent-progress shrink-0" />
            <h2 className="font-display text-lg md:text-xl font-bold">Weekly Progress</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
                name="Progress"
              />
              <Line 
                type="monotone" 
                dataKey="consistency" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--accent))' }}
                name="Consistency"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Skills Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Brain className="w-4 h-4 md:w-5 md:h-5 text-agent-skill shrink-0" />
            <h2 className="font-display text-lg md:text-xl font-bold">Skill Development</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={skillData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(var(--border))" />
              <Radar 
                name="Current" 
                dataKey="current" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.3} 
              />
              <Radar 
                name="Target" 
                dataKey="target" 
                stroke="hsl(var(--accent))" 
                fill="hsl(var(--accent))" 
                fillOpacity={0.1} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

          {/* OKRs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-agent-goal shrink-0" />
              <h2 className="font-display text-lg md:text-xl font-bold">6-Month OKRs</h2>
            </div>

            {plan.okrs.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {plan.okrs.map((okr, i) => (
                  <div key={i} className="bg-secondary/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Month {okr.month}</Badge>
                      <span className="text-sm font-medium text-primary">{okr.progress}%</span>
                    </div>
                    <p className="font-medium">{okr.objective}</p>
                    <Progress value={okr.progress} className="h-2" />
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {okr.keyResults && okr.keyResults.length > 0 ? (
                        okr.keyResults.slice(0, 2).map((kr, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2" />
                            {kr}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-muted-foreground italic">No key results</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No OKRs available for this member.</p>
              </div>
            )}
      </motion.div>

          {/* HR Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-4 md:p-6"
          >
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Award className="w-4 h-4 md:w-5 md:h-5 text-agent-hr shrink-0" />
              <h2 className="font-display text-lg md:text-xl font-bold">HR Evaluation Summary</h2>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Strongest Skills</p>
            <div className="flex flex-wrap gap-2">
              {plan.skills.filter(s => s.priority === 'high').slice(0, 3).map(skill => (
                <Badge key={skill.name} className="bg-primary/20 text-primary hover:bg-primary/30">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Areas for Improvement</p>
            <div className="flex flex-wrap gap-2">
              {plan.skills.filter(s => s.priority === 'low').slice(0, 3).map(skill => (
                <Badge key={skill.name} variant="outline" className="border-orange-500/50 text-orange-500">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Promotion Recommendation</p>
            <div className={`flex items-center gap-2 ${plan.consistencyScore >= 80 ? 'text-primary' : 'text-muted-foreground'}`}>
              {plan.consistencyScore >= 80 ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Ready for advancement</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Developing - needs more time</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* NFT Details Dialog */}
      <NFTDetailsDialog
        open={nftDialogOpen}
        onOpenChange={setNftDialogOpen}
        nfts={displayMember.nfts}
        memberName={displayMember.name}
      />
    </div>
  );
};
