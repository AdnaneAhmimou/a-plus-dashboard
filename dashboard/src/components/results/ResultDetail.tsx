import { detectResultType } from "@/lib/dashboard/result-type";
import type { ProbabilityPoint } from "@/components/results/ProbabilityBars";
import { RiskResultTemplate } from "@/components/results/templates/RiskResultTemplate";
import { LevelsResultTemplate } from "@/components/results/templates/LevelsResultTemplate";
import { CarrierResultTemplate } from "@/components/results/templates/CarrierResultTemplate";
import { ProbabilityResultTemplate } from "@/components/results/templates/ProbabilityResultTemplate";
import { OutcomeResultTemplate } from "@/components/results/templates/OutcomeResultTemplate";

export interface ResultDetailData {
  name: string;
  summary: string;
  categoryLabel: string;
  description: string | null;
  resultContext: string | null;
  probabilities: ProbabilityPoint[] | null;
  variantCount: string | null;
  riskLociCount: number | null;
  genesAnalyzed: string | null;
  technicalNotes: string | null;
  bibliography: { label: string; url?: string }[] | null;
  causesAndRiskFactors: string | null;
  symptoms: string | null;
  prevention: string | null;
  diseaseManagement: string | null;
  studyLimitations: string | null;
}

/**
 * Picks the layout that fits the shape of the result. The source reports
 * come in five shapes (see detectResultType) and forcing them into one
 * template is what made the old single layout feel thin: a carrier
 * result has no scale to plot, a biomarker level has no risk tier, and
 * eye colour has no axis at all.
 */
export function ResultDetail({ result }: { result: ResultDetailData }) {
  switch (detectResultType(result.summary)) {
    case "RISK":
      return <RiskResultTemplate result={result} />;
    case "CARRIER":
      return <CarrierResultTemplate result={result} />;
    case "LEVELS":
      return <LevelsResultTemplate result={result} />;
    case "PROBABILITY":
      return <ProbabilityResultTemplate result={result} />;
    case "OUTCOME":
      return <OutcomeResultTemplate result={result} />;
  }
}
