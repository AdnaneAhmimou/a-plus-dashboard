// Import the inner implementation file, not the package entry — see
// src/types/pdf-parse-lib.d.ts for why.
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { z } from "zod";

import { analysisCategorySchema, type AnalysisItem } from "./analysis-schema";
import { prepareReportText } from "./prepare-report-text";
import { requestCategoryClassification, isAiConfigured } from "./openrouter";

export { OpenRouterNotConfiguredError, isAiConfigured } from "./openrouter";

export class AnalysisExtractionError extends Error {}

const classificationResponseSchema = z.object({
  category: analysisCategorySchema,
});

function undef<T>(value: T | null | undefined): T | undefined {
  return value == null ? undefined : value;
}

// Reads a single-trait report PDF and turns it into one AnalysisItem.
// Every field except `category` is extracted deterministically by
// prepareReportText — see that file for why. The AI is only asked to
// classify the trait into one of the 6 dashboard categories, over a
// short excerpt (title + intro + result headline), which keeps
// hallucination surface to a single bounded decision instead of open-
// ended transcription of clinical data.
//
// Throws OpenRouterNotConfiguredError if no provider key is set,
// AnalysisExtractionError if the PDF has no extractable text, is
// malformed (some real-world exports fail to parse at the PDF-library
// level — this is caught and surfaced cleanly rather than crashing), or
// doesn't match the expected single-trait report structure.
export async function extractStructuredAnalysis(
  pdfBuffer: Buffer
): Promise<AnalysisItem[]> {
  if (!isAiConfigured()) {
    const { OpenRouterNotConfiguredError } = await import("./openrouter");
    throw new OpenRouterNotConfiguredError();
  }

  let text: string;
  try {
    const parsed = await pdfParse(pdfBuffer);
    text = parsed.text;
  } catch {
    throw new AnalysisExtractionError(
      "This PDF's internal structure could not be read. Try re-exporting or re-saving it and upload again."
    );
  }

  if (!text || text.trim().length === 0) {
    throw new AnalysisExtractionError(
      "No extractable text was found in this PDF — it may be a scanned image without a text layer."
    );
  }

  const prepared = prepareReportText(text);

  if (!prepared.resultHeadline) {
    throw new AnalysisExtractionError(
      "This PDF doesn't match the expected report format (no result headline found) — it may need to be reviewed manually."
    );
  }

  const raw = await requestCategoryClassification(prepared.classificationContext);
  const parsedCategory = classificationResponseSchema.safeParse(raw);
  if (!parsedCategory.success) {
    throw new AnalysisExtractionError(
      "The AI response did not match the expected format."
    );
  }

  const item: AnalysisItem = {
    category: parsedCategory.data.category,
    name: prepared.title,
    summary: prepared.resultHeadline,
    description: undef(prepared.whatIsIt),
    resultContext: undef(prepared.resultContext),
    variantCount: undef(prepared.variantCount),
    riskLociCount: undef(prepared.riskLociCount),
    genesAnalyzed: undef(prepared.genesAnalyzed),
    technicalNotes: undef(prepared.technicalNotes),
    bibliography: undef(prepared.bibliography),
    causesAndRiskFactors: undef(prepared.causesAndRiskFactors),
    symptoms: undef(prepared.symptoms),
    prevention: undef(prepared.prevention),
    diseaseManagement: undef(prepared.diseaseManagement),
    studyLimitations: undef(prepared.studyLimitations),
  };

  return [item];
}
