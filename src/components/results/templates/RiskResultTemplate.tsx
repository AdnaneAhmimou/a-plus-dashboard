import { Target } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  getResultZones,
  getActiveZoneIndex,
  parsePopulationPercent,
} from "@/lib/dashboard/result-type";
import { RiskDonut } from "@/components/results/charts/RiskDonut";
import { RiskSpectrum } from "@/components/results/charts/RiskSpectrum";
import { PopulationDonut } from "@/components/results/charts/PopulationDonut";
import { ZONE_COLOR, ZONE_SURFACE } from "@/components/results/charts/chart-tokens";
import { ResultSections } from "@/components/results/blocks/ResultSections";
import type { ResultDetailData } from "@/components/results/ResultDetail";

/**
 * Polygenic disease-risk results ("Medium risk"): an ordinal Low /
 * Medium / High scale, shown as a donut plus a linear spectrum, with the
 * population context the source report quotes alongside it.
 */
export function RiskResultTemplate({ result }: { result: ResultDetailData }) {
  const zones = getResultZones("RISK");
  const activeIndex = getActiveZoneIndex(result.summary, "RISK");
  const populationPercent = parsePopulationPercent(result.resultContext);
  const tone = activeIndex >= 0 ? zones[activeIndex].tone : "info";

  return (
    <div className="flex flex-col gap-5">
      <Card className="overflow-hidden p-0">
        <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr]">
          <div className="flex flex-col gap-6 p-7 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-wide text-primary uppercase">
                {result.categoryLabel}
              </p>
              <h1 className="mt-2 font-display text-[32px] leading-[1.1] font-extrabold tracking-[-0.8px] text-foreground">
                {result.name}
              </h1>

              <span
                className="mt-3 inline-block rounded-full px-3.5 py-1.5 text-sm font-bold"
                style={{
                  color: ZONE_COLOR[tone],
                  backgroundColor: ZONE_SURFACE[tone],
                }}
              >
                {result.summary}
              </span>

              {result.resultContext && (
                <p className="mt-3 max-w-sm text-sm leading-relaxed font-medium text-muted-foreground">
                  {result.resultContext}
                </p>
              )}

              {result.riskLociCount != null && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
                    <Target size={15} strokeWidth={2} className="text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {result.riskLociCount} risk loci analyzed
                  </span>
                </div>
              )}
            </div>

            <div className="shrink-0 sm:pl-4">
              <RiskDonut
                zones={zones}
                activeIndex={activeIndex}
                headline={result.summary}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-border bg-accent-2/40 p-7 xl:border-t-0 xl:border-l">
            {populationPercent != null && (
              <div>
                <h2 className="mb-3 font-display text-sm font-extrabold text-foreground">
                  Population context
                </h2>
                <div className="flex items-center gap-4">
                  <PopulationDonut percent={populationPercent} />
                  <p className="text-xs leading-relaxed font-medium text-muted-foreground">
                    {result.resultContext}
                  </p>
                </div>
              </div>
            )}

            <div className={populationPercent != null ? "border-t border-border pt-5" : ""}>
              <h2 className="mb-1 font-display text-sm font-extrabold text-foreground">
                Risk spectrum
              </h2>
              <RiskSpectrum
                zones={zones}
                activeIndex={activeIndex}
                caption={
                  activeIndex >= 0
                    ? `Your genetic result sits in the ${zones[activeIndex].label.toLowerCase()} range.`
                    : null
                }
              />
            </div>
          </div>
        </div>
      </Card>

      <ResultSections result={result} />
    </div>
  );
}
