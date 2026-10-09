import { Activity, Info } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getResultZones, getActiveZoneIndex } from "@/lib/dashboard/result-type";
import { DistributionCurve } from "@/components/results/charts/DistributionCurve";
import { ResultSections } from "@/components/results/blocks/ResultSections";
import type { ResultDetailData } from "@/components/results/ResultDetail";

/**
 * Quantitative biomarker results ("Average levels", "Low density"):
 * where the patient sits in the population distribution. Deliberately
 * carries no good/bad colouring — whether high or low is favourable is
 * biomarker-specific clinical knowledge this app doesn't have, so the
 * curve uses a neutral single-hue ramp and the copy says "predicted",
 * never "normal" or "abnormal".
 */
export function LevelsResultTemplate({ result }: { result: ResultDetailData }) {
  const zones = getResultZones("LEVELS");
  const activeIndex = getActiveZoneIndex(result.summary, "LEVELS");

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Activity size={24} strokeWidth={1.8} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-primary uppercase">
                {result.categoryLabel}
              </p>
              <h1 className="mt-1 font-display text-[30px] leading-[1.12] font-extrabold tracking-[-0.7px] text-foreground">
                {result.name}
              </h1>
              <p className="mt-1.5 text-base font-bold text-primary">
                Genetically predicted: {result.summary}
              </p>
            </div>
          </div>

          {result.riskLociCount != null && (
            <div className="flex shrink-0 items-center gap-3 sm:border-l sm:border-border sm:pl-6">
              <div className="flex size-16 items-center justify-center rounded-full border-[3px] border-primary">
                <span className="font-display text-lg font-extrabold text-foreground">
                  {result.riskLociCount}
                </span>
              </div>
              <span className="max-w-[92px] text-sm leading-tight font-semibold text-muted-foreground">
                risk loci analyzed
              </span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <DistributionCurve zones={zones} activeIndex={activeIndex} />
        </div>
      </Card>

      <ResultSections
        result={result}
        meansExtra={
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-info-surface/60 p-4">
            <Info
              size={16}
              strokeWidth={2.1}
              className="mt-0.5 shrink-0 text-info"
            />
            <div>
              <p className="text-sm font-bold text-info">
                This is not a measured value
              </p>
              <p className="mt-1 text-xs leading-relaxed font-medium text-foreground/80">
                It estimates what your genetics predict, not what a laboratory
                test of your current levels would show. A clinical test is
                needed for your actual value.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
