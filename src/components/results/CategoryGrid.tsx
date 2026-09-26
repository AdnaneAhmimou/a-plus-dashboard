import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { AnalysisCategory } from "@prisma/client";

import { Card } from "@/components/ui/card";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/dashboard/analysis-categories";

export function CategoryGrid({
  basePath,
  counts,
}: {
  basePath: string;
  counts: Partial<Record<AnalysisCategory, number>>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CATEGORY_ORDER.map((category) => {
        const meta = CATEGORY_META[category];
        const count = counts[category] ?? 0;
        const Icon = meta.icon;
        return (
          <Link key={category} href={`${basePath}/${meta.slug}`}>
            <Card className="h-full gap-3 p-5 transition-colors hover:border-accent-brand/40 hover:bg-muted/40">
              <div className="flex items-start justify-between">
                <div
                  className="flex size-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--accent-brand-surface)" }}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    style={{ color: "var(--accent-brand)" }}
                  />
                </div>
                <ChevronRight size={16} className="mt-1 text-muted-foreground/50" />
              </div>
              <div>
                <div className="font-display text-[15px] leading-tight font-bold text-foreground">
                  {meta.label}
                </div>
                <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                  {category === "ANCESTRY"
                    ? count > 0
                      ? "Composition, lineages and Neanderthal DNA"
                      : "No ancestry profile yet"
                    : count > 0
                      ? `${count} ${count === 1 ? "analysis" : "analyses"}`
                      : "No analyses yet"}
                </p>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
