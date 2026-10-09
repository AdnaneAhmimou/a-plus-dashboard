# A-Plus Laboratory — Design System

> **⚠️ The visual system below is NOT in force. As of 2026-09-20 the app
> uses stock shadcn/ui with its default neutral palette, by explicit
> decision: the brand purple was judged too heavy across the UI.**
>
> What that means in practice:
> - `src/app/globals.css` holds the unmodified shadcn neutral theme
>   (light + dark). Primary is near-black, surfaces are white and grey.
> - Cards are the stock shadcn card (border + `shadow-sm`). No frosted
>   glass, no body radial washes, no translucent shell.
> - Charts use a neutral grey ramp; the globe draws neutral markers.
> - The only non-shadcn tokens are the status colours
>   (success / warning / info / destructive surfaces), kept because a
>   medical UI has to distinguish normal / monitor / out-of-range and
>   shadcn ships only `destructive`.
>
> Sections 1 to 3 and the component styling notes below describe the
> previous brand system. They are kept as a record of what was built and
> why, so it can be reinstated deliberately rather than rediscovered.
> **Do not apply them to new work without being asked.** Everything from
> §4 onward that describes behaviour, data flow, routes and architecture
> is still accurate and still applies.

## 1. Visual Theme & Atmosphere (superseded, see the note above)

The portal reads as calm and trustworthy rather than clinical-sterile: a
soft near-white lavender-gray canvas holds crisp white cards, with the
brand purple — sampled straight from the A+ microscope-mark logo — used
for anything actionable. Numbers (lab values, IDs, timestamps) are set in
a monospace face so results scan cleanly in a list. Status is always
color **+ text**, never color alone — critical for a medical UI. Cards
are plain: a thin border, a subtle shadow, no gradients, no hover
animation, no texture. The interface should feel like a well-made SaaS
dashboard, not a marketing page — clarity over decoration.

**Key characteristics:**
- Near-white cool canvas (`#F7F5F8`) with white (`#FFFFFF`) elevated cards
- One brand purple family, sampled from the logo — `#8A237F` primary, `#5C1657` deep, `#A83D9E` mid — used for primary actions, active nav, focus rings, and chart accents
- Status colors (ok/warn/high/info) always paired with a soft tint background for badges/chips
- Numeric data (results, IDs, timestamps) set in JetBrains Mono — everything else in Hanken Grotesk, with Archivo for headings
- A translucent, blurred top bar (`backdrop-filter: blur`) that stays pinned above scrolling content
- Soft, purple-tinted card shadows — never pure black
- 11–18px radii depending on surface size (chips are full pill); nothing sharp-cornered
- Plain cards everywhere: border + shadow only, no motion/gradient/texture effects

## 2. Color Palette & Roles (superseded, see the note above)

### Brand purple (sampled from the A+ logo)
| Token | Hex | Role |
|---|---|---|
| **Purple** | `#8A237F` | Primary — buttons, links, active nav, focus rings, chart lines |
| **Purple Deep** | `#5C1657` | Gradient partner for purple (sidebar callout); darker hover state |
| **Purple Mid** | `#A83D9E` | Ring/border accent on "in progress" states (journey stepper) |
| **Purple Soft** | `#F5E9F4` | Chip/badge fill, active nav-item background |
| **Purple Soft 2** | `#FBF4FA` | Lighter gradient stop (banners) |
| **Purple Line** | `#ECD8EA` | Border on purple-tinted cards/banners |

### Neutrals
**The neutrals are true neutrals, not brand-tinted.** They were purple-
tinted originally (`#F7F5F8` canvas, `#F5E9F4` fills, purple-cast
shadows) and that wash across every panel read cheap and unprofessional.
The brand purple now appears only on marks that *mean* something — the
logo, primary actions, active nav, links, chart accents — never as a
surface tint. Shadows are neutral (`rgba(16,24,40,…)`) for the same
reason: coloured shadows were a big part of the amateur look.

| Token | Hex | Role | Contrast on white |
|---|---|---|---|
| **Canvas** | `#F6F7F9` | Page background (+ fixed brand washes, see Cards) | — |
| **Card** | `#FFFFFF` | Card/surface fill | — |
| **Ink** | `#161A1F` | Primary heading/body text | 17.5:1 |
| **Ink Soft** | `#475467` | Secondary body text | 7.7:1 |
| **Muted** | `#667085` | Labels, metadata, timestamps | 5.0:1 |
| **Faint** | `#98A2B3` | **Decorative only** — chevrons, dividers, disabled icons | 2.6:1 |
| **Line** | `#E6E8EC` | Default border/divider | — |
| **Line Soft** | `#F2F4F7` | Track backgrounds, chips, icon-badge fills | — |

**Faint never carries text.** At 2.6:1 it fails AA, so it's reserved for
decoration; any real label uses Muted (5.0:1) or darker.

### Semantic (status)
| Token | Hex | Soft fill | Role |
|---|---|---|---|
| **Ok** | `#2E9A6B` | `#E1F3EB` | Normal/healthy results, success states |
| **Warn** | `#C98A1E` | `#F8EED6` | "To monitor" results, pending/in-progress |
| **High** | `#C63F52` | `#F8E1E4` | Out-of-range/critical results, destructive actions |
| **Info** | `#3E6FB0` | `#E4ECF6` | Informational badges (e.g. analysis counts) |

### Shadows (purple-tinted, never pure black)
```css
--shadow-sm: 0 1px 2px rgba(30,24,34,.05), 0 4px 14px rgba(92,22,87,.05);
--shadow:    0 1px 2px rgba(30,24,34,.05), 0 12px 32px rgba(92,22,87,.07);
--shadow-lg: 0 8px 24px rgba(30,24,34,.08), 0 30px 60px rgba(92,22,87,.12);
```

