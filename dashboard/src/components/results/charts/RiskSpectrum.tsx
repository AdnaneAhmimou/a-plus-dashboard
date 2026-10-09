"use client";

import type { ResultZone } from "@/lib/dashboard/result-type";
import { ZONE_COLOR, zoneFill } from "./chart-tokens";

/**
 * The same ordinal scale as RiskDonut, laid out linearly with a marker
 * pin over the active band. Every band is labelled underneath, which is
 * also what makes the amber band legal under the palette validator's
 * contrast warning.
 */
export function RiskSpectrum({
  zones,
  activeIndex,
  caption,
}: {
  zones: ResultZone[];
  activeIndex: number;
  caption?: string | null;
}) {
  return (
    <div>
      <div className="relative pt-4">
        {activeIndex >= 0 && (
          <div
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `${((activeIndex + 0.5) / zones.length) * 100}%` }}
          >
            <div
              className="size-2.5 rounded-full ring-2 ring-card"
              style={{ backgroundColor: ZONE_COLOR[zones[activeIndex].tone] }}
            />
            <div
              className="mx-auto h-2 w-0.5"
              style={{ backgroundColor: ZONE_COLOR[zones[activeIndex].tone] }}
            />
          </div>
        )}

        <div className="flex gap-1">
          {zones.map((zone, i) => (
            <div
              key={zone.label}
              className="h-2.5 flex-1 rounded-full transition-opacity"
              style={{ backgroundColor: zoneFill(zone.tone, i, i === activeIndex) }}
              title={`${zone.label}${i === activeIndex ? " — your result" : ""}`}
            />
          ))}
        </div>

        <div className="mt-1.5 flex gap-1">
          {zones.map((zone, i) => (
            <div
              key={zone.label}
              className={`flex-1 text-center text-[11px] font-semibold ${
                i === activeIndex ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {zone.label}
            </div>
          ))}
        </div>
      </div>

      {caption && (
        <p className="mt-3 text-xs leading-relaxed font-medium text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
}
