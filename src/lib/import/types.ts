import type { AnalysisCategory } from "@prisma/client";

// The contract between "where results come from" and "what we do with
// them". Everything downstream — the importer, the DB writes, the UI —
// only ever sees the shapes in this file, never a page, a selector or an
// HTTP response. That is the whole point: today the only implementation
// drives the tellmeGen professionals portal with Playwright, and when
// the lab publishes an API we add a second implementation of
// `ResultSource` and change one config value. Nothing else moves.

/** One result as the source presents it, before any of our own interpretation. */
export interface ImportedResult {
  /** The source's own id for this item, e.g. tellmeGen's "61/0". Stable across runs. */
  externalId: string;
  name: string;
  /** The headline verdict, verbatim: "High risk", "Variant present", "Light eyes". */
  verdict: string;
  /** Page URL, kept so an admin can open the original. */
  url: string;
  /** The full captured text, stored verbatim so we can re-parse without re-fetching. */
  rawText: string;

  // Parsed fields. All optional: sections differ in what they carry, and
  // a field we could not read must stay absent rather than be guessed.
  description?: string;
  resultContext?: string;
  variantCount?: string;
  riskLociCount?: number;
  genesAnalyzed?: string;

  // The explanatory prose a patient reads: what raises the risk, what
  // the symptoms are, what they can do about it.
  causesAndRiskFactors?: string;
  symptoms?: string;
  prevention?: string;
  diseaseManagement?: string;
  technicalNotes?: string;
  studyLimitations?: string;
  bibliography?: { label: string }[];
}

export interface ImportedSection {
  /** The source's key for this section, e.g. "diseases". */
  sourceKey: string;
  category: AnalysisCategory;
  results: ImportedResult[];
}

/**
 * A node in the ancestry composition tree. The source nests three deep
 * (continent, region, population) and only the leaves carry `detected`.
 */
export interface AncestryNode {
  /** The source's id where it has one, e.g. "EUR_IBS_PRT". */
  id?: string;
  name: string;
  percent?: number;
  detected?: boolean;
  /** The source's descriptive paragraph for this region, verbatim. */
  overview?: string;
  children?: AncestryNode[];
}

export interface ImportedLineage {
  haplogroup: string;
  subhaplogroup?: string;
  migration?: { era: string; haplogroup: string; description?: string }[];
}

export interface ImportedAncestry {
  composition: AncestryNode[];
  maternal?: ImportedLineage;
  paternal?: ImportedLineage;
  neanderthal?: {
    percent?: number;
    variants?: number;
    vsAverage?: number;
    sections?: { title: string; text: string }[];
  };
  rawText: string;
}

/** Everything one patient's results amount to, from any source. */
export interface PatientResultBundle {
  barcode: string;
  patientLabel: string;
  capturedAt: Date;
  sections: ImportedSection[];
  ancestry: ImportedAncestry | null;
  /** Section-level PDFs the source offers, saved to disk by the source. */
  documents: { section: string; filePath: string }[];
  /** Non-fatal problems: a section that would not load, an item that 404'd. */
  warnings: string[];
}

export interface FetchOptions {
  /** How many pages to pull at once. Higher is faster until the source throttles. */
  concurrency?: number;
  /** Limit to these section keys; omit for all. */
  only?: string[];
  /** Directory for downloaded documents. */
  outDir?: string;
  onProgress?: (message: string) => void;
}

export interface ResultSource {
  /** Identifies the source in the audit trail; matches the ImportSource enum. */
  readonly id: "TELLMEGEN_PORTAL" | "TELLMEGEN_API";
  /**
   * Fetch everything for one patient. Implementations resolve the patient
   * from `identifier` — a kit barcode, or a patient name for sources that
   * only offer a name search.
   */
  fetchPatient(identifier: string, options?: FetchOptions): Promise<PatientResultBundle>;
}

/** Thrown when a source cannot produce a bundle at all. */
export class ImportSourceError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = "ImportSourceError";
  }
}
