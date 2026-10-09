"use client";

import type { ResultZone } from "@/lib/dashboard/result-type";
import { SEQUENTIAL_RAMP } from "./chart-tokens";

const WIDTH = 720;
const HEIGHT = 230;
const PAD_LEFT = 46;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const BASELINE = HEIGHT - 46;

const PLOT_WIDTH = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_HEIGHT = BASELINE - PAD_TOP;

// Logistic curve: the cumulative form of the bell used by LEVELS
// results. The steepness is chosen so the three zone centres land near
// 12%, 50% and 88% — roughly plus or minus one standard deviation. A
// steeper curve pushes the outer markers to 1% and 99%, which reads as
// "almost nobody is like you" for what is simply the upper third.
function cumulative(x: number): number {
  const t = (x - 0.5) * 6;
  return 1 / (1 + Math.exp(-t));
}

function pointAt(fraction: number): { x: number; y: number } {
  return {
    x: PAD_LEFT + fraction * PLOT_WIDTH,
    y: BASELINE - cumulative(fraction) * PLOT_HEIGHT,
  };
}

function buildPath(): string {
  const steps = 120;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const { x, y } = pointAt(i / steps);
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(" ");
}

/**
 * Where a PROBABILITY result sits, drawn as a cumulative population line:
 * for each point on the likelihood axis, the share of people at or below
 * it. This is the same underlying distribution the LEVELS bell curve
 * shows, read the other way round, and it suits "how likely is this for
 * me" better than a density hump does.
 *
 * The marker sits at the centre of the named zone, not at a precise
 * personal coordinate: the source states a band ("High probability"), not
 * a number, and drawing a precise point would invent precision the report
 * never gave. The caption says so, so the chart cannot be misread as a
 * measured percentile.
 */
export function ProbabilityCurve({
  zones,
  activeIndex,
}: {
  zones: ResultZone[];
  activeIndex: number;
}) {
  const path = buildPath();
  const zoneWidth = 1 / Math.max(zones.length, 1);
  const markerFraction = activeIndex >= 0 ? (activeIndex + 0.5) * zoneWidth : null;
  const marker = markerFraction !== null ? pointAt(markerFraction) : null;
  const markerPercent =
    markerFraction !== null ? Math.round(cumulative(markerFraction) * 100) : null;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={
        activeIndex >= 0
          ? `Cumulative population curve: your result falls in the ${zones[activeIndex].label} band`
          : "Cumulative population curve"
      }
    >
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = BASELINE - (tick / 100) * PLOT_HEIGHT;
        return (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              y1={y}
              x2={WIDTH - PAD_RIGHT}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray={tick === 0 ? undefined : "3 5"}
            />
            <text
              x={PAD_LEFT - 10}
              y={y + 4}
              textAnchor="end"
              className="text-[11px] font-semibold"
              fill="var(--muted-foreground)"
            >
              {tick}%
            </text>
          </g>
        );
      })}

      {/* The active band, so the zone reads without relying on the line alone. */}
      {activeIndex >= 0 && (
        <rect
          x={PAD_LEFT + activeIndex * zoneWidth * PLOT_WIDTH}
          y={PAD_TOP}
          width={zoneWidth * PLOT_WIDTH}
          height={PLOT_HEIGHT}
          fill={SEQUENTIAL_RAMP[0]}
          fillOpacity={0.7}
        />
      )}

      {zones.slice(1).map((_, i) => {
        const x = PAD_LEFT + (i + 1) * zoneWidth * PLOT_WIDTH;
        return (
          <line
            key={i}
            x1={x}
            y1={PAD_TOP}
            x2={x}
            y2={BASELINE}
            stroke="var(--border)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        );
      })}

      <path d={path} fill="none" stroke={SEQUENTIAL_RAMP[2]} strokeWidth={3} strokeLinecap="round" />

      {marker && (
        <g>
          <line
            x1={marker.x}
            y1={marker.y}
            x2={marker.x}
            y2={BASELINE}
            stroke={SEQUENTIAL_RAMP[2]}
            strokeWidth={2}
          />
          <line
            x1={PAD_LEFT}
            y1={marker.y}
            x2={marker.x}
            y2={marker.y}
            stroke={SEQUENTIAL_RAMP[2]}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <circle
            cx={marker.x}
            cy={marker.y}
            r={8}
            fill={SEQUENTIAL_RAMP[2]}
            stroke="var(--card)"
            strokeWidth={2.5}
          />
          <title>{`Your band: ${zones[activeIndex].label}${
            markerPercent !== null ? ` (around ${markerPercent}% of people are at or below this point)` : ""
          }`}</title>
        </g>
      )}

      {zones.map((zone, i) => (
        <text
          key={zone.label}
          x={PAD_LEFT + (i + 0.5) * zoneWidth * PLOT_WIDTH}
          y={BASELINE + 24}
          textAnchor="middle"
          className="text-[14px] font-semibold"
          fill={i === activeIndex ? SEQUENTIAL_RAMP[2] : "var(--muted-foreground)"}
        >
          {zone.label}
        </text>
      ))}
    </svg>
  );
}
