import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/api-response";
import type { AnalysisCategory } from "@prisma/client";

// Mobile-only endpoint: the web dashboard reads this data straight off
// Prisma in a server component (see src/app/dashboard/results/page.tsx),
// which has no equivalent for the Flutter app. Mirrors that page's own
// query shape (groupBy counts + ancestry-as-its-own-category + flat
// results list) rather than inventing a different one.
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return errorResponse("Not authenticated", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { box: true },
  });
  if (!user) return errorResponse("Not authenticated", 401);
  if (!user.box) return errorResponse("No box is associated with your account", 404);

  const ready = user.box.kitStatus === "RESULTS_READY";

  const [results, ancestryProfile, latestReport] = await Promise.all([
    prisma.analysisResult.findMany({
      where: { boxId: user.box.id },
      select: { id: true, category: true, name: true, summary: true },
      orderBy: { name: "asc" },
    }),
    prisma.ancestryProfile.findUnique({
      where: { boxId: user.box.id },
      select: { id: true },
    }),
    prisma.report.findFirst({
      where: { boxId: user.box.id },
      orderBy: { version: "desc" },
      select: { id: true },
    }),
  ]);

  const categoryCounts: Partial<Record<AnalysisCategory, number>> = {};
  for (const r of results) {
    categoryCounts[r.category] = (categoryCounts[r.category] ?? 0) + 1;
  }
  if (ancestryProfile) categoryCounts.ANCESTRY = 1;

  return NextResponse.json({
    ready,
    boxNumber: user.box.number,
    readyAt: user.box.resultsReadyAt,
    totalAnalyses: results.length + (ancestryProfile ? 1 : 0),
    categoryCounts,
    items: results,
    latestReportId: latestReport?.id ?? null,
  });
}
