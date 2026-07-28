import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { CategoryGrid } from "@/components/results/CategoryGrid";
import type { AnalysisCategory } from "@prisma/client";

export default async function AdminPatientResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await prisma.user.findUnique({
    where: { id },
    include: { box: true },
  });
  if (!patient || patient.role !== "PATIENT") notFound();

  const categoryGroups = patient.box
    ? await prisma.analysisResult.groupBy({
        by: ["category"],
        where: { boxId: patient.box.id },
        _count: { _all: true },
      })
    : [];
  const categoryCounts = Object.fromEntries(
    categoryGroups.map((g) => [g.category, g._count._all])
  ) as Partial<Record<AnalysisCategory, number>>;

  return (
    <div>
      <Link
        href={`/admin/patients/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ChevronLeft size={16} />
        Back to {patient.firstName} {patient.lastName}
      </Link>

      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          Admin
        </p>
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.6px] text-foreground">
          {patient.firstName} {patient.lastName} &mdash; Results
        </h1>
      </div>

      {categoryGroups.length === 0 ? (
        <p className="text-sm font-medium text-muted-foreground">
          No structured results yet. Upload a report and analyze it with AI
          from the patient detail page.
        </p>
      ) : (
        <CategoryGrid basePath={`/admin/patients/${id}/results`} counts={categoryCounts} />
      )}
    </div>
  );
}
