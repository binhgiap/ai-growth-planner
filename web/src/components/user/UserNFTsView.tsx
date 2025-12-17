import { useState, useEffect } from "react";
import { Copy, ExternalLink, Award, Target, TrendingUp, Star, Trophy, CheckCircle2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NFT } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";
import { usersApi } from "@/lib/api";

interface UserNFTsViewProps {
  nfts: NFT[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getNFTTypeColor = (type: NFT["type"]) => {
  switch (type) {
    case "okr":
      return "bg-blue-500/20 text-blue-500 border-blue-500/30";
    case "consistency":
      return "bg-green-500/20 text-green-500 border-green-500/30";
    case "skill":
      return "bg-purple-500/20 text-purple-500 border-purple-500/30";
    case "milestone":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getNFTTypeLabel = (type: NFT["type"]) => {
  switch (type) {
    case "okr":
      return "OKR Achievement";
    case "consistency":
      return "Consistency";
    case "skill":
      return "Skill Mastery";
    case "milestone":
      return "Milestone";
    default:
      return type;
  }
};

interface UserProfileData {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    currentRole: string;
    targetRole: string;
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

export const UserNFTsView = ({ nfts, open, onOpenChange }: UserNFTsViewProps) => {
  const { toast } = useToast();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast({
      title: "Copied!",
      description: "Blockchain hash copied to clipboard",
    });
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Fetch user profile data when dialog opens
  useEffect(() => {
    if (open) {
      const fetchProfileData = async () => {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.id;

        if (!userId) return;

        setIsLoadingProfile(true);
        try {
          const response = await usersApi.getProfile(userId);
          if (response?.success && response.data) {
            // The API returns { user, goals, tasksCount, progressLogs, nfts }
            // Cast through unknown to handle type mismatch
            setProfileData(response.data as unknown as UserProfileData);
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        } finally {
          setIsLoadingProfile(false);
        }
      };

      fetchProfileData();
    }
  }, [open]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Convert API NFTs to display format
  const apiNFTs = profileData?.nfts || [];
  const displayNFTs = apiNFTs.length > 0 
    ? apiNFTs.map((apiNft, index) => ({
        id: apiNft.tokenId || `nft-${index}`,
        name: apiNft.description || "Achievement NFT",
        description: apiNft.description || "Earned through completing goals",
        type: "okr" as const, // Default to okr type, could be derived from description
        earnedAt: apiNft.mintedAt ? new Date(apiNft.mintedAt).toISOString() : new Date().toISOString(),
        blockchainHash: apiNft.txHash || apiNft.tokenId || "",
      }))
    : [];

  // Combine passed NFTs with API NFTs (prioritize passed NFTs)
  const allNFTs = nfts.length > 0 ? nfts : displayNFTs;

  if (allNFTs.length === 0) {
    const totalGoals = profileData?.goals?.length || 0;
    const completedGoals = profileData?.goals?.filter(g => g.status === "COMPLETED").length || 0;
    const goalsWithNFTs = profileData?.goals?.filter(g => g.isMintedNft === true).length || 0;
    const tasksCount = profileData?.tasksCount || 0;
    const completedTasks = profileData?.progressLogs?.reduce((sum, log) => sum + (log.tasksCompleted || 0), 0) || 0;
    const totalTasksFromLogs = profileData?.progressLogs?.reduce((sum, log) => sum + (log.tasksTotal || 0), 0) || 0;
    const overallProgress = totalTasksFromLogs > 0 
      ? Math.round((completedTasks / totalTasksFromLogs) * 100)
      : 0;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>My NFTs</DialogTitle>
          </DialogHeader>
          {isLoadingProfile ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading your progress...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Award className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No NFTs Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Complete tasks, achieve goals, and maintain consistency to earn NFTs!
              </p>

              {/* Progress Stats */}
              {profileData && (
                <div className="w-full max-w-md space-y-4 mt-4">
                  {/* Goals Progress */}
                  <div className="glass-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-agent-goal" />
                        <span className="text-sm font-medium">Goals Progress</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {completedGoals} / {totalGoals} completed
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                        style={{ width: `${totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%` }}
                      />
                    </div>
                    {goalsWithNFTs > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {goalsWithNFTs} goal{goalsWithNFTs !== 1 ? 's' : ''} ready for NFT minting
                      </p>
                    )}
                  </div>

                  {/* Tasks Progress */}
                  {tasksCount > 0 && (
                    <div className="glass-card p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Tasks Completed</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {completedTasks} / {totalTasksFromLogs || tasksCount} tasks
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="glass-card p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold">{totalGoals}</p>
                      <p className="text-xs text-muted-foreground">Total Goals</p>
                    </div>
                    <div className="glass-card p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold">{completedGoals}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="glass-card p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold">{tasksCount}</p>
                      <p className="text-xs text-muted-foreground">Total Tasks</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            My NFTs
          </DialogTitle>
          <DialogDescription>
            {allNFTs.length} NFT{allNFTs.length !== 1 ? "s" : ""} earned through achievements
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="grid md:grid-cols-2 gap-4">
            {allNFTs.map((nft) => (
              <Card key={nft.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{nft.name}</CardTitle>
                      <Badge variant="outline" className={getNFTTypeColor(nft.type)}>
                        {getNFTTypeLabel(nft.type)}
                      </Badge>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{nft.description}</CardDescription>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Earned At</p>
                    <p className="text-sm">
                      {new Date(nft.earnedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Blockchain Hash</p>
                    <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                      <code className="text-xs font-mono flex-1 truncate">
                        {nft.blockchainHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(nft.blockchainHash)}
                      >
                        {copiedHash === nft.blockchainHash ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // Open Hedera HashScan explorer
                      window.open(
                        `https://hashscan.io/testnet/transaction/${nft.blockchainHash}`,
                        "_blank"
                      );
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Blockchain
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

