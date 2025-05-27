
"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { Truck, Package, FileText, Settings, Users, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
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

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiresRole && currentUser) {
      return item.requiresRole.includes(currentUser.category);
    }
    return true;
  });

  return (
    <Sidebar className="border-r shrink-0" collapsible="icon">
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center gap-2 px-2 py-2 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground shrink-0">
            <Menu className="h-4 w-4" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight truncate">
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
      
      <SidebarContent className="px-2 py-2">
        <SidebarMenu className="gap-1">
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                onClick={() => navigate(item.path)}
                isActive={location.pathname === item.path}
                className="w-full justify-start"
                tooltip={item.title}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden truncate">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              tooltip="Logout"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden truncate">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
