// Logs into the tellmeGen professionals portal, opens one patient, and
// pulls down every result page and PDF it can reach for them.
//
//   node scripts/tellmegen-fetch.mjs "Maria Paulina Sanchez"
//
// Credentials come from .env.tellmegen (gitignored) or the environment:
//   TMG_EMAIL=...
//   TMG_PASSWORD=...
//
// Speed comes from two things: the login session is saved to disk and
// reused, so only the first run ever logs in, and every wait is on a
// real condition (an element, or the list having actually rendered)
// rather than a fixed sleep or networkidle. Request blocking is NOT
// used; see makeContext for why it breaks this app.
//
// Flags:
//   --shots     also save a full-page screenshot of each view
//   --headed    show the browser (useful if a login challenge appears)
//   --fresh     ignore the saved session and log in again
//   --limit=N   only visit the first N result sections (default: all)
//   --only=a,b  only these sections, e.g. --only=ancestry,traits

import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE = "https://professionals.tellmegen.com";
const ROOT = process.cwd();
const STATE_FILE = path.join(ROOT, ".tellmegen-session.json");
const OUT_ROOT = path.join(ROOT, "tellmegen-export");

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const patientName = args.find((a) => !a.startsWith("--")) ?? "Maria Paulina Sanchez";
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
const WANT_SHOTS = flags.has("--shots");
const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg
  ? onlyArg.split("=")[1].split(",").map((x) => x.trim().toLowerCase()).filter(Boolean)
  : null;

const log = (...m) => console.log(`[tmg] ${m.join(" ")}`);

/* ------------------------------------------------------------------ */
/* credentials                                                         */
/* ------------------------------------------------------------------ */

async function loadCredentials() {
  let email = process.env.TMG_EMAIL;
  let password = process.env.TMG_PASSWORD;

  const envFile = path.join(ROOT, ".env.tellmegen");
  if ((!email || !password) && existsSync(envFile)) {
    const text = await readFile(envFile, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*(TMG_EMAIL|TMG_PASSWORD)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, "");
      if (m[1] === "TMG_EMAIL") email ??= value;
      else password ??= value;
    }
  }

  if (!email || !password) {
    throw new Error(
      "Missing credentials. Create .env.tellmegen with:\n" +
        "  TMG_EMAIL=you@example.com\n  TMG_PASSWORD=yourpassword\n" +
        "(or export TMG_EMAIL / TMG_PASSWORD in your shell)"
    );
  }
  return { email, password };
}

/* ------------------------------------------------------------------ */
/* setup                                                               */
/* ------------------------------------------------------------------ */

// Nothing is blocked, deliberately. Aborting requests for speed was the
// first thing tried and every variant broke the app somewhere: with
// stylesheets aborted the Vite route chunks fail to import and the
// router renders an empty page; with images or fonts aborted the Traits
// and Wellness lists never render their rows; and even aborting only
// third-party analytics leaves those same lists stuck on "No data
// available", because the app's bootstrap awaits one of those scripts.
// Each of those failures is silent: the run "succeeds" and captures an
// empty section. Speed here comes from the reused login session and
// from waiting on real conditions instead of sleeps, not from blocking.

async function makeContext(browser) {
  const useState = !flags.has("--fresh") && existsSync(STATE_FILE);
  const context = await browser.newContext({
    storageState: useState ? STATE_FILE : undefined,
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
  });
  if (useState) log("reusing saved session");

  return context;
}

/* ------------------------------------------------------------------ */
/* login                                                               */
/* ------------------------------------------------------------------ */

// The portal is a Vue SPA: at "domcontentloaded" the body is still
// empty, so every check has to wait for the app to actually render
// something first. Without this, an empty page reads as "no login form",
// which looks exactly like a valid session.
async function waitForApp(page, timeout = 25000) {
  await page
    .waitForFunction(() => (document.body?.innerText ?? "").trim().length > 0, null, {
      timeout,
    })
    .catch(() => {});
}

async function isLoggedIn(page) {
  await waitForApp(page);
  return (await page.locator('input[type="password"]').count()) === 0;
}

