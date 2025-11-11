import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, KeyRound, Users, BarChart3, Settings, Lock, PanelLeft, PanelRight } from "lucide-react";
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
const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/keys", label: "Key Inventory", icon: KeyRound },
  { href: "/personnel", label: "Personnel", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold font-display tracking-tight group-data-[state=collapsed]:hidden">Keystone Access</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
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
      <SidebarFooter className="flex flex-col items-start gap-2 border-t border-sidebar-border p-2">
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
              <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}