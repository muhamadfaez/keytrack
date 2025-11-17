import React from "react";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNavbar } from "./TopNavbar";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider>
      <div className={cn("relative min-h-screen bg-background", className)}>
        <AppSidebar />
        <TopNavbar />
        <Sidebar.MainContent className="pt-16">
          {container ? (
            <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12", contentClassName)}>
              {children}
            </div>
          ) : (
            children
          )}
        </Sidebar.MainContent>
      </div>
    </SidebarProvider>
  );
}