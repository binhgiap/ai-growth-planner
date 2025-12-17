import { useState, useMemo, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { TeamMembersList } from "@/components/admin/TeamMembersList";
import { MemberDetailView } from "@/components/admin/MemberDetailView";
import { Leaderboard } from "@/components/admin/Leaderboard";
import { Button } from "@/components/ui/button";
import { 
  generateMockTeamMembers, 
  generateTeamStats, 
  generateDepartmentSummaries 
} from "@/data/mock-team";
import { usersApi, goalsApi, tasksApi } from "@/lib/api";
import { TeamMember, NFT } from "@/types/admin";

const AdminPortal = () => {
  const navigate = useNavigate();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setError(null);
      try {
        console.log("[API] Fetching users for admin portal");
        const response = await usersApi.findAll({ limit: 100, page: 1 });
        
        if (!response.success) {
          throw new Error("Failed to fetch users from API");
        }
        
        if (!response.data || response.data.length === 0) {
          throw new Error("No users found in the system");
        }
        
        // Convert API users to TeamMember format
        const apiMembers: TeamMember[] = await Promise.all(
          response.data.map(async (apiUser) => {
            // For each user, try to load their goals and tasks to calculate stats
            let growthPlan = null;
            
            // Map API NFTs to admin portal NFT format
            const mappedNFTs: NFT[] = (apiUser.nfts || []).map((apiNft) => {
              // Determine NFT type from description
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
            
            const nftCount = mappedNFTs.length;
            
            try {
              const [goalsRes, tasksRes] = await Promise.all([
                goalsApi.findByUser(apiUser.id).catch(() => null),
                tasksApi.findByUser(apiUser.id).catch(() => null),
              ]);
              
              const goals = goalsRes?.success ? goalsRes.data.data || [] : [];
              const tasks = tasksRes?.success ? tasksRes.data || [] : [];
              const completedTasks = tasks.filter(t => t.completed || t.status === "COMPLETED").length;
              
              // Growth plan would be loaded here if needed
              // For now, we'll keep it null and focus on NFTs
            } catch (error) {
              console.warn(`Failed to load data for user ${apiUser.id}:`, error);
              // Don't throw - continue with default values
            }
            
            return {
              id: apiUser.id,
              name: `${apiUser.firstName} ${apiUser.lastName}`.trim() || apiUser.email,
              email: apiUser.email,
              department: "Engineering", // Default, can be added to user model
              profile: {
                role: apiUser.currentRole || "",
                currentLevel: "Middle", // Default
                dailyTime: apiUser.hoursPerWeek ? apiUser.hoursPerWeek / 7 : 2,
                targetGoal: apiUser.targetRole || "",
                targetLevel: "Senior", // Default
              },
              growthPlan,
              joinedAt: apiUser.createdAt,
              lastActive: apiUser.updatedAt,
              nftCount,
              nfts: mappedNFTs, // Use NFTs from API
            };
          })
        );
        
        setMembers(apiMembers);
        console.log("🚀 ~ fetchUsers ~ apiMembers:", apiMembers)
      } catch (error: any) {
        // NO FALLBACK - Show error to user
        const errorMessage = error?.message || "Failed to load users. Please check your connection and try again.";
        console.error("Failed to fetch users from API:", error);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const stats = useMemo(() => generateTeamStats(members), [members]);
  const departments = useMemo(() => generateDepartmentSummaries(members), [members]);

  const handleViewMember = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  const handleBackFromMember = () => {
    setSelectedMemberId(null);
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    // Navigate back to home page
    navigate("/");
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Admin Portal</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar onLogout={handleLogout} onNavigate={handleBackFromMember} />
        
        <SidebarInset className="flex-1 overflow-auto">
          {/* Mobile trigger button */}
          <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/50 bg-card/50 backdrop-blur-xl px-4 md:hidden">
            <SidebarTrigger className="md:hidden" />
          </div>
          
          {selectedMember ? (
            <MemberDetailView 
              member={selectedMember} 
              onBack={handleBackFromMember} 
            />
          ) : (
            <Routes>
              <Route 
                index 
                element={
                  <AdminDashboard 
                    stats={stats} 
                    departments={departments}
                    onViewMember={handleViewMember}
                  />
                } 
              />
              <Route 
                path="members" 
                element={
                  <TeamMembersList 
                    members={members} 
                    onViewMember={handleViewMember}
                  />
                } 
              />
              <Route 
                path="leaderboard" 
                element={
                  <Leaderboard 
                    members={members} 
                    onViewMember={handleViewMember}
                  />
                } 
              />
            </Routes>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminPortal;
