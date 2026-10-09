import Link from "next/link";

import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { getSummaryTone, type ZoneTone } from "@/lib/dashboard/result-type";
import { getResultIcon } from "@/lib/dashboard/result-icons";

export interface ResultListItemData {
  id: string;
  name: string;
  summary: string;
}

const TONE_DOT_CLASS: Record<ZoneTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};

function EmptyState() {
  const t = useTranslations("results");
  return (
    <Card className="p-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        {t("noneInCategory")}
      </p>
    </Card>
  );
}

/**
 * A category's results as a grid of cards rather than one long list. A
 * category can hold 100+ entries, and a single column of near-identical
 * rows is both slow to scan and dull to look at; a grid fits three to a
 * row on a laptop and the per-result icon gives the eye something to
 * anchor on.
 *
 * The icon is matched to what the result is about (see result-icons.ts).
 * It is decorative — every card still states its name and verdict in
 * text, and the status dot keeps carrying the tone — so an imperfect
 * icon match costs nothing.
 */
export function ResultsList({
  items,
  basePath,
}: {
  items: ResultListItemData[];
  basePath: string;
}) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = getResultIcon(item.name, item.summary);
        return (
          <Link key={item.id} href={`${basePath}/${item.id}`} className="group">
            <Card className="h-full gap-0 p-5 transition-colors group-hover:border-accent-brand/40 group-hover:bg-muted/40">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--accent-brand-surface)" }}
                >
                  <Icon
                    size={24}
                    strokeWidth={1.7}
                    style={{ color: "var(--accent-brand)" }}
                  />
                </span>
                <span
                  aria-hidden
                  className={`mt-1 size-2.5 shrink-0 rounded-full ${
                    TONE_DOT_CLASS[getSummaryTone(item.summary)]
                  }`}
                />
              </div>

              <div className="font-display text-[15px] leading-snug font-bold text-foreground">
                {item.name}
              </div>
              <div className="mt-1.5 text-[13px] leading-snug font-medium text-muted-foreground">
                {item.summary}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
