// Imports one patient's tellmeGen results into the dashboard.
//
//   npx tsx scripts/import-patient.ts "Maria Paulina Sanchez" --box APL-333333
//   npx tsx scripts/import-patient.ts "Maria Paulina Sanchez" --only=wellness --dry-run
//
// Runs on a machine with a browser (not on Vercel: Playwright needs a
// real Chromium). Credentials come from .env.tellmegen — see
// src/lib/import/tellmegen-portal.ts.
//
// Flags:
//   --box <number>   the A+ box to attach results to (else matched by kit barcode)
//   --only=a,b       only these sections: diseases, monogenic, traits, wellness, ancestry
//   --concurrency=N  detail pages fetched at once (default 8)
//   --dry-run        fetch and report, write nothing to the database
//   --headed         show the browser

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { TellmegenPortalSource } from "../src/lib/import/tellmegen-portal";
import { importBundle } from "../src/lib/import/import-bundle";

async function loadCredentials() {
  let email = process.env.TMG_EMAIL;
  let password = process.env.TMG_PASSWORD;
  const file = path.join(process.cwd(), ".env.tellmegen");
  if ((!email || !password) && existsSync(file)) {
    for (const line of (await readFile(file, "utf8")).split("\n")) {
      const m = line.match(/^\s*(TMG_EMAIL|TMG_PASSWORD)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, "");
      if (m[1] === "TMG_EMAIL") email ??= value;
      else password ??= value;
    }
  }
  if (!email || !password) {
    throw new Error(
      "Missing credentials. Create .env.tellmegen with TMG_EMAIL and TMG_PASSWORD."
    );
  }
  return { email, password };
}

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")));
  const identifier = args.find((a) => !a.startsWith("--"));
  if (!identifier) throw new Error('Usage: import-patient.ts "Patient Name" [--box NUMBER]');

  const valueOf = (name: string) => {
    const inline = args.find((a) => a.startsWith(`--${name}=`));
    if (inline) return inline.split("=").slice(1).join("=");
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const only = valueOf("only")?.split(",").map((s) => s.trim()).filter(Boolean);
  const concurrency = Number(valueOf("concurrency") ?? 8);
  const boxNumber = valueOf("box");
  const dryRun = flags.has("--dry-run");

  const source = new TellmegenPortalSource(await loadCredentials(), {
    headless: !flags.has("--headed"),
  });

  const started = Date.now();
  const bundle = await source.fetchPatient(identifier, {
    only,
    concurrency,
    onProgress: (m) => console.log(`[fetch] ${m}`),
  });

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const total = bundle.sections.reduce((n, s) => n + s.results.length, 0);
  console.log(
    `\nfetched ${total} results in ${seconds}s for ${bundle.patientLabel} (${bundle.barcode})`
  );
  for (const section of bundle.sections) {
    console.log(`  ${section.sourceKey}: ${section.results.length}`);
  }
  if (bundle.ancestry) {
    console.log(
      `  ancestry: ${bundle.ancestry.composition.length} top-level regions, ` +
        `maternal ${bundle.ancestry.maternal?.haplogroup ?? "none"}, ` +
        `neanderthal ${bundle.ancestry.neanderthal?.percent ?? "none"}%`
    );
  }
  if (bundle.warnings.length > 0) {
    console.log(`\nwarnings (${bundle.warnings.length}):`);
    for (const w of bundle.warnings.slice(0, 20)) console.log(`  - ${w}`);
  }

  if (dryRun) {
    console.log("\n--dry-run: nothing written to the database");
    return;
  }

  const result = await importBundle(bundle, { source: "TELLMEGEN_PORTAL", boxNumber });
  console.log(
    `\nimported: ${result.imported} results into box ${result.boxNumber} ` +
      `(import ${result.importId}, status ${result.status})`
  );
}

main().catch((e) => {
  console.error(`\n${e.message}\n`);
  process.exit(1);
});
