import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { ResultsList } from "@/components/results/ResultsList";
import { AncestrySection } from "@/components/results/ancestry/AncestrySection";
import { toAncestryProfileData } from "@/lib/dashboard/ancestry-profile";
import { CATEGORY_META, categoryFromSlug } from "@/lib/dashboard/analysis-categories";

export default async function AdminCategoryResultsPage({
  params,
}: {
  params: Promise<{ id: string; category: string }>;
}) {
  const { id, category: slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const patient = await prisma.user.findUnique({
    where: { id },
    include: { box: true },
  });
  if (!patient || patient.role !== "PATIENT") notFound();

  const ancestry =
    category === "ANCESTRY" && patient.box
      ? await prisma.ancestryProfile.findUnique({ where: { boxId: patient.box.id } })
      : null;

  const results = patient.box && category !== "ANCESTRY"
    ? await prisma.analysisResult.findMany({
        where: { boxId: patient.box.id, category },
        select: { id: true, name: true, summary: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div>
      <Link
        href={`/admin/patients/${id}/results`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ChevronLeft size={16} />
        Back to results
      </Link>

      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          {patient.firstName} {patient.lastName}
        </p>
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.6px] text-foreground">
          {CATEGORY_META[category].label}
        </h1>
      </div>

      {category === "ANCESTRY" ? (
        ancestry ? (
          <AncestrySection profile={toAncestryProfileData(ancestry)} />
        ) : (
          <p className="text-sm font-medium text-muted-foreground">
            No ancestry profile for this patient yet.
          </p>
        )
      ) : (
        <ResultsList items={results} basePath={`/admin/patients/${id}/results/${slug}`} />
      )}
    </div>
  );
}
