"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const COLLAPSED_CHARS = 340;

/** Long verbatim prose from the source report, clamped with a toggle. */
export function CollapsibleText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsToggle = text.length > COLLAPSED_CHARS;
  const shown = expanded || !needsToggle ? text : `${text.slice(0, COLLAPSED_CHARS).trimEnd()}…`;

  return (
    <div>
      <p
        className={`text-sm leading-relaxed font-medium whitespace-pre-line text-foreground/90 ${className}`}
      >
        {shown}
      </p>
      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown
            size={13}
            strokeWidth={2.4}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
