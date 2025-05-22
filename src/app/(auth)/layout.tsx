
import { Metadata } from "next";
import { AuthTemplate } from "@/components/auth/auth-template";

export const metadata: Metadata = {
  title: "Authentication | Haul Connect BPO",
  description: "Authentication pages for Haul Connect BPO",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {children}
    </div>
  );
}
