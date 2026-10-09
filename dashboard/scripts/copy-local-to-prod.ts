// One-time copy of every row in the local database to production.
//
//   LOCAL_DATABASE_URL=... PROD_DATABASE_URL=... npx tsx scripts/copy-local-to-prod.ts
//
// Two Prisma clients, each pointed at a different database via an
// explicit datasource override — no env-var juggling, no risk of one
// accidentally reading the other's URL from .env.
//
// Copies, in FK-safe order: users, boxes, reports (incl. PDF bytes),
// analysis_results, ancestry_profiles, notifications, result_imports,
// source_captures.
//
// Deliberately skipped: refresh_tokens and password_reset_tokens. Both
// are signed against the LOCAL JWT secrets; production uses different
// ones (as it should), so a copied token can never be presented by any
// real client — it would just be 108 dead rows. push_tokens and
// courier_events are skipped because they're empty locally, not because
// of any filtering.
//
// Uses createMany with skipDuplicates, so re-running after a partial
// failure is safe — already-copied rows are left alone.

import { Prisma, PrismaClient } from "@prisma/client";

const localUrl = process.env.LOCAL_DATABASE_URL;
const prodUrl = process.env.PROD_DATABASE_URL;
if (!localUrl || !prodUrl) {
  throw new Error("Set both LOCAL_DATABASE_URL and PROD_DATABASE_URL.");
}

const local = new PrismaClient({ datasources: { db: { url: localUrl } } });
const prod = new PrismaClient({ datasources: { db: { url: prodUrl } } });

// Prisma distinguishes a JSON column holding the JSON literal `null`
// from a SQL NULL, so a value read back as JS `null` must be converted
// to Prisma.DbNull before it can be written again — passing bare `null`
// to createMany is a type error by design, not an oversight to work around.
function dbNullify<T extends Record<string, unknown>>(
  row: T,
  jsonFields: (keyof T)[]
): T {
  const copy = { ...row };
  for (const field of jsonFields) {
    if (copy[field] === null) copy[field] = Prisma.DbNull as T[typeof field];
  }
  return copy;
}

async function copy<T>(
  label: string,
  read: () => Promise<T[]>,
  write: (rows: T[]) => Promise<{ count: number }>
) {
  const rows = await read();
  if (rows.length === 0) {
    console.log(`${label}: 0 rows, skipped`);
    return;
  }
  const result = await write(rows);
  console.log(`${label}: ${result.count}/${rows.length} rows copied`);
}

async function main() {
  await copy(
    "users",
    () => local.user.findMany(),
    (rows) => prod.user.createMany({ data: rows, skipDuplicates: true })
  );
  await copy(
    "boxes",
    () => local.box.findMany(),
    (rows) => prod.box.createMany({ data: rows, skipDuplicates: true })
  );
  await copy(
    "reports",
    () => local.report.findMany(),
    (rows) => prod.report.createMany({ data: rows, skipDuplicates: true })
  );
  await copy(
    "analysis_results",
    async () =>
      (await local.analysisResult.findMany()).map(
        (r) =>
          dbNullify(r, ["probabilities", "bibliography"]) as unknown as Prisma.AnalysisResultCreateManyInput
      ),
    (rows) => prod.analysisResult.createMany({ data: rows, skipDuplicates: true })
  );
  await copy(
    "ancestry_profiles",
    async () =>
      (await local.ancestryProfile.findMany()).map(
        (r) =>
          dbNullify(r, ["maternalMigration", "paternalMigration", "neanderthalSections"]) as unknown as Prisma.AncestryProfileCreateManyInput
      ),
    (rows) => prod.ancestryProfile.createMany({ data: rows, skipDuplicates: true })
  );
  await copy(
    "notifications",
    () => local.notification.findMany(),
    (rows) => prod.notification.createMany({ data: rows, skipDuplicates: true })
  );
  await copy(
    "result_imports",
    () => local.resultImport.findMany(),
    (rows) => prod.resultImport.createMany({ data: rows, skipDuplicates: true })
  );
  await copy(
    "source_captures",
    () => local.sourceCapture.findMany(),
    (rows) => prod.sourceCapture.createMany({ data: rows, skipDuplicates: true })
  );

  console.log("\ndone");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await local.$disconnect();
    await prod.$disconnect();
  });
