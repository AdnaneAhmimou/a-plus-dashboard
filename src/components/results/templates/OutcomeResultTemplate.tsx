import { Fingerprint, Info, Pill } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  METABOLIZER,
  METABOLIZER_STEPS,
  getMetabolizerIndex,
} from "@/lib/dashboard/result-type";
import { OutcomeScale } from "@/components/results/charts/OutcomeScale";
import { ResultSections } from "@/components/results/blocks/ResultSections";
import type { ResultDetailData } from "@/components/results/ResultDetail";

/**
 * Categorical results: the answer is a named state, not a position on a
 * magnitude axis. Two flavours:
 *
 *   - Pharmacogenetic metabolizer status, which is an ordered scale the
 *     source names explicitly (Poor to Ultrarapid), so it gets the scale.
 *   - Everything else ("Light eyes", "Farmer profile", "Secretory
 *     state"), where there is no ordering at all, so the result is
 *     stated plainly and nothing is plotted.
 *
 * That second case is why this template exists. These results used to
 * fall through to the LEVELS bell curve, which drew eye colour as a
 * position on a distribution and implied a magnitude the result does not
 * have.
 */
export function OutcomeResultTemplate({ result }: { result: ResultDetailData }) {
  const isMetabolizer = METABOLIZER.test(result.summary);
  const metabolizerIndex = isMetabolizer ? getMetabolizerIndex(result.summary) : -1;

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary">
              {isMetabolizer ? (
                <Pill size={24} strokeWidth={1.8} className="text-primary" />
              ) : (
                <Fingerprint size={24} strokeWidth={1.8} className="text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-primary uppercase">
                {result.categoryLabel}
              </p>
              <h1 className="mt-1 font-display text-[30px] leading-[1.12] font-extrabold tracking-[-0.7px] text-foreground">
                {result.name}
              </h1>
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
                markers analyzed
              </span>
            </div>
          )}
        </div>

        {/* The result itself, stated as a sentence rather than a chart. */}
        <div className="mt-6 rounded-2xl bg-secondary/70 p-6">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Your result
          </p>
          <p className="mt-2 font-display text-2xl leading-snug font-extrabold tracking-[-0.3px] text-foreground">
            {result.summary}
          </p>
        </div>

        {metabolizerIndex >= 0 && (
          <div className="mt-7">
            <p className="mb-4 text-sm font-bold text-foreground">
              Where that sits on the metabolizer scale
            </p>
            <OutcomeScale
              steps={METABOLIZER_STEPS}
              activeIndex={metabolizerIndex}
              caption="This scale describes how quickly your body is predicted to process certain medicines. No point on it is better or worse; it is information for a prescriber, not a health grade."
            />
          </div>
        )}
      </Card>

      <ResultSections
        result={result}
        meansExtra={
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-info-surface/60 p-4">
            <Info size={16} strokeWidth={2.1} className="mt-0.5 shrink-0 text-info" />
            <div>
              <p className="text-sm font-bold text-foreground">
                {isMetabolizer ? "Never change a dose on your own" : "A predicted characteristic"}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed font-medium text-muted-foreground">
                {isMetabolizer
                  ? "Share this with your doctor or pharmacist before any change to a medicine. Dosing depends on much more than this one result."
                  : "This is what your genetics point to. Environment, age and chance also shape the result, so it may not match what you observe."}
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
