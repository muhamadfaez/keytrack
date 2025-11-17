import React from "react";
import { useLocation } from "react-router-dom";
import { Home, KeyRound, Users, BarChart3, Settings, ClipboardCheck, KeySquare, History, DoorOpen } from "lucide-react";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { AppLogo } from "./layout/AppLogo";
import { useAuthStore } from "@/stores/authStore";
import { useApi } from "@/hooks/useApi";
import { UserProfile } from "@shared/types";
import { Skeleton } from "./ui/skeleton";
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
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { isCollapsed } = useSidebar();
  const { data: userProfile, isLoading } = useApi<UserProfile>(['profile']);
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
    </Sidebar.Root>
  );
}