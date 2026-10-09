import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const MODELS = [
  ["users", "user"],
  ["boxes", "box"],
  ["reports", "report"],
  ["analysis_results", "analysisResult"],
  ["ancestry_profiles", "ancestryProfile"],
  ["notifications", "notification"],
  ["result_imports", "resultImport"],
  ["source_captures", "sourceCapture"],
  ["courier_events", "courierEvent"],
  ["push_tokens", "pushToken"],
  ["refresh_tokens", "refreshToken"],
  ["password_reset_tokens", "passwordResetToken"],
];

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

function pickProdUrl(entries) {
  const directUrl = entries.find(
    ([key, value]) =>
      key === "DATABASE_POSTGRES_URL" && /^(postgres|postgresql):\/\//.test(value)
  )?.[1];
  if (!directUrl) throw new Error("Could not find DATABASE_POSTGRES_URL in .env.");
  const url = new URL(directUrl);
  url.searchParams.delete("schema");
  return url.toString();
}

const prisma = new PrismaClient({
  datasources: { db: { url: pickProdUrl(parseEnvFile(".env")) } },
});

try {
  for (const [table, model] of MODELS) {
    const count = await prisma[model].count();
    console.log(`${table}: ${count}`);
  }
} finally {
  await prisma.$disconnect();
}
