import { motion } from "framer-motion";
import { 
  Users, TrendingUp, Target, AlertTriangle, 
  Award, Clock, BarChart3, ArrowUpRight 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TeamMember, TeamStats, DepartmentSummary } from "@/types/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminDashboardProps {
  stats: TeamStats;
  departments: DepartmentSummary[];
  onViewMember: (memberId: string) => void;
}

export const AdminDashboard = ({ stats, departments, onViewMember }: AdminDashboardProps) => {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Team Overview</h1>
        <p className="text-sm md:text-base text-muted-foreground">Monitor your team's growth journey</p>
      </div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {[
          { label: "Total Members", value: stats.totalMembers, icon: Users, color: "text-agent-skill" },
          { label: "Active This Week", value: stats.activeMembers, icon: Clock, color: "text-agent-daily" },
          { label: "Avg Consistency", value: `${stats.averageConsistency}%`, icon: TrendingUp, color: "text-agent-progress" },
          { label: "Goals Completed", value: `${stats.completedGoals}/${stats.totalGoals}`, icon: Target, color: "text-agent-goal" },
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

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 shrink-0" />
            <h2 className="font-display text-lg md:text-xl font-bold truncate">Top Performers</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {stats.topPerformers.map((member, i) => (
              <div 
                key={member.id}
                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                onClick={() => onViewMember(member.id)}
              >
                <div className="relative shrink-0">
                  <Avatar className="w-8 h-8 md:w-10 md:h-10">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs md:text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold ${
                    i === 0 ? 'bg-yellow-500 text-yellow-950' : 
                    i === 1 ? 'bg-gray-300 text-gray-700' : 
                    'bg-amber-600 text-amber-50'
                  }`}>
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm md:text-base truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.profile.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary text-sm md:text-base">{member.growthPlan?.consistencyScore}%</p>
                  <p className="text-xs text-muted-foreground hidden sm:inline">Consistency</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Needs Attention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-500 shrink-0" />
            <h2 className="font-display text-lg md:text-xl font-bold truncate">Needs Attention</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {stats.needsAttention.map((member) => (
              <div 
                key={member.id}
                className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                onClick={() => onViewMember(member.id)}
              >
                <Avatar className="w-8 h-8 md:w-10 md:h-10 shrink-0">
                  <AvatarFallback className="bg-orange-500/20 text-orange-500 text-xs md:text-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm md:text-base truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.profile.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-orange-500 text-sm md:text-base">{member.growthPlan?.consistencyScore}%</p>
                  <p className="text-xs text-muted-foreground hidden sm:inline">Consistency</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Department Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-agent-hr shrink-0" />
            <h2 className="font-display text-lg md:text-xl font-bold truncate">By Department</h2>
          </div>

          <div className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-sm text-muted-foreground">{dept.memberCount} members</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={dept.avgProgress} className="h-2 flex-1" />
                  <span className="text-sm font-medium w-12 text-right">{dept.avgProgress}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
