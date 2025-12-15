import { NFT } from "@/types/admin";
import { GrowthPlan } from "@/types/growth-plan";

// Generate a mock blockchain hash
const generateBlockchainHash = (): string => {
  const chars = '0123456789abcdef';
  return '0x' + Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Generate NFTs based on user's growth plan achievements
export const generateUserNFTs = (plan: GrowthPlan): NFT[] => {
  const nfts: NFT[] = [];
  const now = new Date();

  // OKR completion NFTs
  plan.okrs.forEach((okr, index) => {
    if (okr.progress >= 100) {
      nfts.push({
        id: `nft-okr-${index}`,
        name: `OKR Master - Month ${okr.month}`,
        description: `Completed all objectives for month ${okr.month}: ${okr.objective}`,
        type: "okr",
        earnedAt: new Date(now.getTime() - (6 - okr.month) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        blockchainHash: generateBlockchainHash(),
      });
    }
  });

  // Consistency NFTs
  if (plan.consistencyScore >= 90) {
    nfts.push({
      id: 'nft-consistency-90',
      name: 'Elite Performer',
      description: 'Achieved exceptional consistency (90%+)',
      type: "consistency",
      earnedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      blockchainHash: generateBlockchainHash(),
    });
  } else if (plan.consistencyScore >= 80) {
    nfts.push({
      id: 'nft-consistency-80',
      name: 'Consistency Champion',
      description: 'Maintained 80%+ consistency score',
      type: "consistency",
      earnedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
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
  plan.skills.forEach((skill, index) => {
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
  const completedTasks = plan.dailyTasks.filter(t => t.completed).length;
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
  if (completedTasks >= 25) {
    nfts.push({
      id: 'nft-milestone-25',
      name: 'Quarter Master',
      description: 'Completed 25+ tasks',
      type: "milestone",
      earnedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      blockchainHash: generateBlockchainHash(),
    });
  }

  return nfts;
};

