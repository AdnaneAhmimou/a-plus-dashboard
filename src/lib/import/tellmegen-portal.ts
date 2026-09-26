import path from "node:path";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import type { Browser, BrowserContext, Page } from "playwright";
import type { AnalysisCategory } from "@prisma/client";

import {
  ImportSourceError,
  type FetchOptions,
  type ImportedAncestry,
  type ImportedResult,
  type ImportedSection,
  type PatientResultBundle,
  type ResultSource,
} from "./types";
import { parseDetailText } from "./parse-detail";

const BASE = "https://professionals.tellmegen.com";
const STATE_FILE = path.join(process.cwd(), ".tellmegen-session.json");

// The portal's result routes and where each belongs in our own category
// model. Each route caches its list under its own type key.
const SECTIONS: {
  key: string;
  route: string;
  cacheType: RegExp;
  category: AnalysisCategory;
}[] = [
  { key: "diseases", route: "/results/diseases", cacheType: /^complex/i, category: "HEALTH_CONDITIONS" },
  { key: "monogenic", route: "/results/monogenic", cacheType: /^monogenic/i, category: "HEREDITARY_CONDITIONS" },
  { key: "traits", route: "/results/traits", cacheType: /^trait$/i, category: "TRAITS" },
  { key: "wellness", route: "/results/wellness", cacheType: /^wellness$/i, category: "WELLNESS" },
];

/** One row as the portal's own client-side cache holds it. */
interface CachedRow {
  itemId?: number;
  idImputation?: number;
  /** Conditions phrase the verdict as `actions`, traits/wellness as `results`. */
  actions?: string;
  results?: string;
  name?: string;
  blocked?: boolean;
  wellness?: boolean;
  riskNumber?: number;
  ptValue?: number;
}

export class TellmegenPortalSource implements ResultSource {
  readonly id = "TELLMEGEN_PORTAL" as const;

  constructor(
    private readonly credentials: { email: string; password: string },
    private readonly options: { headless?: boolean } = {}
  ) {}

  async fetchPatient(
    identifier: string,
    options: FetchOptions = {}
  ): Promise<PatientResultBundle> {
    const { chromium } = await import("playwright");
    const concurrency = Math.max(1, options.concurrency ?? 8);
    const outDir = options.outDir ?? path.join(process.cwd(), "tellmegen-export");
    const report = options.onProgress ?? (() => {});
    const warnings: string[] = [];

    const browser: Browser = await chromium.launch({
      headless: this.options.headless !== false,
    });
    const context: BrowserContext = await browser.newContext({
      storageState: existsSync(STATE_FILE) ? STATE_FILE : undefined,
      viewport: { width: 1440, height: 1000 },
      acceptDownloads: true,
    });

    // Nothing is blocked. Aborting images, fonts, stylesheets or even
    // third-party analytics each break a different part of this app, and
    // every failure is silent: the run "succeeds" having captured an
    // empty section. See DESIGN.md for the full list of what broke.

    try {
      const page = await context.newPage();
      page.setDefaultTimeout(45000);

      await this.login(page, report);
      await context.storageState({ path: STATE_FILE });

      const patientLabel = await this.openPatient(page, identifier, report);
      const barcode = extractBarcode(patientLabel) ?? identifier;
      await mkdir(path.join(outDir, slugify(patientLabel)), { recursive: true });
      const patientDir = path.join(outDir, slugify(patientLabel));

      const wanted = options.only
        ? SECTIONS.filter((s) => options.only!.includes(s.key))
        : SECTIONS;

      const sections: ImportedSection[] = [];
      const documents: { section: string; filePath: string }[] = [];

      for (const section of wanted) {
        const rows = await this.listSection(page, section, report);
        if (rows.length === 0) {
          warnings.push(`${section.key}: no items found`);
          continue;
        }

        const results = await this.fetchDetails(
          context,
          section,
          rows,
          concurrency,
          report,
          warnings
        );
        sections.push({ sourceKey: section.key, category: section.category, results });

        const pdf = await this.downloadSectionPdf(page, section.key, patientDir);
        if (pdf) documents.push({ section: section.key, filePath: pdf });
      }

      const ancestry = options.only && !options.only.includes("ancestry")
        ? null
        : await this.fetchAncestry(page, report, warnings);
      if (ancestry) {
        const pdf = await this.downloadSectionPdf(page, "ancestry", patientDir);
        if (pdf) documents.push({ section: "ancestry", filePath: pdf });
      }

      return {
        barcode,
        patientLabel,
        capturedAt: new Date(),
        sections,
        ancestry,
        documents,
        warnings,
      };
    } finally {
      await context.close().catch(() => {});
      await browser.close().catch(() => {});
    }
  }

  /* ---------------------------------------------------------------- */

