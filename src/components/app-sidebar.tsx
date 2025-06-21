"use client";

import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
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
  DollarSign,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { useNotifications } from "@/hooks/useNotifications";
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
import path from "path";

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
        title: "Carrier Approvals",
        path: "/carrier-management/approvals",
        requiresPermission: "carrier.approval.view",
      },
      {
        title: "Followup Sheets",
        path: "/carrier-management/followup-sheets",
        requiresPermission: "route.followup-sheets",
      },    ],
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
      {
        title: "Dispatch Approvals",
        path: "/dispatch-management/approvals",
        requiresPermission: "dispatch.approval.view",
      },
 {
        title: "All Contacts",
        path: "/contact-management",
        requiresPermission: "route.brokers",
      },
      {
        title: "Brokers",
        path: "/contact-management/brokers",
        requiresPermission: "route.brokers",
      },
      {
        title: "Shippers",
        path: "/contact-management/shippers",
        requiresPermission: "route.shippers",
      },
      {
        title: "Consignees",
        path: "/contact-management/consignees",
        requiresPermission: "route.consignees",
      },
    ],
  }, 

  {
    title: "Commission Management",
    isSection: true,
    icon: DollarSign,
    children: [
      {
        title: "Commissions",
        path: "/commission-management",
        requiresPermission: "route.commission-management",
      },    ],
  },
  {
    title: "Employee Attendance",    isSection: true,
    icon: Clock,
    children: [
      {
        title: "Attendance Records",
        path: "/employee-attendance",
        requiresPermission: "route.attendance-records",
      },
      {
        title: "Mark Attendance",
        path: "/employee-attendance/bulk",
        requiresPermission: "route.attendance-records",
      },
    ],
  },{
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
      },          {
        title: "Email Settings",
        path: "/settings/smtp",
        requiresPermission: "settings.smtp",
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
  const { unreadCount } = useNotifications();
  
  // State for managing collapsible sections
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionTitle: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionTitle)) {
      newCollapsed.delete(sectionTitle);
    } else {
      newCollapsed.add(sectionTitle);
    }
    setCollapsedSections(newCollapsed);
  };

  // Check if any children of a section have permission
  const hasVisibleChildren = (item: any): boolean => {
    if (!item.children) return false;
    
    return item.children.some((child: any) => {
      // Check role-based permission (legacy)
      if (child.requiresRole && currentUser && !child.requiresRole.includes(currentUser.category)) {
        return false;
      }
      
      // Check specific permission (new permission system)
      if (child.requiresPermission && !hasSpecificPermission(child.requiresPermission)) {
        return false;
      }
      
      return true;
    });
  };
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
      // Don't render section if no children have permission
      if (!hasVisibleChildren(item)) {
        return null;
      }

      const isCollapsed = collapsedSections.has(item.title);
      const ChevronIcon = isCollapsed ? ChevronRight : ChevronDown;

      return (        <div key={item.title} className="mb-1">
          <button
            onClick={() => toggleSection(item.title)}
            className="flex items-center justify-between w-full gap-2 px-2 py-1.5 text-xs uppercase tracking-wide font-medium text-gray-400 hover:text-gray-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              {item.icon && <item.icon className="h-3 w-3 flex-shrink-0" />}
              <span className="text-xs">{item.title}</span>
            </div>
            <ChevronIcon className="h-3 w-3 flex-shrink-0" />
          </button>
            {!isCollapsed && (
            <div className="mt-1 space-y-0.5 ml-1 list-none">
              {item.children.map((child: any) => renderMenuItem(child))}
            </div>
          )}
        </div>
      );
    }    const isActive = location.pathname === item.path;
    const isNotificationsItem = item.path === "/notifications";    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton
          onClick={() => navigate(item.path)}
          isActive={isActive}
          className={cn(
            "w-full justify-start gap-2 px-2 py-1.5 rounded-sm text-sm",
            "hover:bg-gray-700 hover:text-white",
            "data-[active=true]:bg-[#f29600] data-[active=true]:text-white",
            "transition-colors duration-150",
            "text-gray-300"
          )}
          tooltip={item.title}
        >
          {item.icon && <item.icon className="h-3.5 w-3.5 flex-shrink-0" />}
          <span className="text-sm font-normal truncate">{item.title}</span>
          {isNotificationsItem && unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] text-[10px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
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
    >      <SidebarHeader className="border-b border-gray-700 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f29600] text-white flex-shrink-0">
            <span className="text-sm font-bold">HC</span>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-sm font-semibold tracking-tight text-white truncate">
              Haul Connect
            </h2>
            {currentUser && (
              <p className="text-xs text-gray-400 truncate">
                {currentUser.firstName || currentUser.email}
              </p>
            )}
          </div>
        </div>
      </SidebarHeader>      <SidebarContent className="p-1 overflow-y-auto">
        <div className="space-y-1 list-none">
          {menuItems.map(renderMenuItem)}
        </div>
      </SidebarContent>      <SidebarFooter className="border-t border-gray-700 p-2">
        <div className="space-y-1 list-none">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate("/profile")}
              className="w-full justify-start gap-2 px-2 py-1.5 rounded-sm text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 list-none"
              tooltip="My Profile"
            >
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden truncate text-sm font-normal">
                My Profile
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="w-full justify-start gap-2 px-2 py-1.5 rounded-sm text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-150 list-none"
              tooltip="Logout"
            >
              <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden truncate text-sm font-normal">
                Logout
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}