import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { getTranslations } from "next-intl/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { ResultsList } from "@/components/results/ResultsList";
import { AncestrySection } from "@/components/results/ancestry/AncestrySection";
import { toAncestryProfileData } from "@/lib/dashboard/ancestry-profile";
import { categoryFromSlug } from "@/lib/dashboard/analysis-categories";

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

  // Ancestry is one profile with four facets, not a list of traits, so it
  // renders its own section instead of the generic per-trait list.
  const ancestry =
    category === "ANCESTRY" && user.box
      ? await prisma.ancestryProfile.findUnique({ where: { boxId: user.box.id } })
      : null;

  const t = await getTranslations("results");
  const tc = await getTranslations("categories");
  const nav = await getTranslations("nav");

  const results = user.box && category !== "ANCESTRY"
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
        {t("backToResults")}
      </Link>

      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          {nav("patientSpace")}
        </p>
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.6px] text-foreground">
          {tc(category)}
        </h1>
      </div>

      {category === "ANCESTRY" ? (
        ancestry ? (
          <AncestrySection profile={toAncestryProfileData(ancestry)} />
        ) : (
          <p className="text-sm font-medium text-muted-foreground">
            {t("noAncestry")}
          </p>
        )
      ) : (
        <ResultsList items={results} basePath={`/dashboard/results/${slug}`} />
      )}
    </div>
  );
}
