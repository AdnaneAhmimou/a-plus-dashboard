// Which template each stored result will render with. A quick way to see
// that the detection rules match the real corpus rather than the handful
// of examples they were written against.
//
//   npx tsx scripts/template-distribution.ts
import { prisma } from "../src/lib/prisma";
import { detectResultType } from "../src/lib/dashboard/result-type";

async function main() {
  const rows = await prisma.analysisResult.findMany({
    select: { name: true, summary: true },
  });

  const counts = new Map<string, number>();
  const examples = new Map<string, string[]>();

  for (const row of rows) {
    const type = detectResultType(row.summary);
    counts.set(type, (counts.get(type) ?? 0) + 1);
    const list = examples.get(type) ?? [];
    if (list.length < 3) list.push(`${row.name} — ${row.summary}`);
    examples.set(type, list);
  }

  console.log(`template distribution over ${rows.length} results:\n`);
  for (const [type, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type.padEnd(12)} ${String(n).padStart(4)}`);
    for (const e of examples.get(type) ?? []) console.log(`               ${e}`);
  }
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
