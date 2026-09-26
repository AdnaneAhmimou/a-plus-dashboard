import { CheckCircle2, AlertCircle, Dna, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { getActiveZoneIndex } from "@/lib/dashboard/result-type";
import { ResultSections } from "@/components/results/blocks/ResultSections";
import type { ResultDetailData } from "@/components/results/ResultDetail";

/**
 * Monogenic carrier-status results ("Variant present" / "Variant
 * absent"). Binary rather than a scale, so there's no gauge — the whole
 * hero IS the status. "Present" is rendered informational, never
 * alarming: carrying one copy of a recessive variant is a carrier
 * finding, not a diagnosis, and the copy says so explicitly.
 */
export function CarrierResultTemplate({ result }: { result: ResultDetailData }) {
  // Zone 0 = absent, 1 = present (see getResultZones("CARRIER")).
  const activeIndex = getActiveZoneIndex(result.summary, "CARRIER");
  const isPresent = activeIndex === 1;

  const StatusIcon = isPresent ? AlertCircle : CheckCircle2;
  const color = isPresent ? "var(--info)" : "var(--success)";
  const surface = isPresent ? "var(--info-surface)" : "var(--success-surface)";

  const genes = result.genesAnalyzed
    ? result.genesAnalyzed.split(",").map((g) => g.trim()).filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-wide text-primary uppercase">
              {result.categoryLabel}
            </p>
            <h1 className="mt-2 font-display text-[30px] leading-[1.12] font-extrabold tracking-[-0.7px] text-foreground">
              {result.name}
            </h1>

            <span
              className="mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold"
              style={{ color, backgroundColor: surface }}
            >
              <StatusIcon size={15} strokeWidth={2.2} />
              {result.summary}
            </span>

            {genes.length > 0 && genes.length <= 3 && (
              <div className="mt-4 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary">
                  <Dna size={15} strokeWidth={2} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Gene analyzed: {genes.join(", ")}
                </span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-center gap-2 sm:pl-6">
            <div
              className="flex size-[132px] items-center justify-center rounded-full border-[10px]"
              style={{ borderColor: surface }}
            >
              <StatusIcon size={54} strokeWidth={1.6} style={{ color }} />
            </div>
            <span
              className="font-display text-sm font-extrabold"
              style={{ color }}
            >
              {isPresent ? "Variant found" : "No variant found"}
            </span>
          </div>
        </div>

        <div
          className="mt-6 flex items-start gap-2.5 rounded-xl p-4"
          style={{ backgroundColor: surface }}
        >
          <Users size={16} strokeWidth={2.1} className="mt-0.5 shrink-0" style={{ color }} />
          <div>
            <p className="text-sm font-bold" style={{ color }}>
              {isPresent ? "What being a carrier means" : "No variant detected"}
            </p>
            <p className="mt-1 text-xs leading-relaxed font-medium text-foreground/80">
              {isPresent
                ? "Carrying one copy of a recessive variant usually means no symptoms, but it can be passed on to children. Genetic counselling is recommended if you are planning a pregnancy."
                : "The variants analyzed for this condition were not detected. This test covers specific known variants and does not rule out every possible cause."}
            </p>
          </div>
        </div>
      </Card>

      <ResultSections result={result} meansLabel="About this condition" />
    </div>
  );
}
