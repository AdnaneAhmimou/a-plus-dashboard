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
            <Card className="h-full gap-3 p-5 transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary">
                  <Icon size={20} strokeWidth={1.8} className="text-primary" />
                </div>
                <ChevronRight size={16} className="mt-1 text-faint" />
              </div>
              <div>
                <div className="font-display text-[15px] leading-tight font-bold text-foreground">
                  {meta.label}
                </div>
                <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                  {count > 0
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
