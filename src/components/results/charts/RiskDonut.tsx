"use client";

import { useState } from "react";

import type { ResultZone } from "@/lib/dashboard/result-type";
import { ZONE_COLOR, zoneFill } from "./chart-tokens";

/**
 * A position-on-an-ordinal-scale indicator, not a part-to-whole chart:
 * the three arcs are equal sixths of the ring regardless of any value,
 * and only the zone the patient falls in is drawn at full strength. The
 * active zone's name sits in the middle and every zone is named in the
 * legend, so the finding is never carried by colour alone.
 */
export function RiskDonut({
  zones,
  activeIndex,
  headline,
  size = 190,
  thickness = 18,
}: {
  zones: ResultZone[];
  activeIndex: number;
  headline: string;
  size?: number;
  thickness?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const gap = 10;
  const segment = (circumference - zones.length * gap) / zones.length;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {zones.map((zone, i) => {
            const isActive = i === activeIndex;
            return (
              <circle
                key={zone.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={zoneFill(zone.tone, i, isActive)}
                strokeWidth={hovered === i ? thickness + 3 : thickness}
                strokeLinecap="round"
                strokeDasharray={`${segment} ${circumference - segment}`}
                strokeDashoffset={-i * (segment + gap)}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-default transition-[stroke-width] duration-150"
              >
                <title>{`${zone.label}${isActive ? " (your result)" : ""}`}</title>
              </circle>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          {activeIndex >= 0 ? (
            <>
              <span
                className="font-display text-2xl leading-tight font-extrabold"
                style={{ color: ZONE_COLOR[zones[activeIndex].tone] }}
              >
                {zones[activeIndex].label}
              </span>
              <span className="mt-1 text-[11px] leading-tight font-semibold text-muted-foreground">
                your result
              </span>
            </>
          ) : (
            <span className="font-display text-sm leading-tight font-extrabold text-foreground">
              {headline}
            </span>
          )}
        </div>
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {zones.map((zone, i) => (
          <li
            key={zone.label}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: zoneFill(zone.tone, i, i === activeIndex) }}
            />
            <span
              className={
                i === activeIndex ? "text-foreground" : "text-muted-foreground"
              }
            >
              {zone.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
