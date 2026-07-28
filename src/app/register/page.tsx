import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | A-Plus Laboratory",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Register your DNA test kit online"
      className="max-w-lg"
    >
      <RegisterForm />
    </AuthCard>
  );
}
