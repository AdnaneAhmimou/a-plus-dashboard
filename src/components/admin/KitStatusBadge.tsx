import type { KitStatus } from "@prisma/client";

import { Badge } from "@/components/admin/Badge";
import { KIT_STATUS_BADGE } from "@/lib/dashboard/kit-status";

export function KitStatusBadge({ status }: { status: KitStatus }) {
  const { label, tone } = KIT_STATUS_BADGE[status];
  return <Badge label={label} tone={tone} />;
}
