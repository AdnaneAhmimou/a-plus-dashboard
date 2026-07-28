import type { ProbabilityPoint } from "@/components/results/ProbabilityBars";

// AnalysisResult.probabilities / .bibliography are Prisma Json columns —
// validated against analysisExtractionSchema when written (see
// src/lib/ai/extract-analysis.ts), so a straight cast on read is safe.
export function toProbabilities(json: unknown): ProbabilityPoint[] | null {
  return Array.isArray(json) ? (json as ProbabilityPoint[]) : null;
}

export interface BibliographyEntry {
  label: string;
  url?: string;
}

export function toBibliography(json: unknown): BibliographyEntry[] | null {
  return Array.isArray(json) ? (json as BibliographyEntry[]) : null;
}
