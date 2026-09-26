"use client";

import type { ResultZone } from "@/lib/dashboard/result-type";
import { SEQUENTIAL_RAMP } from "./chart-tokens";

const WIDTH = 720;
const HEIGHT = 190;
const BASELINE = HEIGHT - 34;
const AMPLITUDE = BASELINE - 18;

function gaussian(x: number, mu: number, sigma: number): number {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function curveY(x: number): number {
  return BASELINE - gaussian(x, WIDTH / 2, WIDTH / 6.6) * AMPLITUDE;
}

function buildAreaPath(): string {
  const step = WIDTH / 140;
  const points: string[] = [`M 0 ${BASELINE}`];
  for (let x = 0; x <= WIDTH; x += step) {
    points.push(`L ${x.toFixed(1)} ${curveY(x).toFixed(1)}`);
  }
  points.push(`L ${WIDTH} ${BASELINE}`, "Z");
  return points.join(" ");
}

/**
 * Where this result sits in the population distribution. Used for LEVELS
 * results (quantitative biomarkers), where the zones are an ordered
 * magnitude axis rather than good/bad states — hence a single-hue
 * sequential ramp rather than the traffic light, so nothing implies that
 * higher or lower is the desirable direction. That call is clinical and
 * biomarker-specific, and this app doesn't know it.
 */
export function DistributionCurve({
  zones,
  activeIndex,
}: {
  zones: ResultZone[];
  activeIndex: number;
}) {
  const areaPath = buildAreaPath();
  const zoneWidth = WIDTH / zones.length;
  const markerX = activeIndex >= 0 ? (activeIndex + 0.5) * zoneWidth : null;
  const markerY = markerX !== null ? curveY(markerX) : null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={
        activeIndex >= 0
          ? `Population distribution: your result falls in the ${zones[activeIndex].label} range`
          : "Population distribution"
      }
    >
      <defs>
        {zones.map((_, i) => (
          <clipPath key={i} id={`dist-zone-${i}`}>
            <rect x={i * zoneWidth} y={0} width={zoneWidth} height={HEIGHT} />
          </clipPath>
        ))}
      </defs>

      {zones.map((zone, i) => (
        <g key={zone.label} clipPath={`url(#dist-zone-${i})`}>
          <path
            d={areaPath}
            fill={SEQUENTIAL_RAMP[Math.min(i, SEQUENTIAL_RAMP.length - 1)]}
            fillOpacity={i === activeIndex ? 0.55 : 0.22}
          />
          <title>{`${zone.label}${i === activeIndex ? " (your result)" : ""}`}</title>
        </g>
      ))}

      <path d={areaPath} fill="none" stroke="var(--accent-line)" strokeWidth={2} />

      {zones.slice(1).map((_, i) => {
        const x = (i + 1) * zoneWidth;
        return (
          <line
            key={i}
            x1={x}
            y1={curveY(x)}
            x2={x}
            y2={BASELINE}
            stroke="var(--border)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        );
      })}

      <line
        x1={0}
        y1={BASELINE}
        x2={WIDTH}
        y2={BASELINE}
        stroke="var(--border)"
        strokeWidth={1.5}
      />

      {markerX !== null && markerY !== null && (
        <g>
          <line
            x1={markerX}
            y1={markerY}
            x2={markerX}
            y2={BASELINE}
            stroke={SEQUENTIAL_RAMP[2]}
            strokeWidth={2}
          />
          <circle
            cx={markerX}
            cy={markerY}
            r={8}
            fill={SEQUENTIAL_RAMP[2]}
            stroke="var(--card)"
            strokeWidth={2.5}
          />
        </g>
      )}

      {zones.map((zone, i) => (
        <text
          key={zone.label}
          x={(i + 0.5) * zoneWidth}
          y={BASELINE + 24}
          textAnchor="middle"
          className="text-[15px] font-semibold"
          fill={i === activeIndex ? SEQUENTIAL_RAMP[2] : "var(--muted-foreground)"}
        >
          {zone.label}
        </text>
      ))}
    </svg>
  );
}