// Logging in means "the user list is reachable", not "no password field
// was visible". A saved session that the portal has since invalidated
// still renders a password-free landing page, so trusting that check
// produced a run that sailed past login and then timed out hunting for
// a patient that was never going to load. This races the two possible
// outcomes on /users instead, and only types credentials if the login
// form actually shows up.
async function login(page, { email, password }) {
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
    log("session still valid");
    return;
  }

  if (outcome !== "form") {
    await dumpDebug(page, "login-unclear");
    throw new Error(
      "Neither the user list nor a login form appeared. The portal may be slow " +
        "or down; the page is dumped in tellmegen-export/_debug."
    );
  }

  log("logging in");
  // The login form fields carry name="email" / name="password". Matching
  // on the name matters: the FIRST text input on the page is the language
  // selector, so "first visible text input" picks the wrong one.
  await page
    .locator('input[name="email"], input[type="email"], input[name*="user" i]')
    .first()
    .fill(email);
  await passwordField.fill(password);
  await passwordField.press("Enter");

  // Wait for the login request to actually resolve before navigating.
  // Navigating straight away cancels the in-flight POST and lands back
  // on /login looking exactly like a rejected password.
  await page
    .waitForFunction(() => !location.pathname.startsWith("/login"), null, {
      timeout: 30000,
      polling: 250,
    })
    .catch(() => {});

  await page.goto(`${BASE}/users`, { waitUntil: "domcontentloaded" });
  await accessButton.waitFor({ state: "visible", timeout: 45000 }).catch(async () => {
    await dumpDebug(page, "login-failed");
    throw new Error(
      "Login did not complete. Check the credentials, or run with --headed if " +
        "there is a captcha or two-factor step. Debug files are in tellmegen-export/_debug."
    );
  });
  log("logged in");
}

/* ------------------------------------------------------------------ */
/* finding the patient                                                 */
/* ------------------------------------------------------------------ */

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The user list renders every user as a .v-list-item inside ONE shared
// .v-card, each with its own "Access" button. Scoping to the list item
// (not the card) is essential: a card-level match would resolve to the
// whole list and click the FIRST user's Access button, which for a
// pending account sends that person an access request.
async function openPatient(page, name) {
  log(`looking for "${name}"`);
  if (!page.url().endsWith("/users")) {
    await page.goto(`${BASE}/users`, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /Access/i }).first().waitFor({ timeout: 45000 });
  }

  // The surname and given names sit in separate elements, so match on
  // the first and last word rather than the full string.
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];

  const item = page
    .locator(".v-list-item")
    .filter({ hasText: new RegExp(escapeRe(first), "i") })
    .filter({ hasText: new RegExp(escapeRe(last), "i") });

  const matches = await item.count();
  if (matches !== 1) {
    await dumpDebug(page, "patient-not-found");
    throw new Error(
      matches === 0
        ? `No user matching "${name}" on ${BASE}/users.`
        : `"${name}" matched ${matches} users; refusing to guess which one. ` +
          "Pass a more specific name."
    );
  }

  const label = (await item.first().innerText()).replace(/\s+/g, " ").trim();
  log(`match: ${label}`);

  await item.first().getByRole("button", { name: /Access/i }).click();
  await page.waitForURL("**/user", { timeout: 30000 });
  log("patient view open");
}

/* ------------------------------------------------------------------ */
/* harvesting the results                                              */
/* ------------------------------------------------------------------ */

// Every view renders asynchronously, and the empty state it shows while
// fetching ("No data available" plus a loading strip) looks exactly like
// a genuinely empty section. So readiness means: the loading strip is
// gone AND the empty-state text is gone AND there is real content. If
// the section really is empty the wait simply runs out and the capture
// records the empty state, which is the honest result either way.
async function waitForContent(page, timeout = 45000) {
  await page
    .waitForFunction(
      () => {
        const t = document.querySelector("main")?.innerText ?? "";
        if (/loadingText|Loading\.\.\./i.test(t)) return false;
        if (/No data available/i.test(t)) return false;
        return t.trim().length > 200;
      },
      null,
      { timeout }
    )
    .catch(() => {});
}

