import type { BoxStatus } from "@prisma/client";

import { Badge } from "@/components/admin/Badge";
import { BOX_STATUS_BADGE } from "@/lib/admin/box-status";

export function BoxStatusBadge({ status }: { status: BoxStatus }) {
  const { label, tone } = BOX_STATUS_BADGE[status];
  return <Badge label={label} tone={tone} />;
}
