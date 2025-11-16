import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, KeyRound, Users, BarChart3, Settings, PanelLeft, PanelRight, Zap, ClipboardCheck } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { AppLogo } from "./layout/AppLogo";
import { useAuthStore } from "@/stores/authStore";
const navItems = [
  { href: "/", label: "Dashboard", icon: Home, adminOnly: false },
  { href: "/keys", label: "Key Inventory", icon: KeyRound, adminOnly: false },
  { href: "/personnel", label: "Personnel", icon: Users, adminOnly: false },
  { href: "/requests", label: "Key Requests", icon: ClipboardCheck, adminOnly: false },
  { href: "/reports", label: "Reports", icon: BarChart3, adminOnly: false },
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
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const isMobile = useIsMobile();
  const user = useAuthStore((state) => state.user);
  const filteredNavItems = navItems.filter(item => !item.adminOnly || user?.role === 'admin');
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5">
          <AppLogo className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold font-display tracking-tight group-data-[state=collapsed]:hidden">KeyTrack</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.href}
                tooltip={item.label}
              >
                <NavLink to={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {!isMobile && (
        <SidebarFooter className="flex flex-col items-start gap-4 border-t-0 p-4">
          <div className="w-full group-data-[state=collapsed]:hidden">
            <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
              <CardContent className="p-3 text-center">
                <Zap className="mx-auto h-6 w-6 text-primary mb-2" />
                <p className="text-sm font-semibold">Upgrade to PRO</p>
                <p className="text-xs text-muted-foreground mb-3">Unlock all features</p>
                <Button size="sm" className="w-full">Upgrade</Button>
              </CardContent>
            </Card>
          </div>
          <SidebarSeparator className="group-data-[state=collapsed]:hidden" />
          <div className="flex items-center justify-between w-full group-data-[state=collapsed]:justify-center">
            <NavLink to="/profile" className="flex items-center gap-2 rounded-md p-1 -m-1 hover:bg-accent transition-colors flex-1 min-w-0 group-data-[state=collapsed]:hidden">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
                <AvatarFallback>
                  {user ? getInitials(user.name) : <Skeleton className="h-8 w-8 rounded-full" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[state=collapsed]:hidden min-w-0">
                {!user ? (
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                  </>
                )}
              </div>
            </NavLink>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={toggleSidebar}
            >
              {isCollapsed ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}