  // Logged in means "the user list is reachable", not "no password field
  // was visible": an invalidated session still renders a password-free
  // landing page, which would send the run off hunting for a patient
  // that is never going to load.
  private async login(page: Page, report: (m: string) => void) {
    await page.goto(`${BASE}/users`, { waitUntil: "domcontentloaded" });

    const accessButton = page.getByRole("button", { name: /Access/i }).first();
    const passwordField = page
      .locator('input[name="password"], input[type="password"]')
      .first();

    const outcome = await Promise.race([
      accessButton.waitFor({ state: "visible", timeout: 45000 }).then(() => "in").catch(() => null),
      passwordField.waitFor({ state: "visible", timeout: 45000 }).then(() => "form").catch(() => null),
    ]);

    if (outcome === "in") {
      report("session still valid");
      return;
    }
    if (outcome !== "form") {
      throw new ImportSourceError(
        "Neither the user list nor a login form appeared; the portal may be down."
      );
    }

    report("logging in");
    // The form fields carry name="email"/name="password". Matching on the
    // name matters: the first text input on the page is the language picker.
    await page
      .locator('input[name="email"], input[type="email"]')
      .first()
      .fill(this.credentials.email);
    await passwordField.fill(this.credentials.password);
    await passwordField.press("Enter");

    // Wait for the login POST to resolve before navigating; navigating
    // straight away cancels it and looks exactly like a wrong password.
    await page
      .waitForFunction(() => !location.pathname.startsWith("/login"), null, {
        timeout: 30000,
        polling: 250,
      })
      .catch(() => {});

    await page.goto(`${BASE}/users`, { waitUntil: "domcontentloaded" });
    await accessButton.waitFor({ state: "visible", timeout: 45000 }).catch(() => {
      throw new ImportSourceError(
        "Login did not complete. Check the credentials, or run headed if there is a captcha."
      );
    });
    report("logged in");
  }

  // Every user is a .v-list-item inside ONE shared .v-card, each with its
  // own Access button. Scoping to the list item is essential: a card-level
  // match resolves to the whole list and clicks the FIRST user's Access
  // button, which for a pending account sends that person a request.
  private async openPatient(page: Page, identifier: string, report: (m: string) => void) {
    const terms = identifier.trim().split(/\s+/);
    let item = page.locator(".v-list-item");
    for (const term of terms) {
      item = item.filter({ hasText: new RegExp(escapeRe(term), "i") });
    }

    const matches = await item.count();
    if (matches !== 1) {
      throw new ImportSourceError(
        matches === 0
          ? `No patient matching "${identifier}" in the portal.`
          : `"${identifier}" matched ${matches} patients; refusing to guess. Use the kit barcode.`
      );
    }

    const label = (await item.first().innerText()).replace(/\s+/g, " ").trim();
    await item.first().getByRole("button", { name: /Access/i }).click();
    await page.waitForURL("**/user", { timeout: 30000 });
    report(`opened ${label}`);
    return label;
  }

  /**
   * The list page is loaded once, then read from the app's OWN client-side
   * cache rather than scraped from the table. The cache carries each row's
   * numeric item id, which the rendered table does not expose anywhere —
   * and without those ids there is no way to address detail pages directly,
   * which means no parallelism and a 45-minute import instead of a 5-minute
   * one. Falls back to the rendered table when the cache shape changes.
   */
  private async listSection(
    page: Page,
    section: (typeof SECTIONS)[number],
    report: (m: string) => void
  ): Promise<CachedRow[]> {
    await page.goto(BASE + section.route, { waitUntil: "domcontentloaded" });

    // Two independent readiness signals, because neither alone is
    // reliable. The cached list is the one we actually want (it carries
    // the item ids), but a client-side redirect can destroy the
    // execution context and reject the poll early, leaving us reading an
    // empty cache. Rendered table rows are slower but survive that. So:
    // wait for rows on screen, then for the cache, then read — and retry
    // once, since the app fills the cache after painting.
    for (let attempt = 0; attempt < 3; attempt++) {
      await page
        .waitForFunction(
          () => document.querySelectorAll("main tbody tr").length > 0,
          null,
          { timeout: 45000 }
        )
        .catch(() => {});

      await page
        .waitForFunction(
          (pattern) => {
            try {
              const items = JSON.parse(localStorage.getItem("items") || "{}").items ?? [];
              const entry = items.find((i: { type?: string }) =>
                i.type ? new RegExp(pattern, "i").test(i.type) : false
              );
              return Boolean(entry?.list?.length);
            } catch {
              return false;
            }
          },
          section.cacheType.source,
          { timeout: 20000 }
        )
        .catch(() => {});

      const rows = await this.readCachedRows(page, section);
      if (rows.length > 0) {
        report(`${section.key}: ${rows.length} items`);
        return rows;
      }
    }

    const diagnosis = await page
      .evaluate(() => {
        let types: string[] = [];
        try {
          types = (JSON.parse(localStorage.getItem("items") || "{}").items ?? []).map(
            (i: { type?: string; list?: unknown[] }) => `${i.type}:${i.list?.length ?? "-"}`
          );
        } catch {}
        return {
          url: location.href,
          rows: document.querySelectorAll("main tbody tr").length,
          text: (document.querySelector("main")?.innerText ?? "").slice(0, 160),
          types,
          kit: String(localStorage.getItem("kit")).slice(0, 80),
        };
      })
      .catch(() => null);
    report(`${section.key}: 0 items — ${JSON.stringify(diagnosis)}`);
    return [];
  }