### Usage rules
- **Purple is the only color that means "primary action."**
- **Status colors always carry a text label**, not just a colored dot — e.g. a green dot *and* the word "Normal", never the dot alone.
- **JetBrains Mono is reserved for numbers** — lab values, units, dates in data tables, dossier IDs. Never for body prose.

## 3. Typography

Three-typeface system:

| Role | Family | Weights used |
|---|---|---|
| **Display** | Archivo | 500–900 |
| **Body** | Hanken Grotesk | 400–800 |
| **Mono** | JetBrains Mono | 500–700 |

Loaded via `next/font/google` as `--font-archivo`, `--font-hanken`, `--font-jbmono`.

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Page title (H1) | Archivo | 28–30px | 800 | `letter-spacing: -0.6px` |
| Section title (H2) | Archivo | 19–20px | 800 | |
| Card title (H3) | Archivo | 15–20px | 800 | |
| Eyebrow | Hanken Grotesk | 12px | 700 | Uppercase, `letter-spacing: 0.5px`, Purple |
| Body | Hanken Grotesk | 14–15px | 500–600 | |
| Label / metadata | Hanken Grotesk | 12–13px | 600–700 | Muted color |
| Numeric value | JetBrains Mono | 13–44px (context-dependent) | 600–800 | Dossier IDs, lab values, dates, chart axis labels |
| Button label | Hanken Grotesk | 13–15px | 700 | |

## 4. Components (shadcn/ui conventions)

### Base primitives are the real shadcn code
`Button`, `Input`, `Label`, `Form`, `Card` in `src/components/ui/` are the
**actual official shadcn components**, installed via `npx shadcn add
button input label form card` and left structurally untouched — only the
CSS variables in `globals.css` differ, which is how shadcn theming is
meant to work. This requires the standard shadcn base layer in
`globals.css` (`@layer base { * { @apply border-border outline-ring/50; }
body { @apply bg-background text-foreground; } }`), since the official
components assume it exists — without it, a bare `border` class falls
back to `currentColor` instead of the theme's border token. **Don't
hand-roll a shadcn primitive — pull it with the CLI, then restyle only
via the existing CSS variables.**

### Cards: frosted glass, no motion (superseded — cards are the stock shadcn card)
Every card is a `<Card>`, which applies the `.glass-surface` component
class (`globals.css`): a white vertical gradient (90% -> 70% opacity),
`backdrop-filter: blur(18px) saturate(160%)`, a hairline neutral border,
and a white inset highlight along the top edge for the lit "gloss" line.
`@supports not (backdrop-filter)` falls back to a solid card rather than
a washed-out translucent one.

For the blur to be visible at all, something has to sit behind it — so
`body` paints three very low-opacity brand radial washes
(`background-attachment: fixed`) that the glass picks up at its edges.
This is why the layout wrappers must **not** set `bg-background`: an
opaque wrapper would cover those washes and the glass would go flat.

**History, because this reversed twice.** The original build wrapped
cards in Aceternity motion components (`glowing-effect`, `wobble-card`);
that was rejected for looking broken and distracting — a noise texture
rendering as loud static, content shifting under the cursor. Cards were
then plain for a long stretch. The current frosted treatment was asked
for explicitly and is a different thing from what was rejected: it is
**static**. There is still no hover animation, no mouse-reactive effect,
and no content that moves under the pointer. Keep it that way — the
objection was to motion and noise, not to depth.

### App shell
`Sidebar` and `TopBar` (`src/components/dashboard/`) are shared between
the patient portal and the admin panel — not duplicated. `Sidebar` takes
`navItems` / `sectionLabel` / `settingsHref` props (`PATIENT_NAV` vs
`ADMIN_NAV`, both exported from the component); `TopBar` takes a
`searchPlaceholder` prop. Each area's `layout.tsx` (`src/app/dashboard/`,
`src/app/admin/`) supplies its own props and its own role gate.

**Sidebar** — 250px fixed, white, right border (`Line`), sticky full-height.
Logo top, nav items below (12px gap, 11px radius, active state = Purple
Soft background + Purple text/icon), settings link pinned to the bottom.

**Top bar** — sticky, translucent white (`rgba(247,245,248,0.85)`) with
`backdrop-filter: blur(12px)`. Search input left, notification bell (dot
badge, no count) + avatar + name/role right. No role-switcher in the real
app — role comes from the authenticated session and is shown as a static
label.

### Admin panel
`src/app/admin/` — role-gated to `ADMIN` / `SUPER_ADMIN` at three layers:
`middleware.ts` (redirects a `PATIENT` session away from `/admin/*` to
`/dashboard`, and the reverse for `/dashboard/*`), `admin/layout.tsx`
(re-checks role server-side, redirects otherwise), and every
`/api/admin/*` route (checks `session.role` before touching the
database). `LoginForm` reads the role from the login response and routes
to `/admin` or `/dashboard` accordingly — there's no separate admin login
screen, same form for everyone.

- **`/admin/patients`** — every `User` with `role: PATIENT`, in a plain
  `<table>` inside a zero-padding `Card` (name, email, box number,
  `KitStatusBadge`, chevron link). Search is a client-side filter over
  the already-fetched list (`PatientTable`, `src/components/admin/`) —
  no separate search API, consistent with how the rest of the app favors
  server-component data fetching over client round-trips.
