import { cn } from "@/lib/utils";

export type BadgeTone = "muted" | "primary" | "info" | "warn" | "success";

const TONE_CLASSES: Record<BadgeTone, string> = {
  muted: "bg-muted text-muted-foreground",
  primary: "bg-secondary text-primary",
  info: "bg-info-surface text-info",
  warn: "bg-warning-surface text-warning",
  success: "bg-success-surface text-success",
};

export function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        TONE_CLASSES[tone]
      )}
    >
      {label}
    </span>
  );
}
