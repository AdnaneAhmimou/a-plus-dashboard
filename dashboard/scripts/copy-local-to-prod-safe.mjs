import { Prisma, PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

function parseEnvFile(path) {
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/))
    .filter(Boolean)
    .map((match) => {
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return [match[1], value];
    });
}

function isPostgresUrl(value) {
  return /^(postgres|postgresql):\/\//.test(value);
}

function stripSchemaParam(value) {
  const url = new URL(value);
  url.searchParams.delete("schema");
  return url.toString();
}

function pickUrls(entries) {
  const databaseUrls = entries
    .filter(([key, value]) => key === "DATABASE_URL" && isPostgresUrl(value))
    .map(([, value]) => value);
  const prodDirectUrl = entries.find(
    ([key, value]) => key === "DATABASE_POSTGRES_URL" && isPostgresUrl(value)
  )?.[1];

  const localUrl = databaseUrls.find((value) => {
    const url = new URL(value);
    return ["localhost", "127.0.0.1"].includes(url.hostname);
  });
  const prodUrl =
    prodDirectUrl ?? databaseUrls.find((value) => new URL(value).hostname !== "localhost");

  if (!localUrl) throw new Error("Could not find the local Postgres URL in .env.");
  if (!prodUrl) throw new Error("Could not find the production Postgres URL in .env.");

  return { localUrl: stripSchemaParam(localUrl), prodUrl: stripSchemaParam(prodUrl) };
}

function omit(row, keys) {
  const copy = { ...row };
  for (const key of keys) delete copy[key];
  return copy;
}

function dbNullify(row, jsonFields) {
  const copy = { ...row };
  for (const field of jsonFields) {
    if (copy[field] === null) copy[field] = Prisma.DbNull;
  }
  return copy;
}

async function upsertRows(label, rows, model, prepare = (row) => row) {
  let createdOrUpdated = 0;
  for (const row of rows) {
    const data = prepare(row);
    await model.upsert({
      where: { id: data.id },
      create: data,
      update: omit(data, ["id"]),
    });
    createdOrUpdated += 1;
  }
  console.log(`${label}: ${createdOrUpdated}/${rows.length} rows copied`);
}

async function main() {
  const { localUrl, prodUrl } = pickUrls(parseEnvFile(".env"));
  const local = new PrismaClient({ datasources: { db: { url: localUrl } } });
  const prod = new PrismaClient({ datasources: { db: { url: prodUrl } } });

  try {
    await upsertRows("users", await local.user.findMany(), prod.user);
    await upsertRows("boxes", await local.box.findMany(), prod.box);
    await upsertRows("reports", await local.report.findMany(), prod.report);
    await upsertRows("courier_events", await local.courierEvent.findMany(), prod.courierEvent);
    await upsertRows(
      "analysis_results",
      await local.analysisResult.findMany(),
      prod.analysisResult,
      (row) => dbNullify(row, ["probabilities", "bibliography"])
    );
    await upsertRows(
      "ancestry_profiles",
      await local.ancestryProfile.findMany(),
      prod.ancestryProfile,
      (row) =>
        dbNullify(row, ["maternalMigration", "paternalMigration", "neanderthalSections"])
    );
    await upsertRows("notifications", await local.notification.findMany(), prod.notification);
    await upsertRows("result_imports", await local.resultImport.findMany(), prod.resultImport);
    await upsertRows("source_captures", await local.sourceCapture.findMany(), prod.sourceCapture);
  } finally {
    await local.$disconnect();
    await prod.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
