import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, KeyRound, Users, BarChart3, Settings, ClipboardCheck, KeySquare, History, DoorOpen, LogOut } from "lucide-react";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { AppLogo } from "./layout/AppLogo";
import { useAuthStore } from "@/stores/authStore";
import { useApi } from "@/hooks/useApi";
import { UserProfile } from "@shared/types";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
const navItems = [
  { href: "/", label: "Dashboard", icon: Home, adminOnly: false },
  { href: "/keys", label: "Key Inventory", icon: KeyRound, adminOnly: true },
  { href: "/my-keys", label: "My Keys", icon: KeySquare, adminOnly: false },
  { href: "/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/rooms", label: "Rooms", icon: DoorOpen, adminOnly: true },
  { href: "/requests", label: "Key Requests", icon: ClipboardCheck, adminOnly: false },
  { href: "/reports", label: "Reports", icon: BarChart3, adminOnly: true },
  { href: "/log", label: "Transaction Log", icon: History, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];
const getInitials = (name: string) => {
  if (!name) return 'AU';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isCollapsed } = useSidebar();
  const { data: userProfile, isLoading } = useApi<UserProfile>(['profile']);
  const handleLogout = () => {
    logout();
    toast.info("You have been logged out.");
    navigate('/login');
  };
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    // Business Rule: "My Keys" is a user-centric view and is not relevant for admins
    // who manage the entire inventory. Hiding it simplifies the admin interface.
    if (item.href === '/my-keys' && user?.role === 'admin') return false;
    return true;
  });
  return (
    <Sidebar.Root>
      <Sidebar.Header>
        <AppLogo className="h-10 w-10 text-primary" />
        {!isCollapsed && (
          <span className="ml-3 text-xl font-semibold font-display tracking-tight">
            {isLoading ? <Skeleton className="h-6 w-24" /> : (userProfile?.appName || 'KeyTrack')}
          </span>
        )}
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Menu>
          {filteredNavItems.map((item) => (
            <Sidebar.MenuItem
              key={item.href}
              tooltip={item.label}
              to={item.href}
              end={item.href === '/'}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Sidebar.MenuItem>
          ))}
        </Sidebar.Menu>
      </Sidebar.Content>
      <Sidebar.Footer>
        <Separator className="my-2" />
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-full" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>Log out</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{user ? getInitials(user.name) : '...'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 capitalize truncate">{user?.role}</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>Log out</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </Sidebar.Footer>
    </Sidebar.Root>
  );
}