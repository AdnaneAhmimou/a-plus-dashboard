// Which of the three report shapes a result is, derived from the result
// headline the source PDF prints (see prepare-report-text.ts). Derived at
// render time rather than stored: it's a pure function of wording the
// parser already captured verbatim, so existing rows need no backfill.
//
// The shapes come from the real corpus (the /results PDFs and the 332
// imported result pages), each phrased differently by the source and
// each needing a different chart:
//   RISK       "Medium risk"            polygenic disease risk, has risk loci
//   LEVELS     "Average levels"         quantitative biomarker, bell curve
//   PROBABILITY"High probability of..."  likelihood of a trait, cumulative line
//   OUTCOME    "Light eyes", "Normal CYP2C19 metabolizer"
//                                       a named result on a categorical scale
//   CARRIER    "Variant present"        monogenic carrier status, single gene
export type ResultType = "RISK" | "LEVELS" | "PROBABILITY" | "OUTCOME" | "CARRIER";

export type ZoneTone = "success" | "warning" | "destructive" | "info" | "neutral";

export interface ResultZone {
  label: string;
  tone: ZoneTone;
}

// Order matters: "risk" is checked before the probability wording
// because a phrase like "slight tendency towards high risk" is a risk
// result, and the metabolizer check comes first because "Poor CYP2D6
// metabolizer" would otherwise read as a level.
export function detectResultType(summary: string): ResultType {
  const s = summary.toLowerCase();
  if (s.includes("variant") || s.includes("carrier") || s.includes("mutation")) {
    return "CARRIER";
  }
  if (METABOLIZER.test(s)) return "OUTCOME";
  // "risk" alone is not enough: "High probability of being a risk-taker"
  // is a personality trait, not a disease risk, and routing it to the
  // risk template would label a patient's temperament with a red zone.
  if (/\brisk/.test(s) && !/risk[- ]?tak/.test(s)) return "RISK";
  if (/\b(probability|likelihood|chance|tendency|predisposition)\b/.test(s)) {
    return "PROBABILITY";
  }
  if (/\b(levels?|count|volume|rate|length|percentage|density|pressure|index)\b/.test(s)) {
    return "LEVELS";
  }
  // Anything left is a named categorical result ("Light eyes", "Farmer
  // profile", "Secretory state"). Falling through to LEVELS used to plot
  // these on a bell curve, which implied a magnitude the result does not
  // have.
  return "OUTCOME";
}

export const METABOLIZER = /\b(ultrarapid|ultrafast|rapid|normal|intermediate|poor)\s+\w*\s*metabolizer\b/i;

// Pharmacogenetic metabolizer status is an ordered scale the source names
// explicitly, so it gets its own steps rather than a generic three-zone
// axis. Deliberately neutral in tone: neither end is "good" — it governs
// dosing, which is a clinician's call.
export const METABOLIZER_STEPS = [
  "Poor",
  "Intermediate",
  "Normal",
  "Rapid",
  "Ultrarapid",
];

/** Index into METABOLIZER_STEPS, or -1 when the wording isn't recognised. */
export function getMetabolizerIndex(summary: string): number {
  const s = summary.toLowerCase();
  if (/ultrarapid|ultrafast/.test(s)) return 4;
  if (/\brapid\b/.test(s)) return 3;
  if (/\bnormal\b|\bextensive\b/.test(s)) return 2;
  if (/\bintermediate\b/.test(s)) return 1;
  if (/\bpoor\b/.test(s)) return 0;
  return -1;
}

// The ordinal scale a result sits on. RISK is the one case where
// low/medium/high has an unambiguous direction, so it gets traffic-light
// tones. LEVELS stays deliberately neutral: this app has no per-trait
// clinical knowledge to know whether low or high is favourable for a
// given biomarker (low HDL is bad, low LDL is good), so it must not
// imply one. CARRIER is binary and never alarming — a single recessive
// variant is a carrier finding, not a diagnosis.
export function getResultZones(type: ResultType): ResultZone[] {
  switch (type) {
    case "RISK":
      return [
        { label: "Low", tone: "success" },
        { label: "Medium", tone: "warning" },
        { label: "High", tone: "destructive" },
      ];
    case "LEVELS":
      return [
        { label: "Lower", tone: "neutral" },
        { label: "Typical", tone: "neutral" },
        { label: "Higher", tone: "neutral" },
      ];
    case "PROBABILITY":
      return [
        { label: "Less likely", tone: "neutral" },
        { label: "Average", tone: "neutral" },
        { label: "More likely", tone: "neutral" },
      ];
    case "OUTCOME":
      return [];
    case "CARRIER":
      return [
        { label: "Absent", tone: "success" },
        { label: "Present", tone: "info" },
      ];
  }
}

