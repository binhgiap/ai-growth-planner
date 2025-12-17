import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, UserCircle, Award } from "lucide-react";
import { NFT } from "@/types/admin";
import { GrowthPlan, UserProfile } from "@/types/growth-plan";
import { generateUserNFTs } from "@/lib/utils/nfts";
import { UserNFTsView } from "./UserNFTsView";
import { loadPlanFromAPI } from "@/lib/utils/api-converters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export const UserProfileMenu = () => {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showNFTsDialog, setShowNFTsDialog] = useState(false);
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Load user NFTs from API profile endpoint
  useEffect(() => {
    const loadNFTs = async () => {
      if (user?.id) {
        try {
          const { usersApi } = await import("@/lib/api");
          const response = await usersApi.getProfile(user.id);
          
          if (response?.success && response.data) {
            const profileData = response.data as unknown as {
              nfts: Array<{
                tokenId: string | null;
                contractAddress: string;
                txHash: string;
                description: string;
                userInfo: string;
                mintedAt: Date | null;
              }>;
            };
            
            // Convert API NFTs to display format
            const apiNFTs = profileData.nfts || [];
            const displayNFTs: NFT[] = apiNFTs.map((apiNft, index) => ({
              id: apiNft.tokenId || `nft-${index}`,
              name: apiNft.description || "Achievement NFT",
              description: apiNft.description || "Earned through completing goals",
              type: "okr" as const, // Default type, could be derived from description
              earnedAt: apiNft.mintedAt ? new Date(apiNft.mintedAt).toISOString() : new Date().toISOString(),
              blockchainHash: apiNft.txHash || apiNft.tokenId || "",
            }));
            
            setUserNFTs(displayNFTs);
          }
        } catch (error) {
          console.error("Error loading NFTs from API:", error);
          // Fallback: try to generate from plan if API fails
          try {
            const defaultProfile: UserProfile = {
              role: user.currentRole || "",
              currentLevel: "",
              dailyTime: 2,
              targetGoal: user.targetRole || "",
              targetLevel: "",
            };
            
            const plan = await loadPlanFromAPI(user.id, defaultProfile);
            if (plan) {
              const nfts = generateUserNFTs(plan);
              setUserNFTs(nfts);
            }
          } catch (fallbackError) {
            console.error("Error loading plan for NFTs:", fallbackError);
          }
        }
      }
    };
    
    loadNFTs();
  }, [user?.id]);

  const handleLogout = () => {
    // Remove auth information (plan data is in API, not localStorage)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowNFTsDialog(true)}>
          <Award className="mr-2 h-4 w-4" />
          <span>My NFTs</span>
          {userNFTs.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {userNFTs.length}
            </Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/user/profile")}>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? Your progress will be saved, but you will need to login again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NFTs Dialog */}
      <UserNFTsView
        nfts={userNFTs}
        open={showNFTsDialog}
        onOpenChange={setShowNFTsDialog}
      />
    </DropdownMenu>
  );
};

