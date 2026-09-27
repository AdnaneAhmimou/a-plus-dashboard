// Re-parses stored raw captures into the structured fields, without
// touching the portal. This is why rawText is kept: improving a parser
// is a seconds-long job over the database instead of an hours-long
// re-scrape. Re-runnable and safe — it only rewrites parsed fields.
//
//   npx tsx scripts/reparse-captures.ts [--import <id>] [--dry-run]

import { Prisma } from "@prisma/client";

import { prisma } from "../src/lib/prisma";
import { parseDetailText } from "../src/lib/import/parse-detail";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const importId = args[args.indexOf("--import") + 1];

  const captures = await prisma.sourceCapture.findMany({
    where: {
      ...(args.includes("--import") ? { importId } : {}),
      section: { not: "ancestry" },
    },
    include: { import: { select: { boxId: true } } },
  });

  let changed = 0;
  for (const capture of captures) {
    const parsed = parseDetailText(capture.rawText);
    const existing = await prisma.analysisResult.findUnique({
      where: {
        boxId_externalId: {
          boxId: capture.import.boxId,
          externalId: capture.externalId,
        },
      },
    });
    if (!existing) continue;

    const next = {
      description: parsed.description ?? null,
      resultContext: parsed.resultContext ?? null,
      variantCount: parsed.variantCount ?? null,
      riskLociCount: parsed.riskLociCount ?? null,
      genesAnalyzed: parsed.genesAnalyzed ?? null,
      causesAndRiskFactors: parsed.causesAndRiskFactors ?? null,
      symptoms: parsed.symptoms ?? null,
      prevention: parsed.prevention ?? null,
      diseaseManagement: parsed.diseaseManagement ?? null,
      technicalNotes: parsed.technicalNotes ?? null,
      studyLimitations: parsed.studyLimitations ?? null,
      // Prisma's Json column takes DbNull rather than a bare null to
      // mean "no value" as opposed to the JSON literal null.
      bibliography: (parsed.bibliography ??
        Prisma.DbNull) as Prisma.InputJsonValue,
    };
    const differs = Object.entries(next).some(([k, v]) =>
      k === "bibliography"
        ? JSON.stringify(existing.bibliography ?? null) !== JSON.stringify(v)
        : existing[k as keyof typeof existing] !== v
    );
    if (!differs) continue;

    changed++;
    if (!dryRun) {
      await prisma.analysisResult.update({ where: { id: existing.id }, data: next });
    }
  }

  console.log(
    `${captures.length} captures re-parsed, ${changed} results ${dryRun ? "would change" : "updated"}`
  );
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