// Words the source uses for each zone position, in the same order as
// getResultZones. "Average" is the source's own middle word for levels
// results; "typical"/"normal" are accepted as synonyms just in case.
const ZONE_SYNONYMS: Record<ResultType, string[][]> = {
  RISK: [["low"], ["medium", "average", "moderate"], ["high", "elevated"]],
  LEVELS: [["low", "lower", "decreased"], ["average", "typical", "normal"], ["high", "higher", "increased"]],
  PROBABILITY: [
    ["low", "lower", "reduced", "less", "decreased"],
    ["average", "medium", "standard", "usual"],
    ["high", "higher", "increased", "more"],
  ],
  OUTCOME: [],
  CARRIER: [["absent", "not a carrier", "negative"], ["present", "carrier", "detected"]],
};

/** Index into getResultZones(type), or -1 when the wording isn't recognised. */
export function getActiveZoneIndex(summary: string, type: ResultType): number {
  const s = summary.toLowerCase();
  const groups = ZONE_SYNONYMS[type];
  return groups.findIndex((words) => words.some((w) => s.includes(w)));
}

/**
 * The population percentage quoted in the result-context sentence, e.g.
 * "90% of the world's population has a medium risk" -> 90. Returns null
 * when the source didn't quote one, so the UI can omit that panel rather
 * than invent a number.
 */
export function parsePopulationPercent(resultContext: string | null): number | null {
  if (!resultContext) return null;
  const match = resultContext.match(/(\d{1,3}(?:[.,]\d+)?)\s*%/);
  if (!match) return null;
  const value = parseFloat(match[1].replace(",", "."));
  return value >= 0 && value <= 100 ? value : null;
}

/**
 * The single tone that represents a result at a glance (the dot in the
 * category list). Derived from the same zone table the detail charts
 * use, so a result can never be one colour in the list and another on
 * its own page. Unrecognised wording falls back to neutral rather than
 * guessing a status colour.
 */
export function getSummaryTone(summary: string): ZoneTone {
  const type = detectResultType(summary);
  const zones = getResultZones(type);
  const index = getActiveZoneIndex(summary, type);
  return index >= 0 ? zones[index].tone : "neutral";
}

export interface ActionItems {
  /** An intro sentence ending in ":", when the source has one. */
  lead: string | null;
  items: string[];
}

const MAX_ACTION_ITEMS = 8;

/**
 * Turns a prose section (Prevention, Disease management) into a checklist
 * without rewriting it: sentences are split apart and shown verbatim, so
 * nothing is summarised or invented. Falls back to null when the text
 * doesn't split into at least two items, in which case callers should
 * render it as a plain paragraph instead.
 */
export function splitIntoActionItems(text: string | null): ActionItems | null {
  if (!text) return null;

  const sentences = text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);

  let lead: string | null = null;
  let rest = sentences;

  if (sentences.length > 0) {
    // These sections usually open with "…recommendations that can slow
    // its progression: Eat healthy…" — one sentence by punctuation, but
    // an intro plus a first item in practice. Only the opening sentence
    // is split this way; colons elsewhere (units, ranges) are left alone.
    const introSplit = sentences[0].match(/^(.*?:)\s+(\S.*)$/);
    if (introSplit) {
      lead = introSplit[1];
      rest = [introSplit[2], ...sentences.slice(1)];
    } else if (sentences[0].endsWith(":")) {
      lead = sentences[0];
      rest = sentences.slice(1);
    }
  }

  // A single long sentence isn't a checklist — let the caller render prose.
  if (rest.length < 2) return null;

  return { lead, items: rest.slice(0, MAX_ACTION_ITEMS) };
}
