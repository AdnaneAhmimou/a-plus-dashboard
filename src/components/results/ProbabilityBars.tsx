export interface ProbabilityPoint {
  label: string;
  percent: number;
}

// Plain CSS bars, consistent with the hand-rolled BarChart/DonutRing used
// elsewhere in the dashboard rather than pulling in a charting library.
export function ProbabilityBars({ data }: { data: ProbabilityPoint[] }) {
  return (
    <div className="flex flex-col gap-3">
      {data.map((point) => (
        <div key={point.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-xs font-semibold text-foreground">{point.label}</span>
            <span className="font-mono text-xs font-bold text-primary">
              {point.percent}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, Math.max(0, point.percent))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
