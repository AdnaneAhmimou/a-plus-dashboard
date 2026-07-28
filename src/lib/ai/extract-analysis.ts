// Import the inner implementation file, not the package entry — see
// src/types/pdf-parse-lib.d.ts for why.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

import { analysisExtractionSchema, type AnalysisItem } from "./analysis-schema";
import { requestAnalysisExtraction, isAiConfigured } from "./openrouter";

export { OpenRouterNotConfiguredError, isAiConfigured } from "./openrouter";

export class AnalysisExtractionError extends Error {}

// Reads a report PDF's text and asks the configured AI provider to turn it
// into the structured category/list/detail shape the dashboard renders.
// Throws OpenRouterNotConfiguredError if no provider key is set, or
// AnalysisExtractionError if the PDF has no extractable text or the AI
// response doesn't match the expected schema.
export async function extractStructuredAnalysis(
  pdfBuffer: Buffer
): Promise<AnalysisItem[]> {
  if (!isAiConfigured()) {
    const { OpenRouterNotConfiguredError } = await import("./openrouter");
    throw new OpenRouterNotConfiguredError();
  }

  const { text } = await pdfParse(pdfBuffer);
  if (!text || text.trim().length === 0) {
    throw new AnalysisExtractionError(
      "No extractable text was found in this PDF — it may be a scanned image without a text layer."
    );
  }

  const raw = await requestAnalysisExtraction(text);
  const parsed = analysisExtractionSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AnalysisExtractionError(
      "The AI response did not match the expected format."
    );
  }

  return parsed.data.results;
}
