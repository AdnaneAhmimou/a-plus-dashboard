import {
  BookOpen,
  Dna,
  HeartPulse,
  Stethoscope,
  Leaf,
  ClipboardList,
  FileText,
  Microscope,
} from "lucide-react";

import { splitIntoActionItems } from "@/lib/dashboard/result-type";
import { SectionCard } from "./SectionCard";
import { ActionList } from "./ActionList";
import { GeneChips } from "./GeneChips";
import { DisclaimerCard } from "./DisclaimerCard";
import { CollapsibleText } from "./CollapsibleText";
import type { ResultDetailData } from "@/components/results/ResultDetail";

/**
 * Everything below the hero. Shared by all three result templates —
 * only the hero differs by result type, since these sections come from
 * the same set of source-PDF sections regardless of shape.
 */
export function ResultSections({
  result,
  meansLabel = "What this means",
  meansExtra,
}: {
  result: ResultDetailData;
  meansLabel?: string;
  /** Optional callout rendered inside the "What this means" card. */
  meansExtra?: React.ReactNode;
}) {
  const genes = result.genesAnalyzed
    ? result.genesAnalyzed.split(",").map((g) => g.trim()).filter(Boolean)
    : [];

  // Prevention is the natural "what you can do"; carrier reports have no
  // prevention section but do carry disease-management guidance instead.
  const actionSource = result.prevention ?? result.diseaseManagement;
  const actions = splitIntoActionItems(actionSource);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {(result.description || meansExtra) && (
          <SectionCard icon={BookOpen} title={meansLabel}>
            {result.description && <CollapsibleText text={result.description} />}
            {meansExtra}
          </SectionCard>
        )}

        {actionSource && (
          <SectionCard icon={Leaf} title="What you can do" tone="success">
            {actions ? (
              <ActionList actions={actions} />
            ) : (
              <CollapsibleText text={actionSource} />
            )}
          </SectionCard>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {genes.length > 0 && (
          <SectionCard icon={Dna} title="Genes analyzed">
            <GeneChips genes={genes} riskLociCount={result.riskLociCount} />
          </SectionCard>
        )}

        <DisclaimerCard studyLimitations={result.studyLimitations} />
      </div>

      {result.causesAndRiskFactors && (
        <SectionCard icon={HeartPulse} title="Causes & risk factors" tone="info">
          <CollapsibleText text={result.causesAndRiskFactors} />
        </SectionCard>
      )}

      {result.symptoms && (
        <SectionCard icon={Stethoscope} title="Symptoms" tone="info">
          <CollapsibleText text={result.symptoms} />
        </SectionCard>
      )}

      {result.diseaseManagement && result.prevention && (
        <SectionCard icon={ClipboardList} title="Disease management" tone="info">
          <CollapsibleText text={result.diseaseManagement} />
        </SectionCard>
      )}

      {(result.technicalNotes || result.variantCount) && (
        <SectionCard icon={Microscope} title="Technical report">
          {result.variantCount && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-1.5">
              <span className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                Variants analyzed
              </span>
              <span className="text-sm font-bold text-foreground">
                {result.variantCount}
              </span>
            </div>
          )}
          {result.technicalNotes && (
            <CollapsibleText
              text={result.technicalNotes}
              className="text-muted-foreground"
            />
          )}
        </SectionCard>
      )}

      {result.bibliography && result.bibliography.length > 0 && (
        <SectionCard icon={FileText} title="Bibliography">
          <ul className="flex flex-col gap-2.5">
            {result.bibliography.map((entry, i) => (
              <li
                key={i}
                className="border-l-2 border-border pl-3 text-xs leading-relaxed font-medium text-muted-foreground"
              >
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
        </SectionCard>
      )}
    </>
  );
}
