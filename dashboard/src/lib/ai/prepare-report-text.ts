// Deterministic parser for the per-trait report PDFs (one PDF per
// condition/trait, exported from the reference genetic-testing platform).
// This is the "prepare the data for the AI" layer: it pulls every field
// that has an objective, unambiguous location in the source text — the
// result headline, risk loci count, gene list, bibliography, and every
// explanatory section — using plain string matching, not a language
// model. Nothing here can hallucinate: every value returned either came
// verbatim from the PDF text or is null.
//
// The only thing left for the AI to decide (see classify-category.ts) is
// which of the 6 dashboard categories a trait belongs in — a single,
// narrow judgment call, not transcription. That split is the actual
// anti-hallucination strategy: don't ask a language model to copy out
// gene symbols, citations, or numbers when string matching can do it
// perfectly.
//
// Verified against all 20 sample PDFs in /results before writing this —
// the section headers and headline phrases below are exactly what that
// corpus uses, not a guess.

export interface BibliographyEntry {
  label: string;
}

export interface PreparedReport {
  title: string;
  whatIsIt: string | null;
  resultHeadline: string | null;
  resultContext: string | null;
  riskLociCount: number | null;
  genesAnalyzed: string | null;
  variantCount: string | null;
  causesAndRiskFactors: string | null;
  symptoms: string | null;
  prevention: string | null;
  diseaseManagement: string | null;
  technicalNotes: string | null;
  studyLimitations: string | null;
  bibliography: BibliographyEntry[] | null;
  /** Small text blob for the AI category-classification call — title + intro + headline, nothing else. */
  classificationContext: string;
}

const HEADLINE_RE =
  /^Your (risk is|result is|genetic results indicate|genotype indicates)/i;
const GENE_HEADER_RE = /^Genes analyzed$/i;
const GENE_TOKEN_RE = /^[A-Z][A-Z0-9-]{0,14}$/;
const RISK_LOCI_RE = /Number of risk loci\D*([\d,]+)/i;
const VARIANT_COUNT_RE =
  /increased to\s+(more than\s+[\d.,]+\s*(?:million|thousand))/i;
// Family-B monogenic reports sometimes collapse a variant-table row into
// one jammed token during PDF text extraction — gene symbol, rsID, and
// genotype with no whitespace between them. The column order in the
// source PDF isn't consistent row-to-row (even within the same report):
// both "HFErs1800562GG" (gene first) and "rs1799945HFECG" (rsID first)
// occur, so both orderings are matched.
const JAMMED_VARIANT_GENE_FIRST_RE = /^([A-Z0-9]{2,15})(rs\d+)([ACGT]{1,3})$/;
// Non-greedy gene group: without it, greedy matching swallows genotype
// letters that happen to also be valid gene-symbol characters (A/C/G/T
// are all valid mid-symbol letters too) into the wrong group.
const JAMMED_VARIANT_RS_FIRST_RE = /^(rs\d+)([A-Z][A-Z0-9]{0,13}?)([ACGT]{1,3})$/;

type SectionKey =
  | "causesAndRiskFactors"
  | "symptoms"
  | "prevention"
  | "diseaseManagement"
  | "technicalNotes"
  | "studyLimitations"
  | "bibliographyRaw";

const SECTION_HEADERS: { key: SectionKey; pattern: RegExp }[] = [
  { key: "causesAndRiskFactors", pattern: /^Causes and non-genetic risk factors$/i },
  { key: "symptoms", pattern: /^Symptoms$/i },
  { key: "prevention", pattern: /^Prevention$/i },
  { key: "diseaseManagement", pattern: /^Disease management$/i },
  { key: "technicalNotes", pattern: /^Technical report$/i },
  { key: "bibliographyRaw", pattern: /^Bibliography$/i },
  { key: "studyLimitations", pattern: /^Study limitations$/i },
];

