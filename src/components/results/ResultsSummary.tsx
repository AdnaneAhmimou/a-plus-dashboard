import { CalendarCheck, FlaskConical, Layers, FileDown } from "lucide-react";

import { Card } from "@/components/ui/card";

/**
 * The header of the results page once results exist.
 *
 * It replaces a large "Your results are ready" panel that said nothing a
 * patient could act on: by the time they are reading this page they can
 * already see their results, so announcing their existence wasted the
 * most valuable space on the screen. This states what they actually
 * have — how many analyses, across how many sections, when it was
 * completed — and puts the report download in reach.
 */
export function ResultsSummary({
  totalAnalyses,
  categoryCount,
  boxNumber,
  readyAt,
  reportHref,
}: {
  totalAnalyses: number;
  categoryCount: number;
  boxNumber?: string;
  readyAt?: Date | null;
  reportHref?: string;
}) {
  return (
    <Card className="gap-0 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <Stat
            icon={FlaskConical}
            value={totalAnalyses.toLocaleString("en-US")}
            label={totalAnalyses === 1 ? "analysis" : "analyses"}
          />
          <Stat
            icon={Layers}
            value={String(categoryCount)}
            label={categoryCount === 1 ? "section" : "sections"}
          />
          {readyAt && (
            <Stat
              icon={CalendarCheck}
              value={readyAt.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              label="completed"
            />
          )}
        </div>

        {reportHref && (
          <a
            href={reportHref}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <FileDown size={16} strokeWidth={2} />
            Download full report
          </a>
        )}
      </div>

      {boxNumber && (
        <p className="mt-5 border-t border-border pt-4 text-xs font-medium text-muted-foreground">
          Kit <span className="font-mono font-semibold text-foreground">{boxNumber}</span>
          . Results are organised by section below. None of this is a
          diagnosis; speak to a doctor about anything that concerns you.
        </p>
      )}
    </Card>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof FlaskConical;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--accent-brand-surface)" }}
      >
        <Icon size={19} strokeWidth={1.8} style={{ color: "var(--accent-brand)" }} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl leading-tight font-extrabold text-foreground">
          {value}
        </span>
        <span className="block text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </span>
    </div>
  );
}
