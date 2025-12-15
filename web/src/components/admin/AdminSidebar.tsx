import { useState } from "react";
import { 
  LayoutDashboard, Users, 
  LogOut, TrendingUp, Trophy
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  SidebarRail,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
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

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Team Members", url: "/admin/members", icon: Users },
  { title: "Leaderboard", url: "/admin/leaderboard", icon: Trophy },
];

interface AdminSidebarProps {
  onLogout: () => void;
  onNavigate?: () => void;
}

export const AdminSidebar = ({ onLogout, onNavigate }: AdminSidebarProps) => {
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const handleNavClick = () => {
    // Clear selected member when navigating to a different page
    // This allows Routes to be rendered so navigation can work
    onNavigate?.();
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    onLogout();
  };
  
  return (
    <Sidebar 
      collapsible="icon"
      className="border-r border-border/50 bg-card/70 backdrop-blur-xl"
    >
      <SidebarHeader className="p-4 border-b border-border/50 relative group-data-[collapsible=icon]:hidden">
        {/* Logo and Title - Hidden when collapsed */}
        <div className="flex items-center gap-3 transition-all duration-300 ease-in-out">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg gradient-text">Admin Portal</h2>
            <p className="text-xs text-muted-foreground">Team Management</p>
          </div>
        </div>
        
        {/* Trigger Button - Top Right Corner when expanded */}
        <div className="absolute top-4 right-4 group-data-[collapsible=icon]:hidden">
          <SidebarTrigger className="transition-all duration-300 ease-in-out" />
        </div>
      </SidebarHeader>

      <SidebarContent className="relative">
        <div className="relative z-10">
        {/* Trigger Button - Centered when collapsed, with divider */}
        <div className="hidden group-data-[collapsible=icon]:block">
          <SidebarGroup className="!p-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="flex justify-center p-2 w-full">
                    <SidebarTrigger className="!h-8 !w-8 !p-0 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80 transition-colors duration-200 cursor-pointer flex items-center justify-center relative z-10" />
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || (item.url === "/admin" && location.pathname === "/admin");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/admin"}
                        className="flex items-center gap-3"
                        onClick={handleNavClick}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 transition-all duration-300 ease-in-out" 
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden transition-all duration-300 ease-in-out opacity-100 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:overflow-hidden">Logout</span>
        </Button>
      </SidebarFooter>
      
      <SidebarRail />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to login again to access the admin portal.
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
    </Sidebar>
  );
};
