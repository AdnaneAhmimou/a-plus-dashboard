// How many stored results get a specific icon versus the neutral
// fallback. Run after changing result-icons.ts to see whether a rule
// change helped or just moved the problem.
//
//   npx tsx scripts/icon-coverage.ts
import { Microscope } from "lucide-react";
import { prisma } from "../src/lib/prisma";
import { getResultIcon } from "../src/lib/dashboard/result-icons";

async function main() {
  const rows = await prisma.analysisResult.findMany({
    select: { name: true, summary: true },
    orderBy: { name: "asc" },
  });

  const unmatched = rows.filter(
    (r) => getResultIcon(r.name, r.summary) === Microscope
  );

  console.log(
    `${rows.length - unmatched.length}/${rows.length} results matched a specific icon`
  );
  if (unmatched.length > 0) {
    console.log("\nfalling back to the neutral icon:");
    for (const r of unmatched) console.log(`  ${r.name} — ${r.summary}`);
  }
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