- **`/admin/patients/[id]`** — `PatientInfoCard` (`src/components/admin/`)
  shows contact info with an inline **Edit** toggle
  (`PATCH /api/admin/patients/[id]`, react-hook-form + zod, same pattern
  as every other form in the app) for `firstName`/`lastName`/`phone`.
  **Email is deliberately not editable here** — it's the login
  identifier, and letting an admin silently change it with no
  re-verification step would be a real account-security hole, not just
  a missing feature. Below that, the same `JourneyRail` component the
  patient sees on their own dashboard, so the two views are visually
  consistent. An `AdvanceStatusButton` calls
  `POST /api/admin/patients/[id]/advance-status`, which moves the
  patient's box `kitStatus` exactly one step forward (`getNextKitStatus`
  in `kit-status.ts`) and stamps the matching timestamp field. It's
  deliberately **forward-only, one step at a time** — no arbitrary status
  picker — so the pipeline can't be corrupted by a stray click. There is
  no bulk/undo action yet.
- **Bootstrapping the first admin**: there's no admin-invite UI. A new
  admin is created by registering a normal account (always `PATIENT` by
  design — public registration must never accept a role) and promoting
  it with a direct `UPDATE users SET role = 'ADMIN' WHERE email = ...`.
  This is intentional for now; don't build a self-serve "become admin"
  path without being asked.

### Box inventory — the real source of truth for box numbers
A `Box` is its own model (`prisma/schema.prisma`), not a free-text field
on `User`. This exists because early on, registration just accepted any
string as a "box number" with no validation — anyone could type a made-up
number, or the same number twice. `kitStatus` and its timestamp fields
(`pickupRequestedAt` etc.) live on `Box`, not `User`, because the box —
not the account — is the physical thing that actually moves through
pickup → delivery → testing → results. `User.box` is the (optional,
one-to-one) relation back to it.

**Lifecycle**: `AVAILABLE` (added to inventory, unused) → `SENT` (handed
to a courier heading to a prospective client — optional step, not
required before association) → `ASSOCIATED` (a patient has registered
with this exact box number). Once `ASSOCIATED`, the box's `kitStatus`
takes over as the tracked pipeline (`NOT_REQUESTED → ... →
RESULTS_READY`), same enum and same `JourneyRail` component the patient
already sees.

**`/admin/boxes`** — inventory list (`BoxTable`) with a status badge, the
associated patient (linked, or "Not associated"), and that patient's kit
progress badge if any. `AddBoxForm` (`POST /api/admin/boxes`) adds a new
box in `AVAILABLE` status — this is the lab registering a newly-purchased
box before anyone has it. `MarkSentButton`
(`POST /api/admin/boxes/[id]/mark-sent`) flips an `AVAILABLE` box to
`SENT`; only valid from `AVAILABLE`.

**Registration now validates against real inventory**
(`POST /api/auth/register`): looks up the `Box` by the number the patient
typed, 404s with "Box number not recognized..." if it doesn't exist,
409s with "This box is already registered to another account." if
`box.userId` is already set. On success, user creation and box
association happen in one `$transaction` — so a box can never end up
half-linked to an account. This is what makes "the client goes and
creates the account with the box number" actually mean something: the
number has to correspond to a box the lab really has.

**Don't** let a box's `kitStatus` be set without it having gone through
`ASSOCIATED` first (i.e., without a `userId`) — the whole point of the
inventory model is that "in progress" only makes sense once a box is
tied to a real patient.

### DNA test reports
`Report` (`prisma/schema.prisma`) — one row per uploaded PDF, belongs to
a `Box` (not directly to a `User`), because a report is the output of a
specific test. **Versioned, not overwritten**: uploading a new PDF for a
box that already has one creates a new row with `version` incremented
(`@@unique([boxId, version])`), so the full history stays queryable —
never delete/replace a `Report` row to "correct" a result.

**Storage: PDF bytes live in Postgres (`Bytes` column), not local disk
and not a cloud bucket.** This was a deliberate choice, not a shortcut:
there's no cloud storage credentials configured for this project, and
local-disk storage looks fine in dev but silently breaks the moment this
app runs anywhere with an ephemeral filesystem (most serverless hosts).
Storing bytes in the same Postgres database that already backs
everything else means dev and any future deployment behave identically,
with no extra service to configure. Revisit this only if report volume
or file size ever grows enough for it to matter — it doesn't at "one PDF
per patient test."

**`POST /api/admin/patients/[id]/reports`** (admin-only, `multipart/form-data`)
— validates the upload three ways before touching the database: MIME
type must be `application/pdf`, size must be ≤ 10 MB, and the file's
first bytes must actually be `%PDF-` (a spoofed `Content-Type` header
is a real, trivial attack otherwise). On success, creates the next
`Report` version **and**, if the box isn't already `RESULTS_READY`,
advances it there and stamps `resultsReadyAt` — both in one
`$transaction`. This is deliberate: uploading the report *is* what
completes the pipeline, so there's no separate "mark results ready"
click that could get out of sync with whether a PDF actually exists.

**`GET /api/reports/[id]/download`** — the only read path for report
bytes. Authorization is exactly two cases: an `ADMIN`/`SUPER_ADMIN`
session, or `session.sub === report.box.userId` (the owning patient).
Anyone else gets 403. It's a plain `GET` specifically so it works as a
bare `<a href>` — the browser sends the existing httpOnly session cookie
automatically, no client-side fetch/blob juggling needed.

**`ReportList`** (`src/components/reports/` — shared, not admin-only)
renders the version history with a download link per row.
`showUploader` toggles whether the uploader's name is shown; the admin
patient page shows it, the patient's own `/dashboard/results` page
doesn't (a patient doesn't need to know which staff member uploaded
their file).

