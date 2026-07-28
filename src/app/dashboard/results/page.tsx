import { redirect } from "next/navigation";
import { CheckCircle2, Clock, FlaskConical } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ReportList } from "@/components/reports/ReportList";
import { CategoryGrid } from "@/components/results/CategoryGrid";
import { KIT_STATUS_COPY } from "@/lib/dashboard/kit-status";
import type { AnalysisCategory } from "@prisma/client";

export default async function ResultsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const kitStatus = user.box?.kitStatus ?? "NOT_REQUESTED";
  const ready = kitStatus === "RESULTS_READY";

  const reports = user.box
    ? await prisma.report.findMany({
        where: { boxId: user.box.id },
        orderBy: { version: "desc" },
      })
    : [];

  const categoryGroups = user.box
    ? await prisma.analysisResult.groupBy({
        by: ["category"],
        where: { boxId: user.box.id },
        _count: { _all: true },
      })
    : [];
  const categoryCounts = Object.fromEntries(
    categoryGroups.map((g) => [g.category, g._count._all])
  ) as Partial<Record<AnalysisCategory, number>>;
  const hasStructuredResults = categoryGroups.length > 0;

  return (
    <div>
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          Patient space
        </p>
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.6px] text-foreground">
          My Results
        </h1>
      </div>

      <Card className="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={`flex size-14 items-center justify-center rounded-2xl ${
              ready ? "bg-success-surface" : "bg-secondary"
            }`}
          >
            {ready ? (
              <CheckCircle2 size={28} strokeWidth={1.7} className="text-success" />
            ) : (
              <Clock size={28} strokeWidth={1.7} className="text-primary" />
            )}
          </div>

          {ready ? (
            <div>
              <h2 className="font-display text-lg font-extrabold text-foreground">
                Your results are ready
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm font-medium text-muted-foreground">
                Download your report below. Your laboratory will be in touch
                with next steps if needed.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-lg font-extrabold text-foreground">
                No results yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm font-medium text-muted-foreground">
                {KIT_STATUS_COPY[kitStatus]}. Your results will appear
                here as soon as testing is complete.
              </p>
            </div>
          )}

          {!ready && (
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-faint">
              <FlaskConical size={14} strokeWidth={1.8} />
              Track your box&apos;s progress from the dashboard
            </div>
          )}
        </div>

        {ready && !hasStructuredResults && (
          <div className="mt-6 border-t border-border pt-2">
            <ReportList reports={reports} showUploader={false} />
          </div>
        )}
      </Card>

      {ready && hasStructuredResults && (
        <div className="mt-6">
          <h2 className="mb-4 font-display text-lg font-extrabold text-foreground">
            Explore your results
          </h2>
          <CategoryGrid basePath="/dashboard/results" counts={categoryCounts} />

          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-primary">
              Original report PDF
            </summary>
            <Card className="mt-3 p-6">
              <ReportList reports={reports} showUploader={false} />
            </Card>
          </details>
        </div>
      )}
    </div>
  );
}
