import { ShieldAlert, AlertCircle } from "lucide-react";

import { SectionCard } from "./SectionCard";

/**
 * The "About this result" card. The lead line is fixed copy the app owns
 * ("Not a diagnosis"); the body underneath is the issuing lab's own
 * study-limitations text, shown verbatim — a medical disclaimer isn't
 * something to paraphrase.
 */
export function DisclaimerCard({
  studyLimitations,
}: {
  studyLimitations: string | null;
}) {
  return (
    <SectionCard icon={ShieldAlert} title="About this result" tone="destructive">
      <div className="rounded-xl bg-destructive-surface/60 p-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle
            size={16}
            strokeWidth={2.1}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <div>
            <p className="text-sm font-bold text-destructive">Not a diagnosis</p>
            <p className="mt-1 text-xs leading-relaxed font-medium text-foreground/80">
              This is a genetic estimate, not a medical diagnosis. Discuss any
              symptoms or concerns with your physician.
            </p>
          </div>
        </div>
      </div>

      {studyLimitations && (
        <p className="mt-4 text-xs leading-relaxed font-medium text-muted-foreground">
          {studyLimitations}
        </p>
      )}
    </SectionCard>
  );
}
