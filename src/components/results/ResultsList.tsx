import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";

export interface ResultListItemData {
  id: string;
  name: string;
  summary: string;
}

export function ResultsList({
  items,
  basePath,
}: {
  items: ResultListItemData[];
  basePath: string;
}) {
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No analyses in this category yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`${basePath}/${item.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted/50"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {item.name}
                </div>
                <div className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                  {item.summary}
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-faint" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
