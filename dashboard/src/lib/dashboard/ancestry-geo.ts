// Approximate coordinates used only to place markers on the ancestry
// globe. These are visual centroids for broad regions and the commonly
// cited origin areas of major haplogroups — good enough to draw a marker
// or a migration arc in roughly the right place, not a scientific claim
// about where a lineage arose. Anything not in these tables is simply
// not drawn (see lookup functions below); nothing is guessed.

export type LatLng = [number, number];

const REGION_COORDS: Record<string, LatLng> = {
  // Broad regions (tellmeGen's top-level composition labels)
  europe: [50, 10],
  america: [12, -78],
  africa: [4, 20],
  "western asia": [33, 44],
  "east asia": [35, 105],
  "south asia": [22, 78],
  "southeast asia": [10, 106],
  "central asia": [43, 65],
  oceania: [-25, 135],
  "middle east": [30, 45],
  // Sub-regions
  "north africa": [28, 10],
  "sub-saharan africa": [0, 20],
  "west africa": [10, -2],
  "east africa": [5, 38],
  "north america": [45, -100],
  "south america": [-15, -60],
  "central america": [15, -90],
  "northern europe": [60, 15],
  "southern europe": [40, 12],
  "eastern europe": [52, 30],
  "western europe": [48, 2],
  "north asia": [60, 90],
  "native american": [20, -100],
  "ashkenazi jewish": [50, 20],
};

const HAPLOGROUP_COORDS: Record<string, LatLng> = {
  // Maternal (mtDNA) — origin areas as commonly presented
  L: [8, 38],
  L0: [-20, 25],
  L1: [2, 20],
  L2: [10, 0],
  L3: [15, 35],
  M: [22, 78],
  N: [25, 45],
  R: [28, 55],
  R0: [24, 44],
  HV: [35, 40],
  H: [42, 20],
  H1: [42, 0],
  V: [42, -4],
  U: [32, 50],
  K: [35, 38],
  J: [33, 44],
  T: [34, 42],
  X: [37, 40],
  I: [33, 40],
  W: [32, 48],
  // Paternal (Y-DNA) — where the label differs from mtDNA usage the
  // paternal meaning is the one used here.
  A: [0, 25],
  B: [2, 20],
  CT: [10, 40],
  CF: [12, 42],
  DE: [12, 38],
  E: [10, 30],
  E1b1b: [30, 15],
  F: [28, 55],
  G: [42, 44],
  I1: [60, 15],
  I2: [45, 18],
  J1: [30, 46],
  J2: [36, 42],
  O: [30, 110],
  P: [45, 70],
  Q: [55, 90],
  R1: [50, 60],
  R1a: [52, 35],
  R1b: [48, 5],
};

export function regionCoords(region: string): LatLng | null {
  return REGION_COORDS[region.trim().toLowerCase()] ?? null;
}

export function haplogroupCoords(haplogroup: string): LatLng | null {
  return HAPLOGROUP_COORDS[haplogroup.trim()] ?? null;
}
