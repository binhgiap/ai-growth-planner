import { useState, useEffect } from "react";
import { X, Copy, ExternalLink, Award, Target, TrendingUp, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { NFT } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";

interface UserNFTsViewProps {
  nfts: NFT[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getNFTIcon = (type: NFT["type"]) => {
  switch (type) {
    case "okr":
      return Target;
    case "consistency":
      return TrendingUp;
    case "skill":
      return Star;
    case "milestone":
      return Trophy;
    default:
      return Award;
  }
};

const getNFTColor = (type: NFT["type"]) => {
  switch (type) {
    case "okr":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "consistency":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "skill":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "milestone":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-primary/20 text-primary border-primary/30";
  }
};

export const UserNFTsView = ({ nfts, open, onOpenChange }: UserNFTsViewProps) => {
  const { toast } = useToast();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast({
      title: "Copied!",
      description: "Blockchain hash copied to clipboard",
    });
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleViewOnBlockchain = (hash: string) => {
    // Mock link - replace with actual blockchain explorer URL
    window.open(`https://etherscan.io/tx/${hash}`, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (nfts.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>My NFTs</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Award className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No NFTs Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Complete tasks, achieve goals, and maintain consistency to earn NFTs!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            My NFTs ({nfts.length})
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-120px)] px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nfts.map((nft) => {
              const Icon = getNFTIcon(nft.type);
              const colorClass = getNFTColor(nft.type);

              return (
                <div
                  key={nft.id}
                  className={`border rounded-lg p-4 ${colorClass} transition-all hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-semibold text-sm">{nft.name}</h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {nft.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{nft.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Earned: </span>
                      <span>{formatDate(nft.earnedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Blockchain Hash:</p>
                        <p className="text-xs font-mono truncate">{nft.blockchainHash}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 shrink-0"
                        onClick={() => handleCopyHash(nft.blockchainHash)}
                      >
                        <Copy className={`w-4 h-4 ${copiedHash === nft.blockchainHash ? "text-primary" : ""}`} />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleViewOnBlockchain(nft.blockchainHash)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View on Blockchain
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

