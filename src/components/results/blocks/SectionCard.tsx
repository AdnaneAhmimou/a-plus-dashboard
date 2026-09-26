import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export type SectionTone = "primary" | "success" | "info" | "destructive";

const ICON_STYLES: Record<SectionTone, { bg: string; fg: string }> = {
  primary: { bg: "var(--secondary)", fg: "var(--primary)" },
  success: { bg: "var(--success-surface)", fg: "var(--success)" },
  info: { bg: "var(--info-surface)", fg: "var(--info)" },
  destructive: { bg: "var(--destructive-surface)", fg: "var(--destructive)" },
};

/** The card shell every result section uses: tinted icon badge, title, content. */
export function SectionCard({
  icon: Icon,
  title,
  tone = "primary",
  className = "",
  children,
}: {
  icon: LucideIcon;
  title: string;
  tone?: SectionTone;
  className?: string;
  children: React.ReactNode;
}) {
  const style = ICON_STYLES[tone];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: style.bg }}
        >
          <Icon size={18} strokeWidth={1.9} style={{ color: style.fg }} />
        </div>
        <h2 className="font-display text-lg font-extrabold tracking-[-0.2px] text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </Card>
  );
}