// Some lists (Traits, Wellness) only render once they are scrolled into
// view, so a page that looks empty is often just un-scrolled. Scroll in
// steps until the text stops growing, then settle. Without this those
// sections capture as "No data available".
async function revealAll(page, maxSteps = 8) {
  let previous = 0;
  for (let i = 0; i < maxSteps; i++) {
    const length = await page
      .evaluate(() => (document.querySelector("main")?.innerText ?? "").length)
      .catch(() => 0);
    if (i > 0 && length === previous) break;
    previous = length;
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(700);
  }
  await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
}

// After clicking a pagination number or a tab the DOM updates in place,
// so there is no navigation to wait on. Waiting for the text to differ
// from what was showing before the click is what makes the capture the
// NEW page rather than the old one. Tabs whose content is all in the
// DOM already (Ancestry's four) never change, so this times out quickly
// and the capture is deduped instead.
async function waitForChange(page, previous, timeout = 8000) {
  await page
    .waitForFunction(
      (prev) => (document.querySelector("main")?.innerText ?? "") !== prev,
      previous,
      { timeout, polling: 250 }
    )
    .catch(() => {});
}

async function mainText(page) {
  return page
    .evaluate(() => document.querySelector("main")?.innerText ?? "")
    .catch(() => "");
}

async function resultRoutes(page) {
  const routes = await page.evaluate(() =>
    [
      ...new Set(
        [...document.querySelectorAll('a[href^="/results/"]')].map((a) =>
          a.getAttribute("href")
        )
      ),
    ]
  );
  return routes;
}

// Some "tabs" (Ancestry's four) are all rendered into the DOM at once
// and only shown/hidden with CSS, so clicking them yields byte-identical
// text. Writing the same 20k characters four times is just noise, so a
// repeat capture is skipped and noted instead.
const captureHashes = new Map();

function hashText(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return `${h}:${text.length}`;
}

async function capture(page, dir, slug) {
  const text = await page
    .evaluate(() => document.querySelector("main")?.innerText ?? document.body.innerText)
    .catch(() => "");

  const hash = hashText(text);
  const seenAs = captureHashes.get(hash);
  if (seenAs) return { chars: text.length, duplicateOf: seenAs };
  captureHashes.set(hash, `${slug}.txt`);

  await writeFile(path.join(dir, `${slug}.txt`), text);
  await writeFile(path.join(dir, `${slug}.html`), await page.content());
  if (WANT_SHOTS) {
    await page.screenshot({ path: path.join(dir, `${slug}.png`), fullPage: true }).catch(() => {});
  }
  return { chars: text.length };
}

function slugify(s, fallback) {
  const slug = String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return slug || fallback;
}

// A results page may split into tabs (Ancestry does: composition,
// maternal, paternal, Neanderthal) and/or paginate (the condition lists
// do: 1..11). Both are plain buttons, so they are classified by their
// label. Control buttons are never clicked: "Manage locks" changes what
// the patient can see, and Filter/Reset/New user belong to other views.
const CONTROL_BUTTON =
  /^(pdf|manage locks|filter|reset|new user|close|cancel|save|accept|back)$/i;

async function clickableViews(page) {
  const labels = await page.evaluate(() =>
    [...document.querySelectorAll("main button")]
      .map((b) => (b.innerText || "").replace(/\s+/g, " ").trim())
      .filter((t) => t && t.length < 40)
  );

  const views = [];
  for (const label of labels) {
    if (CONTROL_BUTTON.test(label)) continue;
    const isPage = /^\d+$/.test(label);
    views.push({ label, kind: isPage ? "page" : "tab" });
  }
  return views;
}

async function downloadPdf(page, outDir, slug) {
  const button = page.getByRole("button", { name: /^PDF$/i }).first();
  if (!(await button.count())) return null;
  try {
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 45000 }),
      button.click(),
    ]);
    const target = path.join(outDir, "files", download.suggestedFilename() || `${slug}.pdf`);
    await mkdir(path.dirname(target), { recursive: true });
    await download.saveAs(target);
    return path.relative(ROOT, target);
  } catch {
    return null;
  }
}

