import React from 'react';
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { Notifications } from "./Notifications";
import { UserNav } from "./UserNav";
import { ThemeToggle } from '../ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
export function TopNavbar() {
  const { isCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  return (
    <header
      style={{ '--top-nav-height': '4rem' } as React.CSSProperties}
      className={cn(
        "fixed top-0 right-0 z-30 border-b bg-background/80 backdrop-blur-sm transition-all duration-300 ease-in-out",
        isMobile ? "left-0" : isCollapsed ? "left-16" : "left-72"
      )}
    >
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {isMobile && <Sidebar.Trigger />}
        <div className="flex-1" />
        <div className="flex items-center space-x-2">
          <Notifications />
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}