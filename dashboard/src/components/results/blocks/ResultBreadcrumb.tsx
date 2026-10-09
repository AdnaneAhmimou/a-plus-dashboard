import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function ResultBreadcrumb({
  categoryLabel,
  categoryHref,
  name,
}: {
  categoryLabel: string;
  categoryHref: string;
  name: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex items-center gap-1.5 text-sm font-semibold"
    >
      <Link href={categoryHref} className="text-primary hover:underline">
        {categoryLabel}
      </Link>
      <ChevronRight size={14} className="shrink-0 text-faint" />
      <span className="truncate text-muted-foreground">{name}</span>
    </nav>
  );
}
