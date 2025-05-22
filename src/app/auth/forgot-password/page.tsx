
import { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";
import { AuthTemplate } from "@/components/auth/auth-template";

export const metadata: Metadata = {
  title: "Forgot Password | Haul Connect BPO",
  description: "Reset your Haul Connect BPO account password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthTemplate
      title="Forgot your password?"
      description="No worries, we'll send you reset instructions"
      features={["Secure password recovery", "Quick account restoration"]}
    >
      <ForgotPasswordForm />
    </AuthTemplate>
  );
}
