import { BookOpen, Dna } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ProbabilityBars, type ProbabilityPoint } from "@/components/results/ProbabilityBars";

export interface ResultDetailData {
  name: string;
  summary: string;
  categoryLabel: string;
  description: string | null;
  probabilities: ProbabilityPoint[] | null;
  variantCount: string | null;
  riskLociCount: number | null;
  genesAnalyzed: string | null;
  technicalNotes: string | null;
  bibliography: { label: string; url?: string }[] | null;
}

function TechnicalFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold tracking-wide text-faint uppercase">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function ResultDetail({ result }: { result: ResultDetailData }) {
  const technicalFacts = [
    result.variantCount ? { label: "Variants analyzed", value: result.variantCount } : null,
    result.riskLociCount != null
      ? { label: "Risk loci", value: String(result.riskLociCount) }
      : null,
    result.genesAnalyzed ? { label: "Genes", value: result.genesAnalyzed } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-6">
        <p className="text-xs font-bold tracking-wide text-primary uppercase">
          {result.categoryLabel}
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.4px] text-foreground">
          {result.name}
        </h1>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">{result.summary}</p>

        {result.description && (
          <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed font-medium text-foreground/90">
            {result.description}
          </p>
        )}
      </Card>

      {result.probabilities && result.probabilities.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 font-display text-base font-bold text-foreground">
            Result breakdown
          </div>
          <ProbabilityBars data={result.probabilities} />
        </Card>
      )}

      {(technicalFacts.length > 0 || result.technicalNotes) && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2 font-display text-base font-bold text-foreground">
            <Dna size={16} strokeWidth={1.9} className="text-primary" />
            Technical report
          </div>
          {technicalFacts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {technicalFacts.map((fact) => (
                <TechnicalFact key={fact.label} label={fact.label} value={fact.value} />
              ))}
            </div>
          )}
          {result.technicalNotes && (
            <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed font-medium text-muted-foreground">
              {result.technicalNotes}
            </p>
          )}
        </Card>
      )}

      {result.bibliography && result.bibliography.length > 0 && (
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2 font-display text-base font-bold text-foreground">
            <BookOpen size={16} strokeWidth={1.9} className="text-primary" />
            Bibliography
          </div>
          <ul className="flex flex-col gap-2">
            {result.bibliography.map((entry, i) => (
              <li key={i} className="text-xs font-medium text-muted-foreground">
                {entry.url ? (
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {entry.label}
                  </a>
                ) : (
                  entry.label
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
