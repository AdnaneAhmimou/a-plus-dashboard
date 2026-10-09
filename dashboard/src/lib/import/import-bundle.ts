import { Prisma, type ImportSource, type ImportStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { PatientResultBundle } from "./types";

// Writes a fetched bundle into the database. Three rules shape this:
//
// 1. Nothing is deleted up front. An earlier version of the analyze flow
//    wiped a box's whole result set before writing and a mid-run failure
//    left the patient with nothing; here every result is upserted on
//    (boxId, externalId), so a failed or partial run leaves the previous
//    data intact.
// 2. The import is recorded even when it fails, so an admin can see what
//    happened rather than guessing from an empty page.
// 3. Raw captured text is stored alongside the parsed fields, so parsing
//    can be improved later without driving the portal again.

export interface ImportOutcome {
  importId: string;
  boxId: string;
  boxNumber: string;
  imported: number;
  status: ImportStatus;
}

export async function importBundle(
  bundle: PatientResultBundle,
  options: { source: ImportSource; boxNumber?: string }
): Promise<ImportOutcome> {
  const box = await resolveBox(bundle.barcode, options.boxNumber);

  const itemsFound = bundle.sections.reduce((n, s) => n + s.results.length, 0);
  const run = await prisma.resultImport.create({
    data: {
      boxId: box.id,
      source: options.source,
      barcode: bundle.barcode,
      itemsFound,
      status: "RUNNING",
    },
  });

  let imported = 0;

  try {
    for (const section of bundle.sections) {
      for (const result of section.results) {
        const externalId = result.externalId;
        const data = {
          category: section.category,
          name: result.name,
          summary: result.verdict,
          description: result.description ?? null,
          resultContext: result.resultContext ?? null,
          variantCount: result.variantCount ?? null,
          riskLociCount: result.riskLociCount ?? null,
          genesAnalyzed: result.genesAnalyzed ?? null,
          causesAndRiskFactors: result.causesAndRiskFactors ?? null,
          symptoms: result.symptoms ?? null,
          prevention: result.prevention ?? null,
          diseaseManagement: result.diseaseManagement ?? null,
          technicalNotes: result.technicalNotes ?? null,
          studyLimitations: result.studyLimitations ?? null,
          bibliography: (result.bibliography ?? null) as Prisma.InputJsonValue,
          sourceUrl: result.url,
        };

        await prisma.analysisResult.upsert({
          where: { boxId_externalId: { boxId: box.id, externalId } },
          create: { ...data, boxId: box.id, externalId },
          update: data,
        });

        await prisma.sourceCapture.upsert({
          where: {
            importId_section_externalId: {
              importId: run.id,
              section: section.sourceKey,
              externalId,
            },
          },
          create: {
            importId: run.id,
            section: section.sourceKey,
            externalId,
            url: result.url,
            rawText: result.rawText,
          },
          update: { rawText: result.rawText, url: result.url },
        });

        imported++;
      }
    }

    if (bundle.ancestry) {
      const a = bundle.ancestry;
      const ancestryData = {
        composition: a.composition as unknown as Prisma.InputJsonValue,
        maternalHaplogroup: a.maternal?.haplogroup ?? null,
        maternalSubhaplogroup: a.maternal?.subhaplogroup ?? null,
        maternalMigration: (a.maternal?.migration ?? null) as Prisma.InputJsonValue,
        paternalHaplogroup: a.paternal?.haplogroup ?? null,
        paternalSubhaplogroup: a.paternal?.subhaplogroup ?? null,
        paternalMigration: (a.paternal?.migration ?? null) as Prisma.InputJsonValue,
        neanderthalPercent: a.neanderthal?.percent ?? null,
        neanderthalVariants: a.neanderthal?.variants ?? null,
        neanderthalVsAverage: a.neanderthal?.vsAverage ?? null,
        neanderthalSections: (a.neanderthal?.sections ?? null) as Prisma.InputJsonValue,
      };

      await prisma.ancestryProfile.upsert({
        where: { boxId: box.id },
        create: { boxId: box.id, ...ancestryData },
        update: ancestryData,
      });

      await prisma.sourceCapture.upsert({
        where: {
          importId_section_externalId: {
            importId: run.id,
            section: "ancestry",
            externalId: "profile",
          },
        },
        create: {
          importId: run.id,
          section: "ancestry",
          externalId: "profile",
          url: "",
          rawText: a.rawText,
        },
        update: { rawText: a.rawText },
      });
    }

    // Warnings mean some items did not come back. The data that did
    // arrive is still written; the run is flagged PARTIAL so nobody
    // reads it as a clean import.
    const status: ImportStatus = bundle.warnings.length > 0 ? "PARTIAL" : "COMPLETED";

    await prisma.resultImport.update({
      where: { id: run.id },
      data: {
        status,
        itemsImported: imported,
        finishedAt: new Date(),
        error: bundle.warnings.length > 0 ? bundle.warnings.join("\n") : null,
      },
    });

    return { importId: run.id, boxId: box.id, boxNumber: box.number, imported, status };
  } catch (error) {
    await prisma.resultImport.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        itemsImported: imported,
        finishedAt: new Date(),
        error: (error as Error).message,
      },
    });
    throw error;
  }
}

/**
 * The kit barcode is the identifier both systems share, so matching on it
 * is what makes results land on the right patient by construction rather
 * than by an admin picking from a dropdown. An explicit box number is
 * accepted for the case where the lab's numbering differs from the kit's.
 */
async function resolveBox(barcode: string, boxNumber?: string) {
  if (boxNumber) {
    const box = await prisma.box.findUnique({ where: { number: boxNumber } });
    if (!box) throw new Error(`No box ${boxNumber} in the dashboard.`);
    return box;
  }

  const box = await prisma.box.findUnique({ where: { number: barcode } });
  if (!box) {
    throw new Error(
      `No box matching kit barcode ${barcode}. Create the box first, or pass ` +
        `--box with the A+ box number to attach these results to.`
    );
  }
  return box;
}
