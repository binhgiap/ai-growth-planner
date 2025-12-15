import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowUpDown, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/types/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMembersListProps {
  members: TeamMember[];
  onViewMember: (memberId: string) => void;
}

export const TeamMembersList = ({ members, onViewMember }: TeamMembersListProps) => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "consistency" | "progress">("consistency");

  const departments = [...new Set(members.map(m => m.department))];

  const filteredMembers = members
    .filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchesDept = departmentFilter === "all" || m.department === departmentFilter;
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "consistency") {
        return (b.growthPlan?.consistencyScore || 0) - (a.growthPlan?.consistencyScore || 0);
      }
      if (sortBy === "progress") {
        const aProgress = a.growthPlan ? 
          a.growthPlan.dailyTasks.filter(t => t.completed).length / a.growthPlan.dailyTasks.length : 0;
        const bProgress = b.growthPlan ? 
          b.growthPlan.dailyTasks.filter(t => t.completed).length / b.growthPlan.dailyTasks.length : 0;
        return bProgress - aProgress;
      }
      return 0;
    });

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return "text-primary";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Team Members</h1>
        <p className="text-sm md:text-base text-muted-foreground">View and manage your team's growth plans</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm md:text-base"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consistency">Consistency Score</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4"
      >
        {filteredMembers.map((member, i) => {
          const progress = member.growthPlan ? 
            Math.round((member.growthPlan.dailyTasks.filter(t => t.completed).length / member.growthPlan.dailyTasks.length) * 100) : 0;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-3 md:p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <Avatar className="w-10 h-10 md:w-12 md:h-12 shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary font-medium text-xs md:text-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm md:text-base truncate">{member.name}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {member.department}
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {member.profile.role} • {member.profile.currentLevel} → {member.profile.targetLevel}
                  </p>
                  
                  {/* Mobile Stats */}
                  <div className="flex items-center gap-4 mt-2 md:hidden">
                    <div className="text-center">
                      <p className={`text-base font-bold ${getConsistencyColor(member.growthPlan?.consistencyScore || 0)}`}>
                        {member.growthPlan?.consistencyScore || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Consistency</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className={`text-xl font-bold ${getConsistencyColor(member.growthPlan?.consistencyScore || 0)}`}>
                      {member.growthPlan?.consistencyScore || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Consistency</p>
                  </div>

                  <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onViewMember(member.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No team members found matching your filters.</p>
        </div>
      )}
    </div>
  );
};