async function harvest(page, outDir) {
  await waitForContent(page);
  await capture(page, outDir, "00-patient-home");

  let routes = await resultRoutes(page);
  if (ONLY) routes = routes.filter((r) => ONLY.some((o) => r.includes(o)));
  log(`${routes.length} result sections: ${routes.join(", ")}`);

  const inventory = [];
  let index = 1;

  for (const route of routes.slice(0, LIMIT)) {
    const section = slugify(route.replace("/results/", ""), "section");
    const prefix = String(index).padStart(2, "0");
    index++;

    await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
    await waitForContent(page);
    await revealAll(page);
    await waitForContent(page, 20000);

    const views = await clickableViews(page);
    if (views.length > 1) {
      for (const view of views) {
        const before = await mainText(page);
        await page
          .getByRole("button", { name: new RegExp(`^${escapeRe(view.label)}$`, "i") })
          .first()
          .click()
          .catch(() => {});
        await waitForChange(page, before);
        await waitForContent(page, 20000);
        await revealAll(page, 4);
        const name =
          view.kind === "page" ? `page-${view.label.padStart(2, "0")}` : slugify(view.label, "tab");
        const slug = `${prefix}-${section}-${name}`;
        const cap = await capture(page, outDir, slug);
        inventory.push({
          route,
          [view.kind]: view.label,
          chars: cap.chars,
          file: cap.duplicateOf ?? `${slug}.txt`,
          ...(cap.duplicateOf ? { sameContentAs: cap.duplicateOf } : {}),
        });
        log(
          `captured ${section} / ${view.label} (${cap.chars} chars` +
            (cap.duplicateOf ? `, same content as ${cap.duplicateOf}` : "") +
            ")"
        );

        // Not every numbered button is real pagination: on the shorter
        // lists the whole table already fits on one page and clicking
        // "2" changes nothing. Once a page click yields identical
        // content, stop clicking the rest instead of spending a timeout
        // on each one.
        if (view.kind === "page" && cap.duplicateOf) {
          log(`${section}: pagination does not change the list, skipping the rest`);
          break;
        }
      }
    } else {
      const slug = `${prefix}-${section}`;
      const cap = await capture(page, outDir, slug);
      inventory.push({ route, chars: cap.chars, file: cap.duplicateOf ?? `${slug}.txt` });
      log(`captured ${section} (${cap.chars} chars)`);
    }

    const pdf = await downloadPdf(page, outDir, `${prefix}-${section}`);
    if (pdf) {
      inventory.push({ route, kind: "pdf", file: pdf });
      log(`downloaded PDF for ${section}`);
    }
  }

  await writeFile(path.join(outDir, "inventory.json"), JSON.stringify(inventory, null, 2));
  return inventory;
}

/* ------------------------------------------------------------------ */
/* debug                                                               */
/* ------------------------------------------------------------------ */

async function dumpDebug(page, slug) {
  const dir = path.join(OUT_ROOT, "_debug");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${slug}.html`), await page.content()).catch(() => {});
  await writeFile(
    path.join(dir, `${slug}.txt`),
    `url: ${page.url()}\n\n` + (await page.evaluate(() => document.body?.innerText ?? ""))
  ).catch(() => {});
  await page.screenshot({ path: path.join(dir, `${slug}.png`), fullPage: true }).catch(() => {});
  log(`debug dump written to ${path.relative(ROOT, dir)}/${slug}.*`);
}

/* ------------------------------------------------------------------ */

async function main() {
  const started = Date.now();
  const credentials = await loadCredentials();

  const outDir = path.join(OUT_ROOT, slugify(patientName, "patient"));
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: !flags.has("--headed") });
  const context = await makeContext(browser);
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  try {
    await login(page, credentials);
    await context.storageState({ path: STATE_FILE });

    await openPatient(page, patientName);
    const visited = await harvest(page, outDir);

    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    log(
      `done in ${seconds}s: ${visited.filter((v) => v.kind !== "pdf").length} views, ` +
        `${visited.filter((v) => v.kind === "pdf").length} PDFs -> ${path.relative(ROOT, outDir)}`
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((e) => {
  console.error(`\n${e.message}\n`);
  process.exit(1);
});
