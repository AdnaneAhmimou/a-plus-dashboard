import { TrendingUp, Info, Dna } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getResultZones, getActiveZoneIndex } from "@/lib/dashboard/result-type";
import { ProbabilityCurve } from "@/components/results/charts/ProbabilityCurve";
import { ResultSections } from "@/components/results/blocks/ResultSections";
import type { ResultDetailData } from "@/components/results/ResultDetail";

/**
 * Likelihood results ("High probability of having acne", "Low probability
 * of being a redhead"): a cumulative population line rather than the
 * LEVELS bell curve. These results answer "how likely is this for me"
 * relative to everyone else, which is what a cumulative curve reads as
 * directly — the bell's hump answers a different question.
 *
 * Neutral by design, like LEVELS: more likely is not worse. Whether a
 * high probability matters is trait-specific and clinical, so the chart
 * uses the single-hue ramp and the copy says "predicted likelihood".
 */
export function ProbabilityResultTemplate({ result }: { result: ResultDetailData }) {
  const zones = getResultZones("PROBABILITY");
  const activeIndex = getActiveZoneIndex(result.summary, "PROBABILITY");

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary">
              <TrendingUp size={24} strokeWidth={1.8} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-primary uppercase">
                {result.categoryLabel}
              </p>
              <h1 className="mt-1 font-display text-[30px] leading-[1.12] font-extrabold tracking-[-0.7px] text-foreground">
                {result.name}
              </h1>
              <p className="mt-1.5 text-base font-bold text-primary">
                Predicted likelihood: {result.summary}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:border-l sm:border-border sm:pl-6">
            {result.riskLociCount != null && (
              <Stat value={String(result.riskLociCount)} label="risk loci analyzed" />
            )}
            {result.variantCount && (
              <Stat value={result.variantCount} label="variants considered" icon />
            )}
          </div>
        </div>

        <div className="mt-6">
          <ProbabilityCurve zones={zones} activeIndex={activeIndex} />
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            The line shows the share of people at or below each point on the
            likelihood axis. Your marker sits in the middle of the band your
            report names, not at an exact personal percentile, because the
            report gives a band rather than a number.
          </p>
        </div>
      </Card>

      <ResultSections
        result={result}
        meansExtra={
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-info-surface/60 p-4">
            <Info size={16} strokeWidth={2.1} className="mt-0.5 shrink-0 text-info" />
            <div>
              <p className="text-sm font-bold text-foreground">
                A likelihood, not an outcome
              </p>
              <p className="mt-0.5 text-sm leading-relaxed font-medium text-muted-foreground">
                Genetics shifts the odds; it does not decide them. Many people
                with a high predicted likelihood never develop the trait, and
                many with a low one do.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}

function Stat({
  value,
  label,
  icon = false,
}: {
  value: string;
  label: string;
  icon?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full border-[3px] border-primary">
        {icon ? (
          <Dna size={17} strokeWidth={2} className="text-primary" />
        ) : (
          <span className="font-display text-base font-extrabold text-foreground">
            {value}
          </span>
        )}
      </div>
      <span className="max-w-[120px] text-sm leading-tight font-semibold text-muted-foreground">
        {icon ? value : label}
        {icon && <span className="block text-xs font-medium">{label}</span>}
      </span>
    </div>
  );
}
