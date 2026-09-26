import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { ResultDetail } from "@/components/results/ResultDetail";
import { ResultBreadcrumb } from "@/components/results/blocks/ResultBreadcrumb";
import { toProbabilities, toBibliography } from "@/lib/dashboard/analysis-results";
import { CATEGORY_META, categoryFromSlug } from "@/lib/dashboard/analysis-categories";

export default async function PatientResultDetailPage({
  params,
}: {
  params: Promise<{ category: string; resultId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { category: slug, resultId } = await params;
  const category = categoryFromSlug(slug);
  if (!category || !user.box) notFound();

  const result = await prisma.analysisResult.findUnique({
    where: { id: resultId },
  });
  if (!result || result.boxId !== user.box.id || result.category !== category) {
    notFound();
  }

  return (
    <div>
      <ResultBreadcrumb
        categoryLabel={CATEGORY_META[category].label}
        categoryHref={`/dashboard/results/${slug}`}
        name={result.name}
      />

      <ResultDetail
        result={{
          name: result.name,
          summary: result.summary,
          categoryLabel: CATEGORY_META[category].label,
          description: result.description,
          resultContext: result.resultContext,
          probabilities: toProbabilities(result.probabilities),
          variantCount: result.variantCount,
          riskLociCount: result.riskLociCount,
          genesAnalyzed: result.genesAnalyzed,
          technicalNotes: result.technicalNotes,
          bibliography: toBibliography(result.bibliography),
          causesAndRiskFactors: result.causesAndRiskFactors,
          symptoms: result.symptoms,
          prevention: result.prevention,
          diseaseManagement: result.diseaseManagement,
          studyLimitations: result.studyLimitations,
        }}
      />
    </div>
  );
}
