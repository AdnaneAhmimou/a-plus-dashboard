import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const APP_TABLES = [
  "users",
  "boxes",
  "reports",
  "analysis_results",
  "ancestry_profiles",
  "notifications",
  "push_tokens",
  "courier_events",
  "result_imports",
  "source_captures",
  "refresh_tokens",
  "password_reset_tokens",
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

function isPostgresUrl(value) {
  return /^(postgres|postgresql):\/\//.test(value);
}

function toPsqlUrl(value) {
  const url = new URL(value);
  url.searchParams.delete("schema");
  return url.toString();
}

function pickUrls(entries) {
  const databaseUrls = entries
    .filter(([key, value]) => key === "DATABASE_URL" && isPostgresUrl(value))
    .map(([, value]) => value);
  const directUrl = entries.find(
    ([key, value]) => key === "DATABASE_POSTGRES_URL" && isPostgresUrl(value)
  )?.[1];

  const localUrl = databaseUrls.find((value) => {
    const url = new URL(value);
    return ["localhost", "127.0.0.1"].includes(url.hostname);
  });
  const prodUrl = directUrl ?? databaseUrls.find((value) => new URL(value).hostname !== "localhost");

  if (!localUrl) throw new Error("Could not find the local Postgres URL in .env.");
  if (!prodUrl) throw new Error("Could not find the production Postgres URL in .env.");

  return { localUrl: toPsqlUrl(localUrl), prodUrl: toPsqlUrl(prodUrl) };
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? "inherit",
      env: { ...process.env, PGSSLMODE: "require" },
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function main() {
  const { localUrl, prodUrl } = pickUrls(parseEnvFile(".env"));
  const tableList = APP_TABLES.map((table) => `"${table}"`).join(", ");
  const truncateSql = `TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`;
  const countSql = APP_TABLES.map(
    (table) => `SELECT '${table}' AS table_name, count(*) FROM "${table}";`
  ).join("\n");
  const dumpArgs = [
    "--data-only",
    "--no-owner",
    "--no-privileges",
    "--column-inserts",
    ...APP_TABLES.flatMap((table) => ["--table", table]),
    localUrl,
  ];

  console.log("Local counts before sync:");
  await run("psql", [localUrl, "-v", "ON_ERROR_STOP=1", "-c", countSql]);

  console.log("\nProduction counts before sync:");
  await run("psql", [prodUrl, "-v", "ON_ERROR_STOP=1", "-c", countSql]);

  console.log("\nClearing production app tables...");
  await run("psql", [prodUrl, "-v", "ON_ERROR_STOP=1", "-c", truncateSql]);

  console.log("\nCopying local data into production...");
  await new Promise((resolve, reject) => {
    const dump = spawn("pg_dump", dumpArgs, { env: process.env });
    const restore = spawn("psql", [prodUrl, "-v", "ON_ERROR_STOP=1"], {
      stdio: ["pipe", "inherit", "inherit"],
      env: { ...process.env, PGSSLMODE: "require" },
    });

    dump.stdout.pipe(restore.stdin);

    let dumpError;
    let restoreError;
    dump.on("error", (error) => {
      dumpError = error;
      restore.stdin.destroy(error);
    });
    restore.on("error", (error) => {
      restoreError = error;
    });
    dump.on("close", (code) => {
      if (code !== 0) {
        dumpError = new Error(`pg_dump exited with code ${code}`);
        restore.stdin.destroy(dumpError);
      }
    });
    restore.on("close", (code) => {
      if (dumpError || restoreError) reject(dumpError ?? restoreError);
      else if (code !== 0) reject(new Error(`psql restore exited with code ${code}`));
      else resolve();
    });
  });

  console.log("\nProduction counts after sync:");
  await run("psql", [prodUrl, "-v", "ON_ERROR_STOP=1", "-c", countSql]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
