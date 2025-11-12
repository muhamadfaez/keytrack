import React from 'react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Notifications } from "./Notifications";
import { UserNav } from "./UserNav";
import { ThemeToggle } from '../ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
export function TopNavbar() {
  const isMobile = useIsMobile();
  return (
    <SidebarInset className="fixed top-0 right-0 left-0 z-40">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          {isMobile && <SidebarTrigger />}
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <Notifications />
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>
    </SidebarInset>
  );
}