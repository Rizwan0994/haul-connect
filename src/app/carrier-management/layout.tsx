import { DashboardLayout } from "@/components/dashboard-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carrier Management",
  description: "Manage carrier profiles, insurance information, and more",
};

export default function CarrierManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
