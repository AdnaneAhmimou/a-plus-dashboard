import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | A-Plus Laboratory",
};

export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" subtitle="Sign in to track your DNA test">
      <LoginForm />
    </AuthCard>
  );
}
