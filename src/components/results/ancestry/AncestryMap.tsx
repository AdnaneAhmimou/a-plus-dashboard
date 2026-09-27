"use client";

import { useEffect, useState } from "react";
import { Globe, Map as MapIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { GlobeAncestry, type GlobeArc, type GlobeMarker } from "./GlobeAncestry";
import { FlatMapAncestry } from "./FlatMapAncestry";

export type MapView = "globe" | "flat";

const STORAGE_KEY = "aplus.ancestry.mapView";

/**
 * The ancestry map, in either projection, with the switch between them.
 *
 * Both views draw the same markers and arcs from the same data, so this
 * is a presentation choice and nothing else. The preference is kept in
 * localStorage so a patient who prefers the flat map only has to say so
 * once, including across the four ancestry tabs, each of which mounts
 * its own map.
 */
export function AncestryMap({
  markers,
  arcs = [],
  caption,
  initialPhi,
  className = "",
}: {
  markers: GlobeMarker[];
  arcs?: GlobeArc[];
  caption?: string;
  initialPhi?: number;
  className?: string;
}) {
  // Always render the globe first so the server and the first client
  // paint agree; the stored preference is applied after mount.
  const [view, setView] = useState<MapView>("globe");
  const t = useTranslations("ancestry");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "flat" || stored === "globe") setView(stored);
    } catch {
      // Private mode or blocked storage: the default view is fine.
    }
  }, []);

  const choose = (next: MapView) => {
    setView(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not being able to remember the choice must not break making it.
    }
  };

  return (
    <div className={`flex w-full flex-col items-center gap-3 ${className}`}>
      <div
        role="group"
        aria-label={t("mapView")}
        className="flex gap-1 self-end rounded-lg bg-muted p-1"
      >
        <ViewButton
          active={view === "globe"}
          onClick={() => choose("globe")}
          icon={<Globe size={14} strokeWidth={2} />}
          label={t("globe")}
        />
        <ViewButton
          active={view === "flat"}
          onClick={() => choose("flat")}
          icon={<MapIcon size={14} strokeWidth={2} />}
          label={t("flat")}
        />
      </div>

      {view === "globe" ? (
        <GlobeAncestry
          markers={markers}
          arcs={arcs}
          className="w-full max-w-[420px]"
          initialPhi={initialPhi}
        />
      ) : (
        <FlatMapAncestry markers={markers} arcs={arcs} />
      )}

      {caption && (
        <p className="text-center text-xs font-semibold text-muted-foreground">
          {view === "globe"
            ? caption
            : t("flatCaption")}
        </p>
      )}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
