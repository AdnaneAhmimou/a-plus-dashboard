// A gene symbol list is an identity listing, not a magnitude — rendered
// as a wrapped chip grid rather than a chart. Internally scrollable
// because some reports analyze 300+ genes (e.g. lipid/biomarker panels)
// and dumping them all inline unbounded would blow out the page.
export function GenesTable({ genes }: { genes: string[] }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-muted-foreground">
        {genes.length} gene{genes.length === 1 ? "" : "s"} analyzed
      </div>
      <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-secondary/30 p-3">
        <div className="flex flex-wrap gap-1.5">
          {genes.map((gene) => (
            <span
              key={gene}
              className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground"
            >
              {gene}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
