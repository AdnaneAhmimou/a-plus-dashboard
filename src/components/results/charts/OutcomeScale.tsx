"use client";

import { SEQUENTIAL_RAMP } from "./chart-tokens";

/**
 * An ordered categorical scale with one step marked as the person's
 * result: pharmacogenetic metabolizer status (Poor to Ultrarapid) is the
 * case this exists for. Rendered as discrete segments rather than a
 * continuous axis because the result genuinely is one of a few named
 * states, with nothing in between.
 *
 * Tone is deliberately neutral across every step. Metabolizer status is
 * not good or bad: it affects dosing, which is a prescriber's decision,
 * and colouring "Poor" as a warning would tell the patient something
 * this app has no basis to say.
 */
export function OutcomeScale({
  steps,
  activeIndex,
  caption,
}: {
  steps: string[];
  activeIndex: number;
  caption?: string;
}) {
  return (
    <div>
      <div className="flex gap-1.5" role="img" aria-label={buildLabel(steps, activeIndex)}>
        {steps.map((step, i) => {
          const isActive = i === activeIndex;
          return (
            <div key={step} className="flex-1">
              <div
                className="h-2.5 rounded-full"
                style={{
                  backgroundColor: isActive ? SEQUENTIAL_RAMP[2] : "var(--secondary)",
                }}
              />
              <div
                className={`mt-2 text-center text-[13px] leading-tight ${
                  isActive
                    ? "font-extrabold text-foreground"
                    : "font-semibold text-muted-foreground"
                }`}
              >
                {step}
              </div>
              {isActive && (
                <div className="mt-1 text-center text-[11px] font-bold tracking-wide text-primary uppercase">
                  your result
                </div>
              )}
            </div>
          );
        })}
      </div>
      {caption && (
        <p className="mt-4 text-sm font-medium text-muted-foreground">{caption}</p>
      )}
    </div>
  );
}

function buildLabel(steps: string[], activeIndex: number): string {
  const scale = steps.join(", ");
  return activeIndex >= 0
    ? `Scale: ${scale}. Your result: ${steps[activeIndex]}.`
    : `Scale: ${scale}.`;
}
