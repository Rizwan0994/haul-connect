import { Metadata } from "next";
import { LoginForm } from "./login-form";
import { AuthTemplate } from "@/components/auth/auth-template";

export const metadata: Metadata = {
  title: "Login | Haul Connect BPO",
  description: "Login to your Haul Connect BPO account",
};

export default function LoginPage() {
  return (
    <AuthTemplate
      title="Welcome to Haul Connect BPO"
      description="Enter your credentials to access your account"
    >
      <LoginForm />
    </AuthTemplate>
  );
}