  private async readCachedRows(
    page: Page,
    section: (typeof SECTIONS)[number]
  ): Promise<CachedRow[]> {
    const cached: { type?: string; list?: CachedRow[] }[] = await page
      .evaluate(() => {
        try {
          return JSON.parse(localStorage.getItem("items") || "{}").items ?? [];
        } catch {
          return [];
        }
      })
      .catch(() => []);

    const entry = cached.find((c) => c.type && section.cacheType.test(c.type));
    return (entry?.list ?? []).filter((r) => !r.blocked && itemIdOf(r) !== null);
  }

  /** Detail pages, `concurrency` at a time in their own tabs. */
  private async fetchDetails(
    context: BrowserContext,
    section: (typeof SECTIONS)[number],
    rows: CachedRow[],
    concurrency: number,
    report: (m: string) => void,
    warnings: string[]
  ): Promise<ImportedResult[]> {
    const results: ImportedResult[] = [];
    const queue = [...rows];
    let done = 0;

    const worker = async () => {
      const page = await context.newPage();
      page.setDefaultTimeout(45000);
      try {
        while (queue.length > 0) {
          const row = queue.shift();
          if (!row) break;
          const itemId = itemIdOf(row)!;
          const url = `${BASE}${section.route}/${itemId}/0`;
          try {
            await page.goto(url, { waitUntil: "domcontentloaded" });
            await waitForDetail(page);
            const rawText = await page.evaluate(
              () => document.querySelector("main")?.innerText ?? ""
            );
            const parsed = parseDetailText(rawText);
            if (!parsed.name) {
              warnings.push(`${section.key}/${itemId}: could not read a name`);
              continue;
            }
            results.push({
              externalId: `${section.key}/${itemId}`,
              name: parsed.name,
              // The list's verdict is authoritative: it comes from the
              // same payload the portal renders, while the detail page
              // phrases it differently per section.
              verdict: (row.actions ?? row.results)?.trim() || parsed.verdict || "",
              url,
              rawText,
              description: parsed.description,
              resultContext: parsed.resultContext,
              variantCount: parsed.variantCount,
              riskLociCount: parsed.riskLociCount,
              genesAnalyzed: parsed.genesAnalyzed,
              technicalNotes: parsed.technicalNotes,
            });
          } catch (error) {
            warnings.push(
              `${section.key}/${itemId}: ${(error as Error).message.split("\n")[0]}`
            );
          } finally {
            done++;
            if (done % 20 === 0) report(`${section.key}: ${done}/${rows.length}`);
          }
        }
      } finally {
        await page.close().catch(() => {});
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, rows.length) }, () => worker())
    );

    report(`${section.key}: ${results.length}/${rows.length} captured`);
    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Ancestry is four tabs. Their contents are NOT all in the DOM at once,
   * so each tab is clicked and captured separately, waiting for text that
   * only that tab shows rather than for a generic length change.
   */
  private async fetchAncestry(
    page: Page,
    report: (m: string) => void,
    warnings: string[]
  ): Promise<ImportedAncestry | null> {
    const { parseLineageText, parseNeanderthalText, dedupeNodes } = await import(
      "./parse-ancestry"
    );

    try {
      await page.goto(`${BASE}/results/ancestry`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(
        () => /ancestry composition/i.test(document.querySelector("main")?.innerText ?? ""),
        null,
        { timeout: 45000 }
      );

      const composition = dedupeNodes(await compositionFromDom(page));
      const rawParts: string[] = [
        await page.evaluate(() => document.querySelector("main")?.innerText ?? ""),
      ];

      const maternalText = await this.captureTab(page, "MATERNAL LINEAGE", /haplogroup/i);
      const paternalText = await this.captureTab(page, "PATERNAL LINEAGE", /haplogroup|chromosome/i);
      const neanderthalText = await this.captureTab(page, "NEANDERTHAL", /neanderthal/i);
      for (const t of [maternalText, paternalText, neanderthalText]) if (t) rawParts.push(t);

      report(
        `ancestry captured (${composition.length} top-level regions` +
          `${maternalText ? ", maternal" : ""}${neanderthalText ? ", neanderthal" : ""})`
      );

      return {
        composition,
        maternal: maternalText ? parseLineageText(maternalText) : undefined,
        paternal: paternalText ? parseLineageText(paternalText) : undefined,
        neanderthal: neanderthalText ? parseNeanderthalText(neanderthalText) : undefined,
        rawText: rawParts.join("\n\n----- TAB -----\n\n"),
      };
    } catch (error) {
      warnings.push(`ancestry: ${(error as Error).message.split("\n")[0]}`);
      return null;
    }
  }

  private async captureTab(page: Page, label: string, expect: RegExp) {
    try {
      await page
        .getByRole("button", { name: new RegExp(`^${escapeRe(label)}$`, "i") })
        .first()
        .click();
      await page.waitForFunction(
        (pattern) =>
          new RegExp(pattern, "i").test(document.querySelector("main")?.innerText ?? ""),
        expect.source,
        { timeout: 20000 }
      );
      return await page.evaluate(() => document.querySelector("main")?.innerText ?? "");
    } catch {
      return null;
    }
  }

  private async downloadSectionPdf(page: Page, section: string, dir: string) {
    const button = page.getByRole("button", { name: /^PDF$/i }).first();
    if ((await button.count()) === 0) return null;
    try {
      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 60000 }),
        button.click(),
      ]);
      const target = path.join(dir, "files", download.suggestedFilename() || `${section}.pdf`);
      await mkdir(path.dirname(target), { recursive: true });
      await download.saveAs(target);
      return target;
    } catch {
      return null;
    }
  }
}

