import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNavbar } from "./TopNavbar";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { UserProfile } from "@shared/types";
export function AppLayout(): JSX.Element {
  const { data: userProfile } = useApi<UserProfile>(['profile']);
  const location = useLocation();
  useEffect(() => {
    const pageTitle = location.pathname
      .split('/')
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard';
    const appName = userProfile?.appName || 'KeyTrack';
    document.title = `${appName} | ${pageTitle}`;
  }, [userProfile, location.pathname]);
  return (
    <SidebarProvider>
      <div className={cn("relative min-h-screen bg-background")}>
        <AppSidebar />
        <TopNavbar />
        <Sidebar.MainContent className="pt-16">
          <Outlet />
        </Sidebar.MainContent>
      </div>
    </SidebarProvider>
  );
}