**Correctness rule that made this possible**: the generic admin
"advance status" action (`getNextKitStatus` in `kit-status.ts`) is
capped at `TESTING` — it can *not* jump a box to `RESULTS_READY`. That
transition only happens inside the report-upload route. This was fixed
specifically because it would otherwise let `RESULTS_READY` (and the
Overview page's "Completed reports" count) be true with no PDF behind
it. Don't re-add `TESTING → RESULTS_READY` to the generic advance map.

### AI-structured results (category cards → list → detail)
Modeled on a reference third-party genetic-testing dashboard: a patient's
box results are shown as 6 fixed category cards (Genetic vulnerability to
health conditions, Hereditary conditions, Pharmacology, Traits, Wellness,
Ancestry — the `AnalysisCategory` enum in `prisma/schema.prisma`, in that
fixed order via `CATEGORY_ORDER` in
`src/lib/dashboard/analysis-categories.ts`), each opening to a list of
individual analyses, each opening to a rich detail page (probability
bars, a technical variant/gene table, description, technical notes,
bibliography). Shared, plain-`<Card>` components
(`src/components/results/{CategoryGrid,ResultsList,ResultDetail,ProbabilityBars}.tsx`)
render identically for admin (`/admin/patients/[id]/results/...`) and
patient (`/dashboard/results/[category]/...`) — same components, just a
different `basePath` prop, same pattern as `ReportList`'s `showUploader`
toggle.

**One PDF = one trait, not one consolidated report.** The real source
data (exported from the reference platform) is one PDF per
condition/trait — "Bone mineral density.pdf", "Hereditary hemochromatosis
type 1 (HFE gene).pdf", etc., dozens per patient, uploaded as a batch.
This replaced an earlier design (a single consolidated multi-category PDF
per box) after seeing the real export format — see the postmortem below.

**Data model**: `AnalysisResult` belongs to a `Box` and links back to the
specific `Report` it was extracted from via `sourceReportId`.
Re-analyzing a report deletes and re-inserts **only that report's**
`AnalysisResult` rows (`deleteMany({ where: { sourceReportId } })`), never
the whole box's — a box now accumulates results from many independently
uploaded PDFs, so re-analyzing PDF #12 must never touch the 11 already
extracted. (This was a real bug during the multi-PDF rework: the
original single-report-per-box code scoped the delete by `boxId`, which
silently wiped every other trait's results on each new upload.)

**Pipeline: PDF → deterministic parse → minimal AI classification →
structured row.** The admin selects and uploads a batch of PDFs at once
(`UploadReportForm`, `<input multiple>`) — each file is uploaded *and*
analyzed automatically in sequence, with a per-file status list (no
separate manual "Analyze" click per file needed). Per file:
`extractStructuredAnalysis` (`src/lib/ai/extract-analysis.ts`) runs
`pdf-parse` (wrapped in try/catch — some real exports fail at the
PDF-library level with `bad XRef entry` or similar; this surfaces as a
clean per-file error in the upload UI instead of crashing the batch),
then hands the text to `prepareReportText`
(`src/lib/ai/prepare-report-text.ts`) and a category-classification call,
then writes the row.

**Why deterministic parsing replaced full-AI extraction (anti-hallucination
architecture).** The original version sent the entire report text to
Claude and asked it to produce every field — result, gene list, risk loci
count, bibliography, description — as JSON. Two problems with that: (1)
gene lists and citations are exactly the kind of long, structured,
easy-to-transcribe-wrong content LLMs are worst at reproducing exactly,
and (2) it's needless risk, because these source PDFs turned out to be
*extremely* regularly structured once inspected (verified against all 20
real sample files in `/results` before writing the parser). Every report
uses the same handful of literal section headers in whatever order they
appear — `Your risk is` / `Your result is` / `Your genetic results
indicate`, `Number of risk loci`, `Genes analyzed`, `Causes and
non-genetic risk factors`, `Symptoms`, `Prevention`, `Disease
management`, `Technical report`, `Bibliography`, `Study limitations` —
so `prepareReportText` extracts **every one of those fields with plain
string matching**, not a language model:

- Result headline, risk loci count, variant count — regex against known
  label text.
- Gene list — collects ALL-CAPS symbol-looking lines following each
  `Genes analyzed` header (multi-column PDF layouts repeat the header
  once per column; every repeat is collected and deduped into one `Set`).
  Monogenic/carrier reports don't have this header at all — instead a
  variant-table row sometimes collapses into one jammed token during
  text extraction (column order isn't even consistent row-to-row: both
  `HFErs1800562GG` and `rs1799945HFECG` occur in real files), so two
  regexes recover the gene symbol from either ordering.
- Explanatory sections (causes, symptoms, prevention, disease management,
  technical report, study limitations) — sliced verbatim between
  consecutive known headers. Not rewritten or summarized by AI: the
  source prose is already patient-appropriate, and copying it exactly has
  zero hallucination risk by construction.
- Bibliography — split into individual citations by flushing on a line
  ending in `.` or `]` (verified this heuristic against the real
  reference lists rather than assumed; PDF text extraction wraps a single
  long citation across 2+ lines, so a naive "one line = one citation"
  split would be wrong).

**The AI's job is reduced to exactly one narrow decision**: which of the
6 dashboard categories a trait belongs in
(`requestCategoryClassification` in `src/lib/ai/openrouter.ts`), given a
~800-character excerpt (title + intro + result headline only — not the
full report). A single bounded classification call has a fundamentally
smaller hallucination surface than open-ended transcription, and its
output is validated against the same `analysisCategorySchema` zod enum
either way. If a PDF doesn't match the expected structure at all (no
recognizable result headline found), the pipeline throws a clear
`AnalysisExtractionError` rather than guessing.

**Risk-level color is deliberately conservative — see
`src/components/results/RiskGauge.tsx`.** Only headlines that explicitly
say "risk" get the success/warning/destructive traffic-light treatment,
since that's the one case where low/medium/high has an unambiguous
direction. Carrier-status wording (`Variant absent`/`present`) maps to
success/info — "present" is informational, not alarming, since a single
copy of a recessive variant is a carrier finding, not a diagnosis.
Biomarker "levels"/"density" results stay neutral (info) always,
regardless of Low/Average/High — this app has no per-trait clinical
knowledge to know whether low or high is the favorable direction for a
*specific* biomarker (low HDL is bad; low LDL is good), so it doesn't
guess. Covered by `RiskGauge.test.ts`.

**Provider: OpenRouter, not the Anthropic API directly** — the user's
explicit choice (`OPEN_ROUTER_API_KEY` in `.env`, not
`ANTHROPIC_API_KEY`), calling `anthropic/claude-sonnet-4.5` through
OpenRouter's OpenAI-compatible `/chat/completions` endpoint via a plain
`fetch` (no SDK — OpenRouter doesn't ship one, and its wire format isn't
the Anthropic Messages API shape). If `OPEN_ROUTER_API_KEY` is unset, the
analyze route returns a clear 503 (`OpenRouterNotConfiguredError`) rather
than failing silently or fabricating data.

**`pdf-parse` import gotcha**: import from `pdf-parse/lib/pdf-parse.js`,
never the package root (`pdf-parse`). The package's `index.js` runs a
debug block at *import* time whenever `module.parent` is falsy —
harmless in a normal Node script, but Next.js's build-time page-data
collection triggers exactly that condition and crashes the production
build looking for a fixture file that only exists inside the package's
own `node_modules` folder. See `src/types/pdf-parse-lib.d.ts` for the
ambient type declaration this requires (the subpath has no shipped
types). Separately, `pdf-parse` (via `pdfjs-dist`) throws on a subset of
real-world exports — observed non-deterministically on the same file
across separate process runs (`bad XRef entry`, `Illegal character: 41`)
— so every call site wraps it in try/catch and surfaces a clean per-file
error instead of crashing.

**"Why not send the PDF directly to the model" / "why not convert to
docx"**: same reasoning either way — extracting text first (already the
existing behavior, not new) keeps the request provider-agnostic, costs
far fewer tokens than a binary/vision upload, and — now that almost
nothing is AI-generated — there's very little left in the request for
the model to get wrong. Converting to DOCX wouldn't reduce tokens further
than clean extracted text already does; it would just add a fragile
conversion dependency for no benefit.

