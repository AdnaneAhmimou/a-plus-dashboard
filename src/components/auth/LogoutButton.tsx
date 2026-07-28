"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton({
  variant = "default",
  children,
}: {
  variant?: "default" | "icon";
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        disabled={loading}
        aria-label="Sign out"
        title="Sign out"
      >
        {loading ? <Loader2 className="animate-spin" /> : children}
      </Button>
    );
  }

  return (
    <Button variant="secondary" onClick={handleLogout} disabled={loading}>
      {loading && <Loader2 className="animate-spin" />}
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
