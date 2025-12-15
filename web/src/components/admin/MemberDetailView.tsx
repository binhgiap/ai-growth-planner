import { useState } from "react";
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
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar 
} from "recharts";

interface MemberDetailViewProps {
  member: TeamMember;
  onBack: () => void;
}

export const MemberDetailView = ({ member, onBack }: MemberDetailViewProps) => {
  const [nftDialogOpen, setNftDialogOpen] = useState(false);
  const plan = member.growthPlan;
  
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
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

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
              <h1 className="font-display text-xl md:text-2xl font-bold break-words">{member.name}</h1>
              <Badge variant="secondary" className="text-xs">{member.department}</Badge>
            </div>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4 break-all">{member.email}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-0">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Current Role</p>
                <p className="font-medium text-sm md:text-base break-words">{member.profile.role}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Level</p>
                <p className="font-medium text-sm md:text-base">{member.profile.currentLevel} → {member.profile.targetLevel}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Daily Commitment</p>
                <p className="font-medium text-sm md:text-base">{member.profile.dailyTime}h/day</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Joined</p>
                <p className="font-medium text-sm md:text-base">{new Date(member.joinedAt).toLocaleDateString('en-US')}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4 w-full sm:w-auto sm:flex-col">
            <div className="text-center glass-card px-4 md:px-6 py-3 md:py-4 flex-1 sm:flex-initial">
              <p className="text-2xl md:text-4xl font-display font-bold text-primary">{plan.consistencyScore}%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Consistency Score</p>
            </div>
            <div 
              className="text-center glass-card px-4 md:px-6 py-3 md:py-4 cursor-pointer hover:bg-primary/10 transition-colors flex-1 sm:flex-initial"
              onClick={() => setNftDialogOpen(true)}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <p className="text-2xl md:text-4xl font-display font-bold text-primary">{member.nftCount}</p>
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
                {okr.keyResults.slice(0, 2).map((kr, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2" />
                    {kr}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
        nfts={member.nfts}
        memberName={member.name}
      />
    </div>
  );
};
