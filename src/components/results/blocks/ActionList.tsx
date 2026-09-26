import { Check } from "lucide-react";

import type { ActionItems } from "@/lib/dashboard/result-type";

/**
 * The "What you can do" checklist. Every row is a sentence lifted
 * verbatim from the source PDF's Prevention / Disease-management section
 * (see splitIntoActionItems) — nothing here is summarised or generated,
 * so the wording stays exactly as the issuing lab wrote it.
 */
export function ActionList({ actions }: { actions: ActionItems }) {
  return (
    <div>
      {actions.lead && (
        <p className="mb-3 text-sm leading-relaxed font-medium text-muted-foreground">
          {actions.lead}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {actions.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 rounded-lg bg-success-surface/50 px-3 py-2.5"
          >
            <Check
              size={15}
              strokeWidth={2.4}
              className="mt-0.5 shrink-0 text-success"
            />
            <span className="text-sm leading-relaxed font-medium text-foreground/90">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
