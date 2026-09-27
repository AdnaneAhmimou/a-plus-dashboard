// Pulls structured fields out of one captured detail page. Deliberately
// deterministic: no AI touches a number or a verdict anywhere in this
// pipeline. A field that cannot be read with confidence is left absent
// rather than guessed, because a missing section renders as nothing
// while a wrong variant count renders as a lie.
//
// Runs against stored rawText, so improving it never means re-scraping.

export interface ParsedDetail {
  name?: string;
  verdict?: string;
  description?: string;
  resultContext?: string;
  variantCount?: string;
  riskLociCount?: number;
  genesAnalyzed?: string;

  // The explanatory sections, sliced verbatim. These are what a patient
  // actually reads — what the condition is, what raises the risk, how to
  // lower it — and the reason the detail page is worth opening at all.
  causesAndRiskFactors?: string;
  symptoms?: string;
  prevention?: string;
  diseaseManagement?: string;
  technicalNotes?: string;
  studyLimitations?: string;
  bibliography?: { label: string }[];
}

// The portal prints the same literal headers as the source PDFs, in
// whatever order a given report happens to use them, so the same table
// drives both parsers. Text between one header and the next belongs to
// that section; nothing is rewritten or summarised.
type SectionKey =
  | "causesAndRiskFactors"
  | "symptoms"
  | "prevention"
  | "diseaseManagement"
  | "technicalNotes"
  | "studyLimitations"
  | "bibliography";

const SECTION_HEADERS: { key: SectionKey; pattern: RegExp }[] = [
  { key: "causesAndRiskFactors", pattern: /^Causes and non-genetic risk factors$/i },
  { key: "symptoms", pattern: /^Symptoms$/i },
  { key: "prevention", pattern: /^Prevention$/i },
  { key: "diseaseManagement", pattern: /^Disease management$/i },
  { key: "technicalNotes", pattern: /^Technical report$/i },
  { key: "bibliography", pattern: /^Bibliography$/i },
  { key: "studyLimitations", pattern: /^Study limitations$/i },
];

/**
 * Slices the page into its named sections. A line that exactly matches a
 * header opens a section and closes the previous one; everything before
 * the first header belongs to no section and is dropped here (the
 * description is taken separately, above the result headline).
 */
function extractSections(lines: string[]): Partial<Record<SectionKey, string[]>> {
  const out: Partial<Record<SectionKey, string[]>> = {};
  let current: SectionKey | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const header = SECTION_HEADERS.find((h) => h.pattern.test(line));
    if (header) {
      current = header.key;
      out[current] ??= [];
      continue;
    }
    if (!current || !line) continue;
    // The portal leaves loading strips and untranslated keys in the
    // rendered text; neither belongs in a patient-facing section.
    if (/^Loading\.\.\./.test(line) || /^private\./.test(line)) continue;
    out[current]!.push(line);
  }

  return out;
}

/** Citations wrap across lines, so a line ending in "." or "]" closes one. */
function joinCitations(lines: string[]): { label: string }[] {
  const entries: { label: string }[] = [];
  let buffer: string[] = [];
  for (const line of lines) {
    buffer.push(line);
    if (/[.\]]\s*$/.test(line)) {
      const label = buffer.join(" ").trim();
      if (label) entries.push({ label });
      buffer = [];
    }
  }
  const rest = buffer.join(" ").trim();
  if (rest) entries.push({ label: rest });
  return entries;
}

// The headline line varies by section: "Your risk is" for conditions,
// "Your result is" for traits, "Your genotype indicates" for the gene
// items. All are followed by the verdict on the next non-empty line.
const HEADLINE =
  /^\s*Your (?:risk is|result is|genetic results indicate|genotype indicates)\s*$/im;

const I18N_KEY = /^(?:item|private|common)\.[\w.]+$/;

