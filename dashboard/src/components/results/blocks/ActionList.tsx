import { Check } from "lucide-react";

import type { ActionItems } from "@/lib/dashboard/result-type";
import { getActionIcon } from "@/lib/dashboard/action-icons";

/**
 * The "What you can do" checklist. Every row is a sentence lifted
 * verbatim from the source PDF's Prevention / Disease-management section
 * (see splitIntoActionItems) — nothing here is summarised or generated,
 * so the wording stays exactly as the issuing lab wrote it.
 *
 * Each row gets an icon matched to its own content (getActionIcon) rather
 * than a single repeated checkmark, so a list of six recommendations
 * doesn't read as six copies of the same row. This is the deliberate
 * stand-in for the per-condition stock photo the source shows on this
 * section: that photo is licensed content we have no right to reproduce,
 * while an icon carries no such risk and still gives every item its own
 * visual identity. Falls back to a checkmark when nothing in the
 * sentence is recognised, so an unmatched item never gets a wrong icon.
 *
 * The icon sits in a solid green badge (not just a tinted row) so the
 * whole list reads as actionable at a glance, matching the "What this
 * section is for" badge treatment used on every other card in the app
 * (see SectionCard) rather than inventing a second visual language.
 */
export function ActionList({ actions }: { actions: ActionItems }) {
  return (
    <div>
      {actions.lead && (
        <p className="mb-3 text-sm leading-relaxed font-medium text-muted-foreground">
          {actions.lead}
        </p>
      )}
      <ul className="flex flex-col gap-2.5">
        {actions.items.map((item, i) => {
          const Icon = getActionIcon(item) ?? Check;
          return (
            <li
              key={i}
              className="flex items-start gap-3 rounded-lg bg-success-surface/60 px-3 py-2.5"
            >
              <span
                aria-hidden
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success"
              >
                <Icon size={13} strokeWidth={2.6} className="text-white" />
              </span>
              <span className="text-sm leading-relaxed font-medium text-foreground/90">
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
