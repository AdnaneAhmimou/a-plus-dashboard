import type { KitStatus } from "@prisma/client";
import { ALL_KIT_STATUSES } from "@/lib/dashboard/kit-status";

// Chrono Diali's webhook `type` values that correspond to forward
// progress in our pipeline. Everything else (cancelled, lost, on_hold,
// rto_*, softdata_update, ...) has no equivalent in our KitStatus enum —
// those events are still recorded in CourierEvent for audit purposes,
// they just don't move the box's status. Deliberately never maps to
// RESULTS_READY: that transition only happens by uploading a report (see
// kit-status.ts), never from a courier event — "delivered" only means
// the box physically arrived at the lab, not that testing is done.
const COURIER_EVENT_TO_KIT_STATUS: Partial<Record<string, KitStatus>> = {
  pickup_scheduled: "PICKUP_REQUESTED",
  pickup_completed: "PICKED_UP",
  out_for_pickup: "PICKED_UP",
  inscan_at_hub: "IN_TRANSIT",
  intransittohub: "IN_TRANSIT",
  reachedathub: "IN_TRANSIT",
  outfordelivery: "IN_TRANSIT",
  delivered: "TESTING",
  delivery_pod: "TESTING",
};

export function chronoEventTypeToKitStatus(type: string): KitStatus | null {
  return COURIER_EVENT_TO_KIT_STATUS[type] ?? null;
}

// The webhook can arrive out of order or duplicated — only ever move the
// pipeline forward, never backward or sideways to the same status.
export function isForwardKitStatusProgress(
  current: KitStatus,
  next: KitStatus
): boolean {
  return ALL_KIT_STATUSES.indexOf(next) > ALL_KIT_STATUSES.indexOf(current);
}
