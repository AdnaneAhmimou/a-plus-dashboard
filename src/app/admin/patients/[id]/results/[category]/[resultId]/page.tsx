import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { ResultDetail } from "@/components/results/ResultDetail";
import { toProbabilities, toBibliography } from "@/lib/dashboard/analysis-results";
import { CATEGORY_META, categoryFromSlug } from "@/lib/dashboard/analysis-categories";

export default async function AdminResultDetailPage({
  params,
}: {
  params: Promise<{ id: string; category: string; resultId: string }>;
}) {
  const { id, category: slug, resultId } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const patient = await prisma.user.findUnique({
    where: { id },
    include: { box: true },
  });
  if (!patient || patient.role !== "PATIENT" || !patient.box) notFound();

  const result = await prisma.analysisResult.findUnique({
    where: { id: resultId },
  });
  if (!result || result.boxId !== patient.box.id || result.category !== category) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/admin/patients/${id}/results/${slug}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ChevronLeft size={16} />
        Back to {CATEGORY_META[category].label}
      </Link>

      <ResultDetail
        result={{
          name: result.name,
          summary: result.summary,
          categoryLabel: CATEGORY_META[category].label,
          description: result.description,
          probabilities: toProbabilities(result.probabilities),
          variantCount: result.variantCount,
          riskLociCount: result.riskLociCount,
          genesAnalyzed: result.genesAnalyzed,
          technicalNotes: result.technicalNotes,
          bibliography: toBibliography(result.bibliography),
        }}
      />
    </div>
  );
}
