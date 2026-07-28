import type { AnalysisCategory } from "@prisma/client";
import {
  HeartPulse,
  Dna,
  Pill,
  Fingerprint,
  Sparkles,
  Globe2,
  type LucideIcon,
} from "lucide-react";

export interface CategoryMeta {
  label: string;
  description: string;
  slug: string;
  icon: LucideIcon;
}

export const CATEGORY_META: Record<AnalysisCategory, CategoryMeta> = {
  HEALTH_CONDITIONS: {
    label: "Genetic vulnerability to health conditions",
    description: "Predisposition to common health conditions based on your DNA.",
    slug: "health-conditions",
    icon: HeartPulse,
  },
  HEREDITARY_CONDITIONS: {
    label: "Hereditary conditions",
    description: "Inherited conditions linked to specific gene variants.",
    slug: "hereditary-conditions",
    icon: Dna,
  },
  PHARMACOLOGY: {
    label: "Pharmacology",
    description: "How your genetics may affect your response to medications.",
    slug: "pharmacology",
    icon: Pill,
  },
  TRAITS: {
    label: "Traits",
    description: "Physical and biological traits linked to your genetics.",
    slug: "traits",
    icon: Fingerprint,
  },
  WELLNESS: {
    label: "Wellness",
    description: "Genetic factors related to diet, fitness, and lifestyle.",
    slug: "wellness",
    icon: Sparkles,
  },
  ANCESTRY: {
    label: "Ancestry",
    description: "Insights into your genetic ancestry and origins.",
    slug: "ancestry",
    icon: Globe2,
  },
};

// Fixed display order for the 6-card grid — matches the reference platform.
export const CATEGORY_ORDER: AnalysisCategory[] = [
  "HEALTH_CONDITIONS",
  "HEREDITARY_CONDITIONS",
  "PHARMACOLOGY",
  "TRAITS",
  "WELLNESS",
  "ANCESTRY",
];

const SLUG_TO_CATEGORY: Record<string, AnalysisCategory> = Object.fromEntries(
  CATEGORY_ORDER.map((category) => [CATEGORY_META[category].slug, category])
) as Record<string, AnalysisCategory>;

export function categoryFromSlug(slug: string): AnalysisCategory | null {
  return SLUG_TO_CATEGORY[slug] ?? null;
}
