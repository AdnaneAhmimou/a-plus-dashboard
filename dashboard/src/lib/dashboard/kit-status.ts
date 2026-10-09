import { PackageCheck, Truck, FlaskConical, FileText } from "lucide-react";
import type { KitStatus } from "@prisma/client";

export const KIT_STEPS = [
  { label: "Picked Up", icon: PackageCheck },
  { label: "In Delivery", icon: Truck },
  { label: "Testing", icon: FlaskConical },
  { label: "Results", icon: FileText },
];

// Where the box is on the 4-step visual rail, given its raw status.
// PICKUP_REQUESTED shows step 0 ("Picked Up") as in-progress rather than
// done — the box hasn't physically been collected yet, we've just asked
// the courier to come get it.
export function getKitActiveIndex(status: KitStatus): number {
  switch (status) {
    case "NOT_REQUESTED":
    case "PICKUP_REQUESTED":
      return 0;
    case "PICKED_UP":
      return 1;
    case "IN_TRANSIT":
      return 2;
    case "TESTING":
      return 3;
    case "RESULTS_READY":
      return 4;
  }
}

export const KIT_STATUS_COPY: Record<KitStatus, string> = {
  NOT_REQUESTED: "Request a pickup to get started",
  PICKUP_REQUESTED: "Pickup requested — waiting for the courier",
  PICKED_UP: "Box collected by courier",
  IN_TRANSIT: "On its way to the laboratory",
  TESTING: "Sample is being tested",
  RESULTS_READY: "Results are ready",
};

// Admin-side forward-only pipeline. NOT_REQUESTED has no next step here —
// only the patient can trigger a pickup request. TESTING is the last step
// this generic "advance" action can reach: TESTING -> RESULTS_READY only
// happens by uploading a report (see /api/admin/patients/[id]/reports),
// so that "results ready" can never be true without an actual PDF behind
// it — otherwise the analytics "completed" count would be lying.
const NEXT_STATUS: Partial<Record<KitStatus, KitStatus>> = {
  PICKUP_REQUESTED: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "TESTING",
};

export function getNextKitStatus(status: KitStatus): KitStatus | null {
  return NEXT_STATUS[status] ?? null;
}

export const ADVANCE_ACTION_LABEL: Partial<Record<KitStatus, string>> = {
  PICKUP_REQUESTED: "Mark as picked up",
  PICKED_UP: "Mark as in transit",
  IN_TRANSIT: "Mark as testing",
};

export const KIT_STATUS_BADGE: Record<
  KitStatus,
  { label: string; tone: "muted" | "primary" | "info" | "warn" | "success" }
> = {
  NOT_REQUESTED: { label: "Not requested", tone: "muted" },
  PICKUP_REQUESTED: { label: "Pickup requested", tone: "primary" },
  PICKED_UP: { label: "Picked up", tone: "primary" },
  IN_TRANSIT: { label: "In transit", tone: "info" },
  TESTING: { label: "Testing", tone: "warn" },
  RESULTS_READY: { label: "Results ready", tone: "success" },
};

// Every KitStatus value, in pipeline order — for building complete
// breakdowns (e.g. analytics) that always show every bucket, even ones
// currently at zero.
export const ALL_KIT_STATUSES: KitStatus[] = [
  "NOT_REQUESTED",
  "PICKUP_REQUESTED",
  "PICKED_UP",
  "IN_TRANSIT",
  "TESTING",
  "RESULTS_READY",
];

// Solid (non-surface) color for each badge tone, as a CSS var reference —
// for chart contexts (donut segments) that need an actual paint color
// rather than a Tailwind class.
const TONE_COLOR_VAR: Record<string, string> = {
  muted: "var(--faint)",
  primary: "var(--primary)",
  info: "var(--info)",
  warn: "var(--warning)",
  success: "var(--success)",
};

export function kitStatusColor(status: KitStatus): string {
  return TONE_COLOR_VAR[KIT_STATUS_BADGE[status].tone];
}

// Which Box column to stamp with `new Date()` when a status is reached —
// shared by every place that moves kitStatus forward (admin's manual
// advance button and the Chrono Diali webhook alike).
export const KIT_STATUS_TIMESTAMP_FIELD: Partial<Record<KitStatus, string>> = {
  PICKED_UP: "pickedUpAt",
  IN_TRANSIT: "inTransitAt",
  TESTING: "testingAt",
  RESULTS_READY: "resultsReadyAt",
};
