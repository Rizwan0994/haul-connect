import { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";
import { AuthTemplate } from "@/components/auth/auth-template";

export const metadata: Metadata = {
  title: "Reset Password | Haul Connect BPO",
  description: "Reset your Haul Connect BPO account password",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const token = (await searchParams).token as string;

  return (
    <AuthTemplate
      title="Create new password"
      description="Enter a new password for your account"
      // Show less features for this simpler page
      features={["Secure password recovery", "Enhanced account protection"]}
    >
      <ResetPasswordForm token={token} />
    </AuthTemplate>
  );
}
