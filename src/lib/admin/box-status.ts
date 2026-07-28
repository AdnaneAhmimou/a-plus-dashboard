import type { BoxStatus } from "@prisma/client";

export const BOX_STATUS_BADGE: Record<
  BoxStatus,
  { label: string; tone: "muted" | "primary" | "success" }
> = {
  AVAILABLE: { label: "Available", tone: "muted" },
  SENT: { label: "Sent to client", tone: "primary" },
  ASSOCIATED: { label: "Associated", tone: "success" },
};
