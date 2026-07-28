import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { KitStatusSection } from "@/components/dashboard/KitStatusSection";
import { isCourierConfigured } from "@/lib/courier/chrono-diali";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          Patient space
        </p>
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.6px] text-foreground">
          Hello, {user.firstName}
        </h1>
      </div>

      <KitStatusSection
        boxNumber={user.box?.number ?? null}
        kitStatus={user.box?.kitStatus ?? "NOT_REQUESTED"}
        hasAddress={Boolean(user.addressLine1 && user.city)}
        courierConfigured={isCourierConfigured()}
      />

      {user.box?.kitStatus === "RESULTS_READY" && (
        <Link
          href="/dashboard/results"
          className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
              <FileText size={20} strokeWidth={1.8} className="text-primary" />
            </div>
            <div>
              <div className="font-display text-[15px] font-extrabold text-foreground">
                Your results are ready
              </div>
              <div className="text-[13px] font-semibold text-muted-foreground">
                View your DNA test results
              </div>
            </div>
          </div>
          <ArrowRight size={18} className="text-faint" />
        </Link>
      )}
    </div>
  );
}
