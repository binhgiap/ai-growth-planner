import { TeamMember, TeamStats, DepartmentSummary, NFT } from "@/types/admin";
import { generateMockPlan } from "./mock-plan";

// Generate a mock blockchain hash
const generateBlockchainHash = (): string => {
  const chars = '0123456789abcdef';
  return '0x' + Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Generate NFTs based on achievements
const generateNFTs = (plan: any, memberName: string): NFT[] => {
  const nfts: NFT[] = [];
  const now = new Date();

  // OKR completion NFTs
  plan.okrs.forEach((okr: any, index: number) => {
    if (okr.progress >= 100) {
      nfts.push({
        id: `nft-okr-${index}`,
        name: `OKR Master - Month ${okr.month}`,
        description: `Completed all objectives for month ${okr.month}: ${okr.objective}`,
        type: "okr",
        earnedAt: new Date(now.getTime() - (6 - okr.month) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        blockchainHash: generateBlockchainHash(),
      });
      nfts.push({
        id: `nft-okr-bonus-${index}`,
        name: `Goal Achiever - Month ${okr.month}`,
        description: `Exceeded expectations in month ${okr.month}`,
        type: "okr",
        earnedAt: new Date(now.getTime() - (6 - okr.month) * 30 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000).toISOString(),
        blockchainHash: generateBlockchainHash(),
      });
    }
  });

  // Consistency NFTs
  if (plan.consistencyScore >= 80) {
    nfts.push({
      id: 'nft-consistency-80',
      name: 'Consistency Champion',
      description: 'Maintained 80%+ consistency score',
      type: "consistency",
      earnedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      blockchainHash: generateBlockchainHash(),
    });
    nfts.push({
      id: 'nft-consistency-90',
      name: 'Elite Performer',
      description: 'Achieved exceptional consistency',
      type: "consistency",
      earnedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      blockchainHash: generateBlockchainHash(),
    });
  } else if (plan.consistencyScore >= 70) {
    nfts.push({
      id: 'nft-consistency-70',
      name: 'Steady Progress',
      description: 'Maintained 70%+ consistency score',
      type: "consistency",
      earnedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      blockchainHash: generateBlockchainHash(),
    });
  }

  // Skill milestone NFTs
  plan.skills.forEach((skill: any, index: number) => {
    if (skill.currentLevel >= skill.targetLevel * 0.8) {
      nfts.push({
        id: `nft-skill-${index}`,
        name: `${skill.name} Expert`,
        description: `Reached ${Math.round((skill.currentLevel / skill.targetLevel) * 100)}% of target level in ${skill.name}`,
        type: "skill",
        earnedAt: new Date(now.getTime() - (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        blockchainHash: generateBlockchainHash(),
      });
    }
  });

  // Milestone NFTs
  const completedTasks = plan.dailyTasks.filter((t: any) => t.completed).length;
  if (completedTasks >= 100) {
    nfts.push({
      id: 'nft-milestone-100',
      name: 'Century Achiever',
      description: 'Completed 100+ tasks',
      type: "milestone",
      earnedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      blockchainHash: generateBlockchainHash(),
    });
  }
  if (completedTasks >= 50) {
    nfts.push({
      id: 'nft-milestone-50',
      name: 'Halfway Hero',
      description: 'Completed 50+ tasks',
      type: "milestone",
      earnedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      blockchainHash: generateBlockchainHash(),
    });
  }

  return nfts;
};

const departments = ["Engineering", "Product", "Design", "Marketing", "Sales"];
const roles = ["Frontend Developer", "Backend Developer", "Full-stack Developer", "Product Manager", "Designer", "Data Analyst"];
const levels = ["Junior", "Middle", "Senior", "Lead"];
const names = [
  "Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Cường", "Phạm Minh Dũng",
  "Hoàng Thị Em", "Vũ Đức Phong", "Đặng Thị Giang", "Bùi Quang Hải",
  "Ngô Thị Lan", "Đỗ Minh Khoa", "Trương Thị Linh", "Lý Văn Mạnh"
];

export const generateMockTeamMembers = (count: number = 12): TeamMember[] => {
  return names.slice(0, count).map((name, index) => {
    const profile = {
      role: roles[index % roles.length],
      currentLevel: levels[index % levels.length],
      dailyTime: Math.floor(Math.random() * 3) + 1,
      targetGoal: "Career advancement",
      targetLevel: levels[Math.min((index % levels.length) + 1, levels.length - 1)],
    };

    const plan = generateMockPlan(profile);
    // Simulate different progress levels
    const completedTasks = Math.floor(Math.random() * plan.dailyTasks.length * 0.7);
    plan.dailyTasks.slice(0, completedTasks).forEach(task => {
      task.completed = true;
    });
    plan.consistencyScore = Math.floor(Math.random() * 40) + 60;

    // Generate NFTs
    const nfts = generateNFTs(plan, name);
    const nftCount = nfts.length;

    return {
      id: `member-${index + 1}`,
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@company.com`,
      department: departments[index % departments.length],
      profile,
      growthPlan: plan,
      joinedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      nftCount,
      nfts,
    };
  });
};

export const generateTeamStats = (members: TeamMember[]): TeamStats => {
  const activeMembers = members.filter(m => 
    new Date(m.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const avgConsistency = members.reduce((acc, m) => 
    acc + (m.growthPlan?.consistencyScore || 0), 0
  ) / members.length;

  const completedGoals = members.reduce((acc, m) => {
    if (!m.growthPlan) return acc;
    return acc + m.growthPlan.okrs.filter(o => o.progress >= 100).length;
  }, 0);

  const totalGoals = members.reduce((acc, m) => 
    acc + (m.growthPlan?.okrs.length || 0), 0
  );

  const sortedByConsistency = [...members].sort((a, b) => 
    (b.growthPlan?.consistencyScore || 0) - (a.growthPlan?.consistencyScore || 0)
  );

  return {
    totalMembers: members.length,
    activeMembers: activeMembers.length,
    averageConsistency: Math.round(avgConsistency),
    completedGoals,
    totalGoals,
    topPerformers: sortedByConsistency.slice(0, 3),
    needsAttention: sortedByConsistency.slice(-3).reverse(),
  };
};

export const generateDepartmentSummaries = (members: TeamMember[]): DepartmentSummary[] => {
  const deptMap = new Map<string, TeamMember[]>();
  
  members.forEach(m => {
    const existing = deptMap.get(m.department) || [];
    deptMap.set(m.department, [...existing, m]);
  });

  return Array.from(deptMap.entries()).map(([name, deptMembers]) => {
    const avgProgress = deptMembers.reduce((acc, m) => {
      if (!m.growthPlan) return acc;
      const completed = m.growthPlan.dailyTasks.filter(t => t.completed).length;
      return acc + (completed / m.growthPlan.dailyTasks.length) * 100;
    }, 0) / deptMembers.length;

    const avgConsistency = deptMembers.reduce((acc, m) => 
      acc + (m.growthPlan?.consistencyScore || 0), 0
    ) / deptMembers.length;

    return {
      name,
      memberCount: deptMembers.length,
      avgProgress: Math.round(avgProgress),
      avgConsistency: Math.round(avgConsistency),
    };
  });
};