export function parseDetailText(raw: string): ParsedDetail {
  const text = raw.replace(/\r/g, "");
  const lines = text.split("\n");

  // Layout: breadcrumb, "/", item name, "PDF", then the name again as
  // the page heading. The line right after "PDF" is the reliable one.
  const pdfIndex = lines.findIndex((l) => l.trim() === "PDF");
  const rawName =
    pdfIndex >= 0
      ? lines.slice(pdfIndex + 1).find((l) => l.trim().length > 0)?.trim()
      : undefined;

  // The portal renders untranslated i18n keys ("item.compleximputation.
  // 13.name") when its dictionary has not loaded yet. Storing one as a
  // result name puts a developer string in front of a patient, so it is
  // treated as no name at all: the importer then warns and skips rather
  // than writing it.
  const name = rawName && !I18N_KEY.test(rawName) ? rawName : undefined;

  const headlineMatch = HEADLINE.exec(text);
  let verdict: string | undefined;
  if (headlineMatch) {
    const after = text.slice(headlineMatch.index + headlineMatch[0].length);
    verdict = after.split("\n").find((l) => l.trim().length > 0)?.trim();
  }

  // Description: the prose between the page heading and the headline.
  // The item name appears twice — once in the breadcrumb above "PDF" and
  // again as the heading below it — so the heading is found by scanning
  // LINES after the PDF line. Slicing from the first textual match
  // instead picks up the breadcrumb and drags "PDF" and a repeated title
  // into the description.
  let description: string | undefined;
  if (name && headlineMatch) {
    const headlineLine = lines.findIndex((l) => HEADLINE.test(l));
    const headingLine = lines.findIndex(
      (l, i) => i > pdfIndex && l.trim() === name
    );
    if (headingLine > 0 && headlineLine > headingLine) {
      description = clean(lines.slice(headingLine + 1, headlineLine).join("\n"));
    }
  }

  const variantCount = text
    .match(/^\s*([\d.,]+\s*(?:million\s*)?variants)\s*$/im)?.[1]
    ?.trim();

  const lociMatch = text.match(/^\s*(\d+)\s*loci\s*$/im);
  const riskLociCount = lociMatch ? Number(lociMatch[1]) : undefined;

  // The gene list is the line of bare uppercase symbols that follows the
  // "Genes analyzed" column header.
  let genesAnalyzed: string | undefined;
  const genesHeader = lines.findIndex((l) => /Genes analyzed/i.test(l));
  if (genesHeader >= 0) {
    genesAnalyzed = lines
      .slice(genesHeader + 1, genesHeader + 12)
      .map((l) => l.trim())
      .find((l) => /^[A-Z0-9][A-Z0-9\- ]{2,}$/.test(l) && /[A-Z]{2}/.test(l));
  }

  const sections = extractSections(lines);
  const sectionText = (key: SectionKey) => {
    const value = sections[key]?.join("\n\n").trim();
    return value && value.length > 0 ? value : undefined;
  };

  const bibliographyLines = sections.bibliography ?? [];
  const bibliography =
    bibliographyLines.length > 0 ? joinCitations(bibliographyLines) : undefined;

  // The population-context sentence, where the section has one.
  const resultContext = text
    .match(/^\s*(\d{1,3}(?:\.\d+)?%[^\n]{10,240})$/im)?.[1]
    ?.trim();

  return {
    name,
    verdict,
    description,
    resultContext,
    variantCount,
    riskLociCount,
    genesAnalyzed,
    causesAndRiskFactors: sectionText("causesAndRiskFactors"),
    symptoms: sectionText("symptoms"),
    prevention: sectionText("prevention"),
    diseaseManagement: sectionText("diseaseManagement"),
    technicalNotes: sectionText("technicalNotes"),
    studyLimitations: sectionText("studyLimitations"),
    bibliography,
  };
}

function clean(chunk: string): string | undefined {
  const value = chunk
    .split("\n")
    .map((l) => l.trim())
    // The portal leaves untranslated i18n keys and loading strips in the
    // rendered text; neither belongs in a patient-facing field.
    .filter((l) => l && !/^private\./.test(l) && !/^Loading\.\.\./.test(l))
    .join("\n")
    .trim();
  return value.length > 0 ? value : undefined;
}
