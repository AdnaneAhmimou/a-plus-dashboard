"use client";

import { useState } from "react";

const COLLAPSED_COUNT = 12;

/**
 * Gene symbols are an identity listing, not a magnitude — chips, not a
 * chart. Some panels analyse 300+ genes, so the list collapses by
 * default and expands on demand rather than flooding the page.
 */
export function GeneChips({
  genes,
  riskLociCount,
}: {
  genes: string[];
  riskLociCount?: number | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? genes : genes.slice(0, COLLAPSED_COUNT);
  const hiddenCount = genes.length - visible.length;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((gene) => (
          <span
            key={gene}
            className="rounded-lg border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[11px] font-semibold text-foreground"
          >
            {gene}
          </span>
        ))}
      </div>

      {(hiddenCount > 0 || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs font-bold text-primary hover:underline"
        >
          {expanded ? "Show fewer" : `+${hiddenCount} more`}
        </button>
      )}

      {riskLociCount != null && (
        <p className="mt-3 border-t border-border pt-3 text-xs font-semibold text-muted-foreground">
          {riskLociCount} risk loci analyzed
        </p>
      )}
    </div>
  );
}
