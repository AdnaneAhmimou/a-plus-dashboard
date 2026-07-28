import { z } from "zod";

// Mirrors the AnalysisCategory enum in prisma/schema.prisma — kept as a
// literal zod enum (not generated from Prisma) since this validates raw AI
// output, which needs a strict, independent boundary check.
export const analysisCategorySchema = z.enum([
  "HEALTH_CONDITIONS",
  "HEREDITARY_CONDITIONS",
  "PHARMACOLOGY",
  "TRAITS",
  "WELLNESS",
  "ANCESTRY",
]);

const probabilitySchema = z.object({
  label: z.string().min(1),
  percent: z.number().min(0).max(100),
});

const bibliographyEntrySchema = z.object({
  label: z.string().min(1),
  url: z.string().optional(),
});

export const analysisItemSchema = z.object({
  category: analysisCategorySchema,
  name: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().optional(),
  probabilities: z.array(probabilitySchema).optional(),
  variantCount: z.string().optional(),
  riskLociCount: z.number().int().optional(),
  genesAnalyzed: z.string().optional(),
  technicalNotes: z.string().optional(),
  bibliography: z.array(bibliographyEntrySchema).optional(),
});

export const analysisExtractionSchema = z.object({
  results: z.array(analysisItemSchema).min(1),
});

export type AnalysisItem = z.infer<typeof analysisItemSchema>;
