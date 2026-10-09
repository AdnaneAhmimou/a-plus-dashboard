// Loads the list-level results (name + verdict) captured from the portal
// into a box. This exists because the portal is currently serving the
// Traits and Wellness DETAIL pages as empty while still returning the
// lists, so the verdicts are available even when the descriptions are
// not. Rows written here carry externalId "list:<section>/<slug>" so they
// are distinguishable from a full import, which keys on the source's own
// numeric item id.
//
//   npx tsx scripts/seed-list-results.ts <items.json> --box APL-333333

import { readFile } from "node:fs/promises";
import type { AnalysisCategory } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

const CATEGORY: Record<string, AnalysisCategory> = {
  "Genetic vulnerability to health conditions": "HEALTH_CONDITIONS",
  "Hereditary conditions": "HEREDITARY_CONDITIONS",
  Traits: "TRAITS",
  Wellness: "WELLNESS",
};

const SECTION: Record<string, string> = {
  "Genetic vulnerability to health conditions": "diseases",
  "Hereditary conditions": "monogenic",
  Traits: "traits",
  Wellness: "wellness",
};

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

async function main() {
  const file = process.argv[2];
  const boxIndex = process.argv.indexOf("--box");
  const boxNumber = boxIndex >= 0 ? process.argv[boxIndex + 1] : undefined;
  const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
  if (!file || !boxNumber) {
    throw new Error("Usage: seed-list-results.ts <items.json> --box <number> [--only=Traits,Wellness]");
  }

  const box = await prisma.box.findUnique({ where: { number: boxNumber } });
  if (!box) throw new Error(`No box ${boxNumber}`);

  const data: Record<string, [string, string][]> = JSON.parse(await readFile(file, "utf8"));
  const wanted = only?.split(",").map((s) => s.trim());

  let written = 0;
  for (const [label, items] of Object.entries(data)) {
    if (wanted && !wanted.includes(label)) continue;
    const category = CATEGORY[label];
    const section = SECTION[label];
    if (!category) continue;

    for (const [name, verdict] of items) {
      if (!name || !verdict) continue;
      const externalId = `list:${section}/${slug(name)}`;
      await prisma.analysisResult.upsert({
        where: { boxId_externalId: { boxId: box.id, externalId } },
        create: { boxId: box.id, externalId, category, name, summary: verdict },
        update: { category, name, summary: verdict },
      });
      written++;
    }
  }

  console.log(`${written} list-level results written to box ${boxNumber}`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