### Result detail UI — three templates, one per report shape
A single layout for every result read as thin, because the source
reports aren't one shape. `detectResultType()`
(`src/lib/dashboard/result-type.ts`) sorts them into three, derived from
the result headline the parser already captures verbatim, and
`ResultDetail` dispatches to the matching template in
`src/components/results/templates/`:

| Type | Headline wording | Hero |
|---|---|---|
| `RISK` | "Medium risk" | `RiskDonut` (ordinal Low/Medium/High) + `RiskSpectrum` + `PopulationDonut` |
| `LEVELS` | "Average levels", "Low density" | `DistributionCurve` (bell curve, marker on the patient's zone) |
| `CARRIER` | "Variant present/absent" | Binary status hero, no gauge — there's no scale to plot |

Derived at render time rather than stored as a column: it's a pure
function of wording already captured, so existing rows needed no
backfill when this shipped.

**Colour is assigned by what the zone means, not by taste**, and the
status palette was run through the dataviz skill's validator rather than
eyeballed. It passes with two conditions that every chart here honours:
adjacent-pair CVD separation lands in the 6–8 band and the amber is
under 3:1 contrast, so **every zone carries a visible text label and the
segments are separated by a gap** — colour never carries the finding
alone. Two deliberate restraints on top of that:
- `RISK` is the only type that gets traffic-light tones, because it's
  the only one where low/medium/high has an unambiguous direction.
- `LEVELS` uses a **single-hue sequential ramp**, never good/bad colour.
  Whether high or low is favourable is biomarker-specific clinical
  knowledge this app doesn't have (low HDL is bad, low LDL is good), so
  it must not imply one. The copy says "genetically predicted", never
  "normal"/"abnormal", and a callout states it isn't a measured value.
- `CARRIER` "present" is informational (info), never destructive —
  one copy of a recessive variant is a carrier finding, not a diagnosis.

Everything below the hero is shared (`blocks/ResultSections.tsx`) since
it comes from the same source-PDF sections regardless of shape: what
this means, what you can do, genes, disclaimer, causes, symptoms,
technical report, bibliography.

**"What you can do" is split, not summarised.** `splitIntoActionItems()`
breaks the Prevention (or Disease-management) section into sentences and
shows each verbatim as a checklist row, with a trailing-colon intro
lifted out as a lead-in. No AI, no rewriting — the same anti-hallucination
rule as the extractor. If the text doesn't split into at least two
items it renders as prose instead.

**Interactive bits**: gene chips collapse past 12 with a "+N more"
toggle (some panels analyse 300+), long verbatim sections clamp with
"Read more", and donut/spectrum/curve zones carry hover affordances and
`<title>` tooltips. The category-list view (`ResultsList`) shows a
tone dot per row, using the *same* `getSummaryTone()` the detail charts
use so a result can't be one colour in the list and another on its page.

### Ancestry section — one profile, four tabs, a globe

Ancestry is a different shape from the other five categories: one profile
per patient with four facets, not a list of traits. So it has its own
Prisma model (`AncestryProfile`, one row per box) and the Ancestry card
routes to `src/components/results/ancestry/AncestrySection.tsx` instead
of `ResultsList`. Both `[category]/page.tsx` files (patient and admin)
special-case `category === "ANCESTRY"`; the overview pages count a
profile as one "analysis" so the card reads "Composition, lineages and
Neanderthal DNA" rather than "No analyses yet".

Tabs (a `role="tablist"` in a glass pill, active tab filled brand purple):

- **Ancestry composition** — stacked bar + list (dot, region, %) on the
  left, the globe on the right with one marker per region, sized by
  share and labeled "Europe 81.4%". Categorical colours are the status
  hues in fixed order (primary, info, success, warning), extra regions
  fall back to muted grey; every slice is always named and numbered in
  the list, so colour is never the only carrier.
- **Maternal lineage** — hero card (haplogroup badge, `H → H1` chips,
  one-line explanation of mtDNA inheritance), a migration timeline
  (era, haplogroup, expandable description; the last step is "yours")
  and the globe drawing arcs between consecutive haplogroup origin
  areas.
- **Paternal lineage** — same layout when a Y haplogroup exists; when
  it is null an info card explains that the Y chromosome is absent (XX)
  and that a male paternal relative's test carries the line.
- **Neanderthal** — three stat cards (% of genome, variants detected,
  vs average), a "you versus the average" bar pair (average derived as
  `percent / (1 + vsAverage/100)`, only when both inputs exist) and the
  source's educational sections as collapsible info cards.

Map: two projections of the same data, switched by a Globe/Flat toggle
(`AncestryMap.tsx`), with the choice remembered in localStorage across
all four tabs. `GlobeAncestry.tsx` (cobe) is the CDN demo globe with the
demo bits removed (no fake traffic counters, no pyramid).
`FlatMapAncestry.tsx` is an equirectangular dot-matrix map drawn from a
precomputed land mask (`scripts/build-world-mask.ts` bakes world-atlas
geometry into a 1.7 KB base64 bitmask, so no map library ships to the
browser). The flat view exists because a globe always hides half the
world — markers in the Americas and East Asia cannot be seen together
without dragging — and because its labels are plain SVG text that works
in every browser. Where lineage markers cluster, flat-map labels are
placed by marker weight and dropped when they would overlap; the dot,
the tooltip and the list beside the map still carry every name. Coordinates come from `src/lib/dashboard/ancestry-geo.ts`,
approximate region centroids and commonly cited haplogroup origin areas;
anything not in those tables is simply not drawn, never guessed. The
floating labels use CSS Anchor Positioning (Chromium only); the globe,
arcs and drag work everywhere and the list beside it always carries the
numbers.

No ancestry PDF parser exists yet (none of the sample PDFs is an
ancestry report). `scripts/seed-ancestry-sample.ts` seeds an
illustrative profile for review, clearly marked as sample data.

### Admin Overview (`/admin`) — Analytics & Statistics
Real numbers only, computed live from Postgres on every request (server
component, no separate API, same pattern as the rest of the admin
pages) — nothing here is mocked or hand-maintained.

- **Stat row** (`StatCard`, now actually wired to data instead of the
  unused placeholder it started as): total patients, boxes
  pending pickup/delivery (`PICKUP_REQUESTED + PICKED_UP + IN_TRANSIT`),
  boxes in testing, completed reports (`RESULTS_READY` count — see the
  correctness rule above for why this number can be trusted), and
  available inventory.
- **"Samples by stage"** — `DonutRing` (already built for the patient
  dashboard's health-score visual, reused here) plus a text legend,
  covering all six `KitStatus` values via `ALL_KIT_STATUSES` so a
  currently-empty bucket still shows as a zero row rather than silently
  disappearing. Segment colors come from `kitStatusColor()`, which maps
  each status's existing badge *tone* (muted/primary/info/warn/success)
  to a solid CSS-var color — one tone system, reused everywhere a status
  needs a color, not a second palette invented for charts.
- **"New patients — last 6 months"** — `BarChart`
  (`src/components/dashboard/BarChart.tsx`), plain CSS bars bucketed by
  registration month in application code (not a SQL `date_trunc`, not a
  charting library) — the data volume here never justifies either.
- **`StatCard` gained two tones** (`muted`, `warn`) it didn't have before,
  to match the full tone set `Badge`/`KitStatusBadge` already use — do
  that (extend the existing tone set) rather than inventing a
  parallel color scheme when a component needs one more variant.

### In-app notifications (patient-facing only)
`Notification` (`prisma/schema.prisma`) is a real, working notification
channel, surfaced through the top bar bell — this is the always-on
channel and doesn't depend on any external credentials. **Scoped to
patients only** — admins don't need to be told about status changes they
themselves just made by clicking the button that made them.

- `src/lib/notifications.ts` — `notifyKitStatusChange(tx, userId,
  status)`, one message per `KitStatus` that's actually worth telling a
  patient about (`NOT_REQUESTED` has none — nothing happened yet). Called
  from inside the same `$transaction` as the status change in all three
  places a box's `kitStatus` can move: `POST /api/kit/request-pickup`,
  `POST /api/admin/patients/[id]/advance-status`, and the report-upload
  route's `RESULTS_READY` transition. **Always inside the transaction,
  never after it** — a notification implying a status change that then
  fails to commit would be a real lie to the patient.
- **`TopBar`'s bell was a static decorative dot before this** — clicking
  it did nothing. It's now a real `Link` (`notificationHref` +
  `unreadCount` props) to `/dashboard/notifications`, with a numeric
  badge (capped at "9+") when there's something unread. The admin
  `TopBar` doesn't pass these props, so admins keep the old
  non-interactive bell — there's nothing to route it to yet.
- **`/dashboard/notifications`** marks everything unread as read on
  view — the visit itself is what clears the badge, no separate "mark as
  read" click. The page captures which rows *were* unread before issuing
  that update, so the current render still highlights what's new; don't
  reorder that (read the rows, then update, not the other way around).

### Web push (Firebase Cloud Messaging)
Layered on top of the in-app channel above, not a replacement for it —
every kit-status transition writes the `Notification` row *and* attempts
a push, so a patient who never enables push still sees everything on
`/dashboard/notifications`.

- **Two separate Firebase credentials, two separate purposes.** The
  public web config (`NEXT_PUBLIC_FIREBASE_*` + the VAPID key,
  `.env`) is what the *browser* uses to register for push — it's not a
  secret, Firebase security is enforced server-side, not by hiding these
  values. Actually **sending** a push needs a Firebase Admin *service
  account* (`FIREBASE_SERVICE_ACCOUNT_KEY`, a private key JSON blob) —
  that one's a real secret and, as of this writing, isn't configured.
  Same "build it, gate it clearly" pattern as the OpenRouter key for AI
  report analysis: `src/lib/firebase/admin.ts` no-ops silently (no
  throw, no broken status change) when the key is absent, and
  `isPushConfigured()` exists for anything that wants to check.
- `src/lib/firebase/client.ts` — `requestPushRegistration()` asks
  Notification permission, registers `public/firebase-messaging-sw.js`,
  and returns an FCM device token; `onForegroundPush()` listens for
  pushes that arrive while the tab is focused (background pushes are the
  service worker's job — foreground ones need a manual listener because
  FCM doesn't auto-display a notification for a focused tab).
- **`PushToken`** (`prisma/schema.prisma`) — one row per registered
  browser/device, not one column on `User`: the same patient can have a
  phone and a laptop registered, and Firebase reissues a token when an
  old one goes stale. `POST /api/notifications/push-token` upserts on
  `token` (not `userId+token`) so a token that moves to a different
  account on a shared browser gets reassigned instead of duplicated.
- `src/lib/notifications.ts` also exports `getKitStatusPushPayload(status)`
  — same `STATUS_NOTIFICATION_MESSAGE` copy as the in-app notification,
  reshaped into a `{title, body}` push payload. Every call site that
  calls `notifyKitStatusChange` inside its `$transaction` also calls
  `sendPushToUser` **after** the transaction commits — a push is a
  network call to Google's servers and has no place holding a DB
  transaction open, and a slow/failed push must never roll back a status
  change that already succeeded.
- `sendPushToUser` prunes `PushToken` rows itself when FCM reports
  `messaging/registration-token-not-registered` or
  `messaging/invalid-registration-token` — stale tokens don't
  accumulate, and a send failure is caught and logged, never thrown, so
  it can't take down the status-change request that triggered it.
- **`EnablePushButton`** (`src/components/notifications/`) — client
  component on `/dashboard/notifications` that reads
  `Notification.permission` directly (there's no server-side signal for
  push status; the browser can revoke it without the backend ever
  finding out) and renders one of: enable prompt, "enabled" confirmation,
  "blocked in browser settings," or "unsupported browser."

### Courier integration (Chrono Diali)
`POST /api/kit/request-pickup` used to just record the request locally —
the TODO comment there literally said "call the Chrono24 API here." This
is that integration, gated the same way as OpenRouter and Firebase: fully
built, no-ops to the pre-integration behavior when
`CHRONO_DIALI_API_KEY` is unset.

- `src/lib/courier/chrono-diali.ts` — thin client. `isCourierConfigured()`
  gates everything; `createConsignment()` creates the trackable shipment
  (patient as origin, the lab — from `LAB_ADDRESS_*` env vars — as
  destination) and returns the `reference_number` we store on `Box`;
  `createPickup()` dispatches the actual courier, defaulting to the next
  day's earliest slot (09:00–12:00) since there's no time-slot picker in
  the patient UI. `trackParcel()` exists for a manual "refresh status"
  path but isn't wired into any button yet — the webhook is the primary
  path.
- **Address is collected inline, not at registration.** `User.addressLine1`
  /`city`/`country` are nullable — registration doesn't touch them.
  `KitStatusSection` only shows the address inputs when
  `courierConfigured && !hasAddress`; with no key configured (today's
  state) the "Request pickup" button behaves exactly as before this
  integration existed. This was a deliberate fix mid-build: an earlier
  version required the address whenever the patient had none on file,
  which would have blocked every pickup request while the courier is
  unconfigured — the two conditions have to be ANDed.
- **Two calls, one request.** `request-pickup` calls `createConsignment`
  then `createPickup` in sequence (not parallel — the pickup doesn't
  strictly need the consignment's reference number, but doing them in
  order keeps the failure story simple: if consignment creation fails,
  nothing happened yet). A `CourierApiError` maps 4xx→400, other codes→502;
  local state (`Box.kitStatus`) is only written after both calls succeed.
  No `pieces_detail` on the consignment call — confirmed with Chrono
  Diali directly that it should be omitted, not sent as a single-item
  array (see `CHRONO_DIALI_HANDOFF.md`).
- **⚠️ Known blocker, unresolved as of this writing**: Chrono Diali
  confirmed `total_items` on "Create a pickup" means the number of
  consignments in that pickup call, and must be **> 1**. Our flow — one
  patient, one box, one pickup call — only ever has exactly one
  consignment ready at a time, so a pickup can never be created as
  currently built. `createPickup()` still sends `total_items: "1"`,
  which is expected to be rejected by their sandbox once real credentials
  are added. Needs a product decision (batch multiple patients into one
  pickup call? a different endpoint for single-item home pickups?) before
  this can go live — see `CHRONO_DIALI_HANDOFF.md` for the open question
  sent back to them.
- **Webhook drives status automatically** — `POST
  /api/webhooks/chrono-diali`. Chrono Diali confirmed there's no HMAC
  signing; auth is a shared key we generate and register with them, sent
  back as a plain `Apikey` header (their term) on every delivery — not
  the same value as `CHRONO_DIALI_API_KEY`, which authenticates our
  *outbound* calls to them. `CHRONO_DIALI_WEBHOOK_SECRET` holds our side
  of that shared value; if unset, the endpoint accepts unauthenticated
  (better to receive real events than silently drop them before the
  secret is registered).
  - Every event is recorded in `CourierEvent` regardless of outcome —
    audit trail, and useful for debugging when a courier event doesn't
    map to anything.
  - `src/lib/courier/status-mapping.ts` maps their ~28 event `type`
    values to our 6 `KitStatus` values; most of theirs (`on_hold`,
    `rto_*`, `lost`, `softdata_update`, ...) have no equivalent and are
    logged but change nothing.
  - **Forward-only, same invariant as the admin advance button.**
    `isForwardKitStatusProgress()` compares `ALL_KIT_STATUSES` index —
    an out-of-order or duplicate webhook delivery can't regress or
    replay a status change.
  - **`delivered`/`delivery_pod` map to `TESTING`, never
    `RESULTS_READY`.** Chrono Diali "delivered" means the box physically
    reached the lab — it says nothing about whether testing finished.
    `RESULTS_READY` still only happens by uploading a report (see DNA
    test reports, above) — the webhook mapping table simply doesn't
    contain that value, so this can't regress by accident later.
  - Unmatched `reference_number` (event for a box we don't know, or a
    box with no courier reference yet) still gets logged and returns
    `200` — a courier retry storm from a `4xx`/`5xx` here would be worse
    than silently accepting an event we can't use.
  - `KIT_STATUS_TIMESTAMP_FIELD` (moved into `kit-status.ts` during this
    build) is shared between the admin advance-status route and this
    webhook — one mapping of status → timestamp column, not two copies
    drifting apart.

### Journey Rail (status stepper)
Horizontal stepper, `steps` prop-driven (not hardcoded) so it can express
different lifecycles. The live one in use is the DNA box lifecycle:
**Picked Up → In Delivery → Testing → Results**
(`src/lib/dashboard/kit-status.ts` maps the Prisma `KitStatus` enum —
`NOT_REQUESTED / PICKUP_REQUESTED / PICKED_UP / IN_TRANSIT / TESTING /
RESULTS_READY` — to a step index). Each node: 38px circle (44px + purple
ring when active), connected by 3px bars (filled Purple up to the active
step, `Line` gray beyond it). Completed nodes show a check icon on solid
Purple; the active node shows its icon in an outlined ring with an
"IN PROGRESS" pill underneath.

### Kit Status Section
`src/components/dashboard/KitStatusSection.tsx` — the dashboard home's
main card, a plain `<Card>`. Two states: before a pickup is requested, a
centered CTA with a "Request pickup" button (`POST
/api/kit/request-pickup`); after, the Journey Rail plus a plain-language
status line. No fabricated data — this reads directly from the signed-in
user's real `kitStatus`.

### Donut Ring / Result Row
SVG donut (`stroke-dasharray` arcs, no chart library) and a zero-padding
list row (status dot + name + status text + mono-font value/unit +
chevron). Built and ready, but **not currently wired to real data** —
they're reserved for the Results Portal feature (Phase 1, #6), which
needs an actual lab-results data model before they can show real values.
Don't populate them with placeholder numbers in the meantime; a plain
"no results yet" state (see `/dashboard/results`) is preferred over
fake-looking data.

### Stat Card
Plain `<Card>` with an icon + muted label row, a large Archivo
number/value below, and a small muted caption. Not used on the patient
dashboard home (removed along with the other fabricated mock content
there) — but now wired to real data on the admin Overview page (see
below). Five tones available: `muted` / `primary` / `info` / `warn` /
`success`, matching `Badge`'s tone set.

### Buttons, Inputs, Cards, Form
Structurally the real shadcn code — only the color tokens and
font-family differ, via CSS variables, so every primitive picks up the
brand system automatically. Radius stays `0.625rem` (buttons/inputs) /
`0.875rem`–`1rem` (cards, per shadcn's own `rounded-xl`/`rounded-2xl`);
chips/badges are full pill (`9999px`).

## 5. Do's and Don'ts

### Do
- Sample brand purple from the logo, not from memory — `#8A237F` is the source of truth now
- Pair every status color with text, not just a dot or badge fill
- Set numeric/tabular data in JetBrains Mono
- Use the real shadcn CLI for any base primitive (`npx shadcn add <name>`) — never hand-roll one
- Use the purple-tinted shadow tokens, never a flat black shadow
- Keep cards plain — border + shadow only

### Don't
- Don't add a patient-facing role switcher — role comes from the session, never a UI toggle
- Don't use gradients on standard buttons or content cards
- Don't add motion/glow/texture effects to cards (see §4, "Cards: plain, always") — this was tried and explicitly reverted
- Don't mix in a fourth typeface — Archivo/Hanken Grotesk/JetBrains Mono is the complete system
