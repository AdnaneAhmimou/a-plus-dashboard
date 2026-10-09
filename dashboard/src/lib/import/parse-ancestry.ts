import type { AncestryNode, ImportedLineage } from "./types";

// Ancestry needs two different techniques, for a reason worth stating.
//
// The COMPOSITION is a three-level tree (continent, region, population)
// whose nesting exists only in the DOM: the rendered text gives
// "Europe 81.4%", "Iberian Peninsula 48.4%", "Portugal Detected" as a
// flat run of name/value pairs, and nothing in that text says which
// belongs to which. Inferring it from the percentages would be guesswork
// that silently misattributes a region to the wrong continent, so the
// tree is read from the DOM instead (see compositionFromDom, used by the
// portal source) and this file only parses what text can honestly carry.
//
// The LINEAGE and NEANDERTHAL tabs are prose, and prose is exactly what
// text parsing is good at.

/** Duplicate rows: the portal renders each node collapsed and expanded. */
export function dedupeNodes(nodes: AncestryNode[]): AncestryNode[] {
  const seen = new Set<string>();
  return nodes.filter((n) => {
    const key = `${n.name}|${n.percent ?? ""}|${n.detected ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const HAPLOGROUP = /\b([A-Z]{1,2}\d*[a-z]?\d*[a-z]?)\b/;

/**
 * Reads a maternal or paternal lineage tab. Returns undefined when no
 * haplogroup is stated — for a patient with no Y chromosome the paternal
 * tab carries an explanation rather than a result, and inventing a
 * haplogroup there would be worse than showing nothing.
 */
export function parseLineageText(raw: string): ImportedLineage | undefined {
  const text = raw.replace(/\r/g, "");

  // "Your maternal lineage belongs to haplogroup H1" or "Haplogroup H1".
  const stated =
    text.match(/haplogroup\s+([A-Z][A-Za-z0-9]{0,6})\b/)?.[1] ??
    text.match(/^\s*([A-Z]\d?[a-z]?\d*)\s*$/m)?.[1];
  if (!stated) return undefined;

  // A subgroup is the longer, more specific label (H1 within H).
  const all = [...text.matchAll(new RegExp(HAPLOGROUP, "g"))]
    .map((m) => m[1])
    .filter((h) => h.startsWith(stated[0]));
  const sub = all.find((h) => h.length > stated.length && h.startsWith(stated));

  const migration = parseMigration(text);

  return {
    haplogroup: stated,
    subhaplogroup: sub,
    migration: migration.length > 0 ? migration : undefined,
  };
}

/** Timeline entries: an era line followed by a haplogroup and its text. */
function parseMigration(text: string) {
  const steps: { era: string; haplogroup: string; description?: string }[] = [];
  const eraLine =
    /^([^\n]*?\b(?:years ago|BCE|CE|millennia)\b[^\n]*)$/gim;

  let match: RegExpExecArray | null;
  while ((match = eraLine.exec(text)) !== null) {
    const after = text.slice(match.index + match[0].length);
    const hg = after.match(/haplogroup\s+([A-Z][A-Za-z0-9]{0,6})/i)?.[1];
    if (!hg) continue;
    const description = after
      .split("\n")
      .slice(1, 6)
      .map((l) => l.trim())
      .find((l) => l.length > 60);
    steps.push({ era: match[1].trim(), haplogroup: hg, description });
  }
  return steps;
}

export interface ParsedNeanderthal {
  percent?: number;
  variants?: number;
  vsAverage?: number;
  sections?: { title: string; text: string }[];
}

export function parseNeanderthalText(raw: string): ParsedNeanderthal | undefined {
  const text = raw.replace(/\r/g, "");
  if (!/neanderthal/i.test(text)) return undefined;

  const percent = toNumber(
    text.match(/([\d.,]+)\s*%\s*\n?\s*of Neanderthal DNA/i)?.[1] ??
      text.match(/You have\s*\n?\s*([\d.,]+)\s*%/i)?.[1]
  );
  const variants = toNumber(
    text.match(/of which\s*([\d.,]+)\s*are present/i)?.[1]
  );
  const vsRaw = text.match(/([\d.,]+)\s*%\s*(more|less)\s+Neanderthal/i);
  const vsAverage = vsRaw
    ? (vsRaw[2].toLowerCase() === "less" ? -1 : 1) * (toNumber(vsRaw[1]) ?? 0)
    : undefined;

  return {
    percent,
    variants: variants !== undefined ? Math.round(variants) : undefined,
    vsAverage,
    sections: parseSections(text),
  };
}

// The educational blocks are a short title line followed by paragraphs.
// Titles are matched against the source's own set rather than guessed
// from formatting, which the flattened text does not preserve.
const SECTION_TITLES = [
  "Origin and extinction",
  "Physical features",
  "Lifestyle",
  "Feeding",
  "Culture",
];

function parseSections(text: string) {
  const found: { title: string; text: string; at: number }[] = [];
  for (const title of SECTION_TITLES) {
    const at = text.indexOf(`\n${title}\n`);
    if (at >= 0) found.push({ title, text: "", at });
  }
  found.sort((a, b) => a.at - b.at);

  return found
    .map((entry, i) => {
      const start = entry.at + entry.title.length + 2;
      const end = i + 1 < found.length ? found[i + 1].at : text.length;
      const body = text
        .slice(start, end)
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !/^Loading\.\.\./.test(l))
        .join("\n\n")
        .trim();
      return { title: entry.title, text: body };
    })
    .filter((s) => s.text.length > 0);
}

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}
