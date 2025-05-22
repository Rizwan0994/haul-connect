import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Haul Connect BPO",
  description: "Logistics & Carrier Management System",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen w-full p-0 m-0">{children}</div>;
}
