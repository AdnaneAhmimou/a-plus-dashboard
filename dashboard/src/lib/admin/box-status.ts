import type { BoxStatus } from "@prisma/client";

export const BOX_STATUS_BADGE: Record<
  BoxStatus,
  { label: string; tone: "muted" | "primary" | "success" | "warn" }
> = {
  AVAILABLE: { label: "Available", tone: "muted" },
  SENT: { label: "Sent to client", tone: "primary" },
  ASSOCIATED: { label: "Associated", tone: "success" },
  // The patient deleted their account: the box is detached, its results
  // are erased, and the number can never be registered again.
  RETIRED: { label: "Retired", tone: "warn" },
};
