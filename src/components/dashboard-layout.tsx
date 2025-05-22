import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <div className="sticky top-0 h-screen flex-shrink-0">
          <AppSidebar />
        </div>
        <div className="flex-grow overflow-auto pt-14 px-8">
          <main className="w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
