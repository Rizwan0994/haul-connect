
"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { Truck, Package, FileText, Settings, Users, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Carrier Management",
    path: "/carrier-management",
    icon: Truck,
  },
  {
    title: "Dispatch Management", 
    path: "/dispatch-management",
    icon: Package,
  },
  {
    title: "Invoices",
    path: "/invoices",
    icon: FileText,
  },
  {
    title: "User Management",
    path: "/user-management",
    icon: Users,
    requiresRole: ['hr_manager', 'hr_user', 'admin_manager', 'admin_user', 'super_admin'],
  },
  {
    title: "Settings",
    path: "/settings/smtp",
    icon: Settings,
  },
];

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { state } = useSidebar();

  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiresRole && currentUser) {
      return item.requiresRole.includes(currentUser.category);
    }
    return true;
  });

  return (    <Sidebar
      className={cn(
        "border-r border-border bg-background",
        "fixed left-0 top-0 z-30",
        "h-screen w-[240px]",
        className
      )}
      collapsible="none"
      variant="sidebar"
    >      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[antiquewhite] text-slate-900 flex-shrink-0">
            <span className="text-lg font-bold">HC</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-foreground truncate">
              Haul Connect
            </h2>
            {currentUser && (
              <p className="text-xs text-muted-foreground truncate">
                {currentUser.firstName || currentUser.email}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu className="space-y-1.5">
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                onClick={() => navigate(item.path)}
                isActive={location.pathname === item.path}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5",
                  "hover:bg-accent hover:text-accent-foreground",
                  "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
                  "transition-colors duration-150"
                )}
                tooltip={item.title}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="w-full justify-start gap-3 px-3 py-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-colors duration-150"
              tooltip="Logout"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden truncate">
                Logout
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
