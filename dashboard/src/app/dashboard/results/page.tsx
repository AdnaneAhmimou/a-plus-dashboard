import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Clock, FlaskConical } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ReportList } from "@/components/reports/ReportList";
import { CategoryGrid } from "@/components/results/CategoryGrid";
import { ResultsSummary } from "@/components/results/ResultsSummary";
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
  // The ancestry profile lives in its own table (one row per box), so it
  // isn't in the groupBy above; surface it as a single "analysis".
  const ancestryProfile = user.box
    ? await prisma.ancestryProfile.findUnique({
        where: { boxId: user.box.id },
        select: { id: true },
      })
    : null;
  if (ancestryProfile) categoryCounts.ANCESTRY = 1;
  const hasStructuredResults = categoryGroups.length > 0 || Boolean(ancestryProfile);
  const totalAnalyses = Object.values(categoryCounts).reduce((n, c) => n + (c ?? 0), 0);
  const latestReport = reports[0];
  const t = await getTranslations("results");
  const nav = await getTranslations("nav");

  return (
    <div>
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          {nav("patientSpace")}
        </p>
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.6px] text-foreground">
          {t("title")}
        </h1>
      </div>

      {/* The "your results are ready" panel only appears when there is
          nothing else to show. Once results exist it is replaced by the
          summary, which says what the patient has rather than that they
          have it. */}
      {(!ready || !hasStructuredResults) && (
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className={`flex size-14 items-center justify-center rounded-2xl ${
                ready ? "bg-success-surface" : "bg-secondary"
              }`}
            >
              <Clock size={28} strokeWidth={1.7} className={ready ? "text-success" : "text-primary"} />
            </div>

            <div>
              <h2 className="font-display text-lg font-extrabold text-foreground">
                {ready ? t("readyTitle") : t("notReadyTitle")}
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm font-medium text-muted-foreground">
                {ready ? t("readyBody") : t("notReadyBody")}
              </p>
            </div>

            {!ready && (
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <FlaskConical size={14} strokeWidth={1.8} />
                {t("trackProgress")}
              </div>
            )}
          </div>

          {ready && (
            <div className="mt-6 border-t border-border pt-2">
              <ReportList reports={reports} showUploader={false} />
            </div>
          )}
        </Card>
      )}

      {ready && hasStructuredResults && (
        <div>
          <ResultsSummary
            totalAnalyses={totalAnalyses}
            categoryCount={Object.keys(categoryCounts).length}
            boxNumber={user.box?.number}
            readyAt={user.box?.resultsReadyAt}
            reportHref={latestReport ? `/api/reports/${latestReport.id}/download` : undefined}
          />

          <h2 className="mt-8 mb-4 font-display text-lg font-extrabold text-foreground">
            {t("explore")}
          </h2>
          <CategoryGrid basePath="/dashboard/results" counts={categoryCounts} />

          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-primary">
              {t("originalPdf")}
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
