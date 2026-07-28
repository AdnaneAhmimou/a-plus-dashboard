import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { ResultsList } from "@/components/results/ResultsList";
import { CATEGORY_META, categoryFromSlug } from "@/lib/dashboard/analysis-categories";

export default async function PatientCategoryResultsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { category: slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const results = user.box
    ? await prisma.analysisResult.findMany({
        where: { boxId: user.box.id, category },
        select: { id: true, name: true, summary: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div>
      <Link
        href="/dashboard/results"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ChevronLeft size={16} />
        Back to results
      </Link>

      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          Patient space
        </p>
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.6px] text-foreground">
          {CATEGORY_META[category].label}
        </h1>
      </div>

      <ResultsList items={results} basePath={`/dashboard/results/${slug}`} />
    </div>
  );
}