/* ------------------------------------------------------------------ */

function itemIdOf(row: CachedRow): number | null {
  return row.itemId ?? row.idImputation ?? null;
}

async function waitForDetail(page: Page) {
  await page
    .waitForFunction(
      () => {
        const t = document.querySelector("main")?.innerText ?? "";
        return t.trim().length > 200 && !/Loading\.\.\./i.test(t);
      },
      null,
      { timeout: 45000 }
    )
    .catch(() => {});
}

function extractBarcode(label: string): string | null {
  return label.match(/\b([A-Z]{2}\d{8}[A-Z]{2})\b/)?.[1] ?? null;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "patient"
  );
}

/**
 * Reads the composition tree out of the DOM. The rendered text flattens
 * the hierarchy into an ambiguous run of name/value pairs, so nesting is
 * taken from element containment, which is where it actually lives.
 * Each node contributes its own name and value and recurses into any
 * nested nodes; anything that does not match the expected shape is
 * skipped rather than attached to a guessed parent.
 */
async function compositionFromDom(page: Page) {
  return page.evaluate(() => {
    interface AncestryNodeDom {
      name: string;
      percent?: number;
      detected?: boolean;
      overview?: string;
      children: AncestryNodeDom[];
    }
    const PERCENT = /^([\d.,]+)\s*%$/;
    const DETECTED = /^(Detected|Not detected)$/i;

    function textOf(el: Element): string {
      return (el.textContent ?? "").trim();
    }

    // A node is any element that directly contains a name line followed
    // by either a percentage or a detected marker.
    function readNode(el: Element): {
      name: string;
      percent?: number;
      detected?: boolean;
      overview?: string;
      children: AncestryNodeDom[];
    } | null {
      const own = [...el.children].filter((c) => c.children.length === 0);
      const labels = own.map(textOf).filter(Boolean);
      if (labels.length < 2) return null;

      const [name, value] = labels;
      const percentMatch = PERCENT.exec(value);
      const detectedMatch = DETECTED.exec(value);
      if (!percentMatch && !detectedMatch) return null;

      const overview = labels.slice(2).find((l) => l.length > 80);
      const children: NonNullable<ReturnType<typeof readNode>>[] = [];
      for (const child of el.children) {
        if (child.children.length === 0) continue;
        const nested = readNode(child);
        if (nested) children.push(nested);
        else {
          for (const grand of child.children) {
            const deeper = readNode(grand);
            if (deeper) children.push(deeper);
          }
        }
      }

      return {
        name,
        percent: percentMatch ? Number(percentMatch[1].replace(",", ".")) : undefined,
        detected: detectedMatch ? /^Detected$/i.test(value) : undefined,
        overview,
        children,
      };
    }

    const main = document.querySelector("main");
    if (!main) return [];

    const roots: NonNullable<ReturnType<typeof readNode>>[] = [];
    const walk = (el: Element) => {
      const node = readNode(el);
      if (node && node.percent !== undefined) {
        roots.push(node);
        return;
      }
      for (const child of el.children) walk(child);
    };
    walk(main);

    return roots;
  });
}
