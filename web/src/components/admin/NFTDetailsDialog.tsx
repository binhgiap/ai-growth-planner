import { useState } from "react";
import { Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NFT } from "@/types/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NFTDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nfts: NFT[];
  memberName: string;
}

export const NFTDetailsDialog = ({ open, onOpenChange, nfts, memberName }: NFTDetailsDialogProps) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            NFT Collection - {memberName}
          </DialogTitle>
          <DialogDescription>
            {nfts.length} NFT{nfts.length !== 1 ? "s" : ""} earned through achievements
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="grid md:grid-cols-2 gap-4">
            {nfts.map((nft) => (
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
                      // In a real app, this would open the blockchain explorer
                      window.open(
                        `https://etherscan.io/tx/${nft.blockchainHash}`,
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

