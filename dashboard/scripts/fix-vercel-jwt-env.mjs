import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const KEYS = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_TTL",
  "JWT_REFRESH_TTL_DAYS",
];

function parseEnvFile(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["--yes", "vercel@latest", ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(output || `vercel exited with code ${code}`));
    });
  });
}

const env = parseEnvFile(".env");

for (const key of KEYS) {
  if (!env[key]) throw new Error(`Missing ${key} in local .env.`);
}

for (const key of KEYS) {
  await run([
    "env",
    "add",
    key,
    "production",
    "--force",
    "--sensitive",
    "--value",
    env[key],
    "--yes",
  ]);
  console.log(`${key}: replaced as production secret`);
}
