import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Sparkles } from "lucide-react";
import { TeamMember } from "@/types/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NFTDetailsDialog } from "./NFTDetailsDialog";

interface LeaderboardProps {
  members: TeamMember[];
  onViewMember?: (memberId: string) => void;
}

export const Leaderboard = ({ members, onViewMember }: LeaderboardProps) => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [nftDialogOpen, setNftDialogOpen] = useState(false);
  
  // Sort members by NFT count (descending)
  const sortedMembers = [...members].sort((a, b) => b.nftCount - a.nftCount);

  const handleNFTClick = (e: React.MouseEvent, member: TeamMember) => {
    e.stopPropagation();
    setSelectedMember(member);
    setNftDialogOpen(true);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 0) return "bg-yellow-500 text-yellow-950";
    if (rank === 1) return "bg-gray-300 text-gray-700";
    if (rank === 2) return "bg-amber-600 text-amber-50";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary shrink-0" />
          <span className="truncate">NFT Leaderboard</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Top performers ranked by NFT achievements</p>
      </div>

      {/* Top 3 Podium */}
      {sortedMembers.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-2 md:mb-4">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-gray-300">
                <AvatarFallback className="bg-gray-100 text-gray-700 text-sm md:text-lg">
                  {sortedMembers[1].name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-bold text-xs md:text-sm">
                2
              </div>
            </div>
            <p className="font-semibold text-center mb-1 text-xs md:text-sm truncate w-full px-1">{sortedMembers[1].name}</p>
            <div 
              className="flex items-center gap-1 text-gray-400 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => handleNFTClick(e, sortedMembers[1])}
            >
              <Medal className="w-3 h-3 md:w-4 md:h-4" />
              <span className="font-bold text-sm md:text-base">{sortedMembers[1].nftCount}</span>
              <span className="text-xs">NFTs</span>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-2 md:mb-4">
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-3 md:border-4 border-yellow-500 shadow-lg">
                <AvatarFallback className="bg-yellow-100 text-yellow-700 text-base md:text-xl">
                  {sortedMembers[0].name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-500 text-yellow-950 flex items-center justify-center font-bold text-xs md:text-base">
                1
              </div>
              <Trophy className="absolute -bottom-1 md:-bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 md:w-6 md:h-6 text-yellow-500" />
            </div>
            <p className="font-bold text-sm md:text-lg text-center mb-1 truncate w-full px-1">{sortedMembers[0].name}</p>
            <div 
              className="flex items-center gap-1 text-yellow-500 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => handleNFTClick(e, sortedMembers[0])}
            >
              <Trophy className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-bold text-base md:text-lg">{sortedMembers[0].nftCount}</span>
              <span className="text-xs md:text-sm">NFTs</span>
            </div>
            <Badge variant="outline" className="mt-1 md:mt-2 text-xs">
              {sortedMembers[0].department}
            </Badge>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-2 md:mb-4">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-amber-600">
                <AvatarFallback className="bg-amber-100 text-amber-700 text-sm md:text-lg">
                  {sortedMembers[2].name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-600 text-amber-50 flex items-center justify-center font-bold text-xs md:text-sm">
                3
              </div>
            </div>
            <p className="font-semibold text-center mb-1 text-xs md:text-sm truncate w-full px-1">{sortedMembers[2].name}</p>
            <div 
              className="flex items-center gap-1 text-amber-600 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => handleNFTClick(e, sortedMembers[2])}
            >
              <Award className="w-3 h-3 md:w-4 md:h-4" />
              <span className="font-bold text-sm md:text-base">{sortedMembers[2].nftCount}</span>
              <span className="text-xs">NFTs</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <Card className="glass-card">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Complete Rankings</CardTitle>
          <CardDescription className="text-xs md:text-sm">All team members sorted by NFT count</CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <ScrollArea className="h-[300px] sm:h-[400px] pr-2 md:pr-4">
            <div className="space-y-2 md:space-y-3">
              {sortedMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-2 md:gap-4 p-2 md:p-4 rounded-lg border transition-all cursor-pointer hover:bg-secondary/50 ${
                    index < 3 ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                  }`}
                  onClick={() => onViewMember?.(member.id)}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 md:w-12 shrink-0">
                    {index < 3 ? (
                      <div className="w-5 h-5 md:w-6 md:h-6">
                        {getRankIcon(index)}
                      </div>
                    ) : (
                      <span className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${getRankBadge(index)}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-8 h-8 md:w-12 md:h-12 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm md:text-base truncate">{member.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{member.profile.role}</p>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {member.department}
                    </Badge>
                  </div>
                </div>

                {/* NFT Count */}
                <div 
                  className="flex items-center gap-1 md:gap-2 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                  onClick={(e) => handleNFTClick(e, member)}
                >
                  <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-primary" />
                  <div className="text-right">
                    <p className="font-bold text-sm md:text-lg text-primary">{member.nftCount}</p>
                    <p className="text-xs text-muted-foreground hidden sm:inline">NFTs</p>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* NFT Details Dialog */}
      {selectedMember && (
        <NFTDetailsDialog
          open={nftDialogOpen}
          onOpenChange={setNftDialogOpen}
          nfts={selectedMember.nfts}
          memberName={selectedMember.name}
        />
      )}
    </div>
  );
};

