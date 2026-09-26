// A single part-of-whole value with the number itself as the hero, so
// the ring is reinforcement rather than the only way to read it.
export function PopulationDonut({
  percent,
  size = 88,
  thickness = 10,
}: {
  percent: number;
  size?: number;
  thickness?: number;
}) {
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-base font-extrabold text-foreground">
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
}
