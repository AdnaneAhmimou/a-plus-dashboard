import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<string, string> = {
  muted: "text-muted-foreground",
  primary: "text-primary",
  info: "text-info",
  warn: "text-warning",
  success: "text-success",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  tone?: "muted" | "primary" | "info" | "warn" | "success";
}) {
  return (
    <Card className="p-5">
      <div className={cn("flex items-center gap-2.5", TONE_TEXT[tone])}>
        <Icon size={19} strokeWidth={1.9} />
        <span className="text-[12.5px] font-bold text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="font-display mt-3 text-[22px] font-extrabold text-foreground">
        {value}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-muted-foreground">
        {caption}
      </div>
    </Card>
  );
}
