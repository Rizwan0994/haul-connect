"use client";

import { useNavigate, useLocation } from "react-router-dom";
import {
  Truck,
  Package,
  FileText,
  Settings,
  Users,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Plus,
  Search,
  Bell,
  User,
} from "lucide-react";
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
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    requiresPermission: "route.dashboard",
  },
        {
        title: "Notifications",
        path: "/notifications",
        icon: Bell,
        requiresPermission: "notifications.view",
      },
  // {
  //   title: "Messages",
  //   path: "/messages",
  //   icon: MessageSquare,
  //   requiresPermission: "route.messages",
  // },
  {
    title: "Calendar",
    path: "/calendar",
    icon: Calendar,
    requiresPermission: "route.calendar",
  },
  {
    title: "Carrier Management",
    isSection: true,
    icon: Truck, // Keep icon for section title if desired, or remove if only for menu items
    children: [
      {
        title: "Carrier Profiles",
        path: "/carrier-management",
        requiresPermission: "route.carrier-profiles",
      },
      // {
      //   title: "Add New Carrier",
      //   path: "/carrier-management/create",
      //   requiresPermission: "route.add-carrier",
      // },
      {
        title: "Followup Sheets",
        path: "/carrier-management/followup-sheets",
        requiresPermission: "route.followup-sheets",
      },
    ],
  },
  {
    title: "Dispatch Management",
    isSection: true,
    icon: Package, // Keep icon for section title if desired
    children: [
      {
        title: "Active Dispatches",
        path: "/dispatch-management/",
        requiresPermission: "route.active-dispatches",
      },
      // {
      //   title: "Create Dispatch",
      //   path: "/dispatch-management/new",
      //   icon: Plus, // Icon for specific menu item
      //   requiresPermission: "route.create-dispatch",
      // },
    ],
  },  {
    title: "Invoices",
    path: "/invoices",
    icon: FileText,
    requiresPermission: "route.invoices",
  },
  {
    title: "Settings",
    isSection: true,
    icon: Settings, // Keep icon for section title if desired
    children: [
      {
        title: "User Management",
        path: "/user-management",
        requiresPermission: "route.user-management",
        // requiresRole: ['Admin', 'Manager', 'Super Admin'],
      },
       {
        title: "Permissions",
        path: "/settings/permissions",
        requiresPermission: "permissions.manage",
      },
        {
        title: "Notification Management",
        path: "/admin/notifications",
        // icon: Bell,
        requiresPermission: "notifications.manage",
      },
          {
        title: "Email Settings",
        path: "/settings/smtp",
        requiresPermission: "route.email-settings",
      }, 
      

      // {
      //   title: "Search",
      //   path: "/settings/search",
      //   icon: Search, // Icon for specific menu item
      // },
    ],
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
  const { hasSpecificPermission } = useAuth();

  const renderMenuItem = (item: any) => {
    // Check role-based permission (legacy)
    if (item.requiresRole && currentUser && !item.requiresRole.includes(currentUser.category)) {
      return null;
    }
    
    // Check specific permission (new permission system)
    if (item.requiresPermission && !hasSpecificPermission(item.requiresPermission)) {
      return null;
    }

    if (item.children) {
      return (
        <div key={item.title} className="mb-4">
          <div className="flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-wider font-bold text-gray-400 border-b border-gray-700 pb-2 mb-2">
            {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
            <span>{item.title}</span>
          </div>
          <SidebarMenu className="space-y-1">
            {item.children.map((child: any) => renderMenuItem(child))}
          </SidebarMenu>
        </div>
      );
    }

    const isActive = location.pathname === item.path;

    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton
          onClick={() => navigate(item.path)}
          isActive={isActive}
          className={cn(
            "w-full justify-start gap-3 px-3 py-2.5 rounded-md", // Added rounded-md
            "hover:bg-gray-700 hover:text-white", // Adjusted hover for dark theme
            "data-[active=true]:bg-[#f29600] data-[active=true]:text-white", // Stronger active state
            "transition-colors duration-150 relative", // Added relative for potential absolute elements
           isActive && "before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-white before:rounded-l-sm"

          )}
          tooltip={item.title}
        >
          {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
          <span className="font-medium">{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      className={cn(
        "border-r border-border text-white", // Darker background, white text
        "fixed left-0 top-0 z-30",
        "h-screen w-[240px]",
        className
      )}
      collapsible="none"
      variant="sidebar"
    >
      <SidebarHeader className="border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f29600] text-white flex-shrink-0">
            <span className="text-lg font-bold">HC</span>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-white truncate">
              Haul Connect
            </h2>
            {currentUser && (
              <p className="text-xs text-gray-400 truncate">
                {currentUser.firstName || currentUser.email}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 overflow-y-auto">
        <SidebarMenu className="space-y-1.5">
          {menuItems.map(renderMenuItem)}
        </SidebarMenu>
      </SidebarContent>      <SidebarFooter className="border-t border-gray-700 p-3">
        <SidebarMenu className="space-y-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate("/profile")}
              className="w-full justify-start gap-3 px-3 py-2 rounded-md text-white hover:bg-gray-700 transition-colors duration-150"
              tooltip="My Profile"
            >
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden truncate">
                My Profile
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="w-full justify-start gap-3 px-3 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-150" // Adjusted logout styling
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