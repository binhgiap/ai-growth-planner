import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ApiStatus = () => {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);

  const checkApi = async () => {
    setStatus("checking");
    try {
      const response = await fetch(`${API_BASE_URL}/api`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setStatus("online");
      } else {
        setStatus("offline");
      }
    } catch (error) {
      console.error("API check failed:", error);
      setStatus("offline");
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkApi();
    const interval = setInterval(checkApi, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const statusColor =
    status === "checking"
      ? "bg-yellow-400"
      : status === "online"
      ? "bg-emerald-500"
      : "bg-red-500";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Small icon indicator */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full shadow-sm border-border/70 bg-background/80 backdrop-blur"
        onClick={() => setOpen(true)}
        title="API status"
      >
        <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
      </Button>

      {/* Expanded status popup */}
      {open && (
        <Card className="w-64 shadow-xl border border-border/80 bg-background/95 backdrop-blur">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">API Status</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={checkApi}
                className="h-7 w-7 p-0 text-xs"
                title="Refresh"
              >
                ↻
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-7 w-7 p-0 text-xs"
                title="Close"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status:</span>
                <Badge variant={status === "online" ? "default" : "destructive"}>
                  {status === "checking" ? "Checking..." : status === "online" ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Base URL:</span>
                <span className="text-xs font-mono truncate ml-2">{API_BASE_URL}</span>
              </div>
              {lastCheck && (
                <div className="text-xs text-muted-foreground">
                  Last check: {lastCheck.toLocaleTimeString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

