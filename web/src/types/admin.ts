import { GrowthPlan, UserProfile } from "./growth-plan";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  profile: UserProfile;
  growthPlan: GrowthPlan | null;
  joinedAt: string;
  lastActive: string;
  nftCount: number;
  nfts: NFT[];
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  averageConsistency: number;
  completedGoals: number;
  totalGoals: number;
  topPerformers: TeamMember[];
  needsAttention: TeamMember[];
}

export interface DepartmentSummary {
  name: string;
  memberCount: number;
  avgProgress: number;
  avgConsistency: number;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  type: "okr" | "consistency" | "skill" | "milestone";
  earnedAt: string;
  blockchainHash: string;
  imageUrl?: string;
}
