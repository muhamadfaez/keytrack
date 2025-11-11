import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, KeyRound, Users, BarChart3, Settings, Lock } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
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
  return (
    <Sidebar>
      <SidebarRail />
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold font-display tracking-tight">Keystone Access</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href}>
                <NavLink to={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex items-center justify-between border-t border-sidebar-border p-2">
        <p className="text-xs text-muted-foreground px-2 group-data-[collapsible=icon]:hidden">
          Built with ❤️ at Cloudflare
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}