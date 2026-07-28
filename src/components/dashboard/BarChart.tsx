export interface BarChartPoint {
  label: string;
  value: number;
}

// Plain CSS bars, no chart library — consistent with DonutRing being
// hand-rolled SVG rather than a dependency. Fine at this data volume
// (a handful of bars, a few dozen data points at most).
export function BarChart({
  data,
  height = 160,
}: {
  data: BarChartPoint[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d) => (
        <div
          key={d.label}
          className="flex h-full flex-1 flex-col items-center justify-end gap-2"
        >
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            {d.value}
          </span>
          <div
            className="w-full rounded-t-md bg-primary"
            style={{
              height: `${(d.value / max) * (height - 56)}px`,
              minHeight: d.value > 0 ? 4 : 0,
            }}
          />
          <span className="text-[11px] font-semibold text-muted-foreground">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
