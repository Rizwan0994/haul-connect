import { Metadata } from "next";
import { RegisterForm } from "./register-form";
import { AuthTemplate } from "@/components/auth/auth-template";

export const metadata: Metadata = {
  title: "Register | Haul Connect BPO",
  description: "Create a new account for Haul Connect BPO",
};

export default function RegisterPage() {
  return (
    <AuthTemplate
      title="Join Haul Connect BPO"
      description="Create an account to get started with our platform"
    >
      <RegisterForm />
    </AuthTemplate>
  );
}
