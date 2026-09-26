"use client";

import { useMemo } from "react";

import { getLandCells, project } from "@/lib/dashboard/flat-map";
import type { GlobeArc, GlobeMarker } from "./GlobeAncestry";

const WIDTH = 720;
const HEIGHT = 360; // equirectangular is 2:1 by construction

/**
 * The flat counterpart to the globe: the same markers and arcs on an
 * equirectangular world drawn as a dot matrix, so the two views read as
 * one family rather than two unrelated charts.
 *
 * It is not merely an alternative aesthetic. Every marker is visible at
 * once — a globe always hides half the world, so a patient with markers
 * in the Americas and East Asia cannot see both without dragging — and
 * the labels are plain SVG text, so they work in every browser, where
 * the globe's labels need CSS Anchor Positioning (Chromium only). The
 * globe is the better object to hold; this is the better one to read.
 */
export function FlatMapAncestry({
  markers,
  arcs = [],
  className = "",
}: {
  markers: GlobeMarker[];
  arcs?: GlobeArc[];
  className?: string;
}) {
  const land = useMemo(() => getLandCells(), []);

  // Lineage markers cluster hard — seven haplogroups can land inside a
  // few hundred kilometres of each other — so labels are placed by
  // importance and dropped when they would overlap one already placed.
  // A dropped label still leaves its dot and its <title> tooltip, and the
  // list beside the map names every step, so nothing is lost; overlapping
  // text would just make all of them unreadable.
  const points = useMemo(() => {
    const projected = markers.map((marker) => {
      const { x, y } = project(marker.location);
      return { ...marker, cx: x * WIDTH, cy: y * HEIGHT };
    });

    const byImportance = [...projected].sort(
      (a, b) => (b.weight ?? 0) - (a.weight ?? 0)
    );
    const placed: { cx: number; cy: number }[] = [];
    const labelled = new Set<string>();

    for (const point of byImportance) {
      const collides = placed.some(
        (other) =>
          Math.abs(other.cy - point.cy) < 16 &&
          Math.abs(other.cx - point.cx) < 70
      );
      if (collides) continue;
      placed.push({ cx: point.cx, cy: point.cy });
      labelled.add(point.id);
    }

    return projected.map((point) => ({
      ...point,
      showLabel: labelled.has(point.id),
    }));
  }, [markers]);

  const paths = useMemo(
    () =>
      arcs.map((arc) => {
        const from = project(arc.from);
        const to = project(arc.to);
        const x1 = from.x * WIDTH;
        const y1 = from.y * HEIGHT;
        const x2 = to.x * WIDTH;
        const y2 = to.y * HEIGHT;
        // Bow the curve perpendicular to the line so overlapping routes
        // stay distinguishable, the way the globe's arcs lift off the
        // surface. Arcs that would cross the antimeridian are drawn the
        // long way round rather than wrapping; none of the lineages we
        // plot do, and a wrong wrap would read as a real migration.
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.hypot(dx, dy) || 1;
        const lift = Math.min(length * 0.22, 54);
        return {
          id: arc.id,
          d: `M ${x1} ${y1} Q ${mx - (dy / length) * lift} ${
            my + (dx / length) * lift
          } ${x2} ${y2}`,
        };
      }),
    [arcs]
  );

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={
          markers.length > 0
            ? `World map showing ${markers.map((m) => m.label).join(", ")}`
            : "World map"
        }
      >
        <g fill="var(--muted-foreground)" opacity={0.28}>
          {land.map((cell) => (
            <circle
              key={cell.key}
              cx={cell.x * WIDTH}
              cy={cell.y * HEIGHT}
              r={1.5}
            />
          ))}
        </g>

        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            fill="none"
            stroke="var(--accent-brand)"
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.75}
          />
        ))}

        {points.map((point) => {
          const radius = 4 + (point.weight ?? 0) * 7;
          // Keep the label inside the frame: flip it to the left near the
          // eastern edge, and nudge it down near the top.
          const flip = point.cx > WIDTH - 130;
          const labelY = point.cy < 18 ? point.cy + 18 : point.cy - 10;
          return (
            <g key={point.id}>
              <circle
                cx={point.cx}
                cy={point.cy}
                r={radius + 4}
                fill={point.color ?? "var(--accent-brand)"}
                opacity={0.18}
              />
              <circle
                cx={point.cx}
                cy={point.cy}
                r={radius}
                fill={point.color ?? "var(--accent-brand)"}
                stroke="var(--card)"
                strokeWidth={1.5}
              />
              {point.showLabel && (
              <text
                x={flip ? point.cx - radius - 6 : point.cx + radius + 6}
                y={labelY}
                textAnchor={flip ? "end" : "start"}
                className="text-[13px] font-bold"
                fill="var(--foreground)"
                stroke="var(--card)"
                strokeWidth={3}
                paintOrder="stroke"
              >
                {point.label}
              </text>
              )}
              <title>{point.label}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
