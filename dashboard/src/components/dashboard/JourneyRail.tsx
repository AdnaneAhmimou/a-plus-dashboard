import { Check, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface JourneyStep {
  label: string;
  icon: LucideIcon;
}

export function JourneyRail({
  steps,
  activeIndex,
  activeLabel = "IN PROGRESS",
}: {
  steps: JourneyStep[];
  activeIndex: number;
  activeLabel?: string;
}) {
  return (
    <div className="flex items-start">
      {steps.map(({ label, icon: Icon }, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={label} className="contents">
            <div className="flex w-[92px] flex-col items-center gap-2.5">
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  active ? "size-11" : "size-[38px]",
                  done && "border-primary bg-primary",
                  active &&
                    "border-primary-mid bg-card shadow-[0_0_0_5px_var(--secondary)]",
                  !done && !active && "border-border bg-card"
                )}
              >
                {done ? (
                  <Check size={19} strokeWidth={2.6} className="text-white" />
                ) : (
                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    className={active ? "text-primary" : "text-faint"}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-center text-[12.5px] leading-tight",
                  done || active
                    ? "font-extrabold text-foreground"
                    : "font-semibold text-faint"
                )}
              >
                {label}
              </span>
              {active && (
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold whitespace-nowrap text-primary">
                  {activeLabel}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mt-[19px] h-[3px] min-w-5 flex-1 self-start rounded",
                  i < activeIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
