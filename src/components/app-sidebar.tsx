
"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { Truck, Package, FileText, Settings, Users, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
    <Sidebar className="border-r">
      <SidebarContent className="gap-0">
        <div className="flex flex-col gap-2 p-2">
          <div className="px-2 py-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Haul Connect
            </h2>
            {currentUser && (
              <p className="text-xs text-muted-foreground">
                {currentUser.firstName || currentUser.email}
              </p>
            )}
          </div>
        </div>
        <SidebarMenu className="gap-2 px-2">
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                onClick={() => navigate(item.path)}
                isActive={location.pathname === item.path}
                className="w-full justify-start"
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="w-full justify-start text-destructive hover:text-destructive/90"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
