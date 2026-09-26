import {
  WORLD_MASK_BASE64,
  WORLD_MASK_COLS,
  WORLD_MASK_ROWS,
} from "./world-mask";

// Equirectangular projection and the land mask the flat map draws from.
// Equirectangular is chosen over anything fancier because it is the one
// projection where the maths is obvious at a glance — longitude and
// latitude map linearly to x and y — which matters more here than area
// fidelity: the map is a locator for a handful of markers, not a
// surface anyone measures off.

export interface LandCell {
  /** Grid position, used only as a stable React key. */
  key: string;
  /** Fractions of the plot area, 0-1. */
  x: number;
  y: number;
}

let cached: LandCell[] | null = null;

/**
 * The land cells, decoded once and memoised. Each is a point in 0-1
 * space so the caller can scale it to whatever viewBox it uses.
 */
export function getLandCells(): LandCell[] {
  if (cached) return cached;

  const binary = atobSafe(WORLD_MASK_BASE64);
  const cells: LandCell[] = [];

  for (let row = 0; row < WORLD_MASK_ROWS; row++) {
    for (let col = 0; col < WORLD_MASK_COLS; col++) {
      const index = row * WORLD_MASK_COLS + col;
      const byte = binary.charCodeAt(index >> 3);
      const isLand = (byte & (128 >> (index & 7))) !== 0;
      if (!isLand) continue;
      cells.push({
        key: `${col}-${row}`,
        x: (col + 0.5) / WORLD_MASK_COLS,
        y: (row + 0.5) / WORLD_MASK_ROWS,
      });
    }
  }

  cached = cells;
  return cells;
}

/** `atob` in the browser, Buffer on the server (this runs in both). */
function atobSafe(value: string): string {
  if (typeof atob === "function") return atob(value);
  return Buffer.from(value, "base64").toString("binary");
}

/**
 * [latitude, longitude] to fractions of the plot area, 0-1. Out-of-range
 * values are clamped rather than allowed to draw off-canvas.
 */
export function project(location: [number, number]): { x: number; y: number } {
  const [lat, lon] = location;
  return {
    x: clamp01((lon + 180) / 360),
    y: clamp01((90 - lat) / 180),
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
