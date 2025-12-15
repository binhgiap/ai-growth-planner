import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ApiStatus = () => {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

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

  return (
    <Card className="fixed bottom-4 right-4 w-64 z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          API Status
          <Button variant="ghost" size="sm" onClick={checkApi} className="h-6 w-6 p-0">
            ↻
          </Button>
        </CardTitle>
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
  );
};

