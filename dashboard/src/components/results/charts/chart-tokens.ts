import type { ZoneTone } from "@/lib/dashboard/result-type";

// Chart colours resolve to the design system's status tokens, not to
// hexes invented here. The status palette was checked with the dataviz
// palette validator: it passes, with two conditions that every chart
// below honours — adjacent-pair CVD separation sits in the 6–8 band and
// the amber falls under 3:1 contrast, so each zone MUST carry a visible
// text label and the segments MUST be separated by a gap. Never render
// these zones as colour alone.
export const ZONE_COLOR: Record<ZoneTone, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  info: "var(--info)",
  neutral: "var(--primary)",
};

export const ZONE_SURFACE: Record<ZoneTone, string> = {
  success: "var(--success-surface)",
  warning: "var(--warning-surface)",
  destructive: "var(--destructive-surface)",
  info: "var(--info-surface)",
  neutral: "var(--secondary)",
};

// Sequential (single-hue, light -> deep) ramp for LEVELS results, whose
// zones are an ordered magnitude axis rather than good/bad states. Using
// a sequential ramp instead of the traffic light is deliberate: it
// encodes "more of the measured thing", not "worse".
//
// Tinted with the brand purple so the chart accent matches the buttons
// and icons rather than reading as a second, unrelated system.
export const SEQUENTIAL_RAMP = ["#efe2ee", "#cf9ac9", "#8a237f"];

/** Fill for a zone at `index`, dimmed unless it's the active one. */
export function zoneFill(
  tone: ZoneTone,
  index: number,
  isActive: boolean
): string {
  if (tone === "neutral") {
    return isActive ? SEQUENTIAL_RAMP[2] : SEQUENTIAL_RAMP[Math.min(index, 1)];
  }
  return isActive ? ZONE_COLOR[tone] : ZONE_SURFACE[tone];
}
