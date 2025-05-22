import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

export const metadata = {
  title: "Dispatch Management | Logistics & Carrier Management System",
  description: "Manage your dispatches, loads, and deliveries",
};

export default function DispatchManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