function joinCitations(lines: string[]): BibliographyEntry[] {
  const entries: BibliographyEntry[] = [];
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

export function prepareReportText(rawText: string): PreparedReport {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const title = lines[0] ?? "Untitled analysis";

  const headlineIdx = lines.findIndex((l) => HEADLINE_RE.test(l));
  const whatIsIt =
    headlineIdx > 1 ? lines.slice(1, headlineIdx).join(" ").trim() || null : null;
  const resultHeadline = headlineIdx >= 0 ? lines[headlineIdx + 1] ?? null : null;

  // The line right after the headline value is sometimes a population/
  // context sentence (e.g. "90% of the world's population has a medium
  // risk...") rather than the next structural marker — only claim it as
  // context if it's prose-length and not one of the known next markers.
  let resultContext: string | null = null;
  if (headlineIdx >= 0 && resultHeadline) {
    const candidate = lines[headlineIdx + 2];
    if (
      candidate &&
      candidate.length > 25 &&
      !RISK_LOCI_RE.test(candidate) &&
      !GENE_HEADER_RE.test(candidate) &&
      !SECTION_HEADERS.some((s) => s.pattern.test(candidate))
    ) {
      resultContext = candidate;
    }
  }

  const fullText = lines.join(" ");

  const riskLociMatch = fullText.match(RISK_LOCI_RE);
  const riskLociCount = riskLociMatch
    ? parseInt(riskLociMatch[1].replace(/,/g, ""), 10)
    : null;

  const variantMatch = fullText.match(VARIANT_COUNT_RE);
  const variantCount = variantMatch ? variantMatch[1].trim() : null;

  // Gene list: collect ALL-CAPS symbol-looking lines that immediately
  // follow a "Genes analyzed" header, re-entering collection every time
  // that header reappears (multi-column PDFs repeat it once per column).
  const genes = new Set<string>();
  let collectingGenes = false;
  for (const line of lines) {
    if (GENE_HEADER_RE.test(line)) {
      collectingGenes = true;
      continue;
    }
    if (collectingGenes) {
      if (GENE_TOKEN_RE.test(line)) {
        genes.add(line);
        continue;
      }
      collectingGenes = false;
    }
    const jammedGeneFirst = line.match(JAMMED_VARIANT_GENE_FIRST_RE);
    if (jammedGeneFirst) {
      genes.add(jammedGeneFirst[1]);
      continue;
    }
    const jammedRsFirst = line.match(JAMMED_VARIANT_RS_FIRST_RE);
    if (jammedRsFirst) genes.add(jammedRsFirst[2]);
  }
  const genesAnalyzed = genes.size > 0 ? Array.from(genes).join(", ") : null;

  // Split the remaining text into named sections by known headers, in
  // whatever order they actually appear for this report.
  const sectionMatches = lines
    .map((line, idx) => {
      const match = SECTION_HEADERS.find((s) => s.pattern.test(line));
      return match ? { idx, key: match.key } : null;
    })
    .filter((m): m is { idx: number; key: SectionKey } => m !== null);

  const sections: Partial<Record<SectionKey, string[]>> = {};
  for (let i = 0; i < sectionMatches.length; i++) {
    const start = sectionMatches[i].idx + 1;
    const end = sectionMatches[i + 1]?.idx ?? lines.length;
    sections[sectionMatches[i].key] = lines.slice(start, end);
  }

  const bibliography = sections.bibliographyRaw
    ? joinCitations(sections.bibliographyRaw)
    : null;

  const classificationContext = [
    title,
    whatIsIt ?? "",
    resultHeadline ? `Result: ${resultHeadline}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 800);

  return {
    title,
    whatIsIt,
    resultHeadline,
    resultContext,
    riskLociCount,
    genesAnalyzed,
    variantCount,
    causesAndRiskFactors: sections.causesAndRiskFactors?.join(" ").trim() || null,
    symptoms: sections.symptoms?.join(" ").trim() || null,
    prevention: sections.prevention?.join(" ").trim() || null,
    diseaseManagement: sections.diseaseManagement?.join(" ").trim() || null,
    technicalNotes: sections.technicalNotes?.join(" ").trim() || null,
    studyLimitations: sections.studyLimitations?.join(" ").trim() || null,
    bibliography: bibliography && bibliography.length > 0 ? bibliography : null,
    classificationContext:
      classificationContext.length > 0 ? classificationContext : title,
  };
}
