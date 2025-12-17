import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UserDashboard from "./pages/user/UserDashboard";
import UserProfilePage from "./pages/user/UserProfilePage";
import AdminPortal from "./pages/AdminPortal";
import NotFound from "./pages/NotFound";
import { ApiStatus } from "@/components/debug/ApiStatus";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
          <Route path="/user" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      {/* API Status Debug Component - Remove in production */}
      {import.meta.env.DEV && <ApiStatus />}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
