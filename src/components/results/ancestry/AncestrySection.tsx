"use client";

import { useMemo, useState } from "react";
import { Globe2, Footprints, Info, ChevronDown } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/results/blocks/SectionCard";
import { haplogroupCoords, regionCoords } from "@/lib/dashboard/ancestry-geo";
import type {
  AncestryProfileData,
  CompositionEntry,
  LineageData,
} from "@/lib/dashboard/ancestry-profile";
import type { GlobeArc, GlobeMarker } from "./GlobeAncestry";
import { AncestryMap } from "./AncestryMap";
import { NeanderthalTab } from "./NeanderthalTab";

type TabId = "composition" | "maternal" | "paternal" | "neanderthal";

const TABS: { id: TabId; label: string }[] = [
  { id: "composition", label: "Ancestry composition" },
  { id: "maternal", label: "Maternal lineage" },
  { id: "paternal", label: "Paternal lineage" },
  { id: "neanderthal", label: "Neanderthal" },
];

// Composition is categorical (regions), so it uses the status hues as a
// fixed categorical set, largest share first; anything beyond the fourth
// region falls back to neutral grey. Every slice is always labeled with
// its name and number in the list beside the chart, so colour is never
// the only carrier.
const COMPOSITION_COLORS = [
  "var(--primary)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
];
const OVERFLOW_COLOR = "var(--muted-foreground)";

function compositionColor(index: number): string {
  return COMPOSITION_COLORS[index] ?? OVERFLOW_COLOR;
}

function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export function AncestrySection({ profile }: { profile: AncestryProfileData }) {
  const [tab, setTab] = useState<TabId>("composition");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Ancestry sections"
        className="bg-muted mb-6 inline-flex max-w-full flex-wrap gap-1 rounded-xl p-1"
      >
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "composition" && <CompositionTab entries={profile.composition} />}
      {tab === "maternal" && (
        <LineageTab kind="maternal" lineage={profile.maternal} />
      )}
      {tab === "paternal" && (
        <LineageTab kind="paternal" lineage={profile.paternal} />
      )}
      {tab === "neanderthal" && <NeanderthalTab data={profile.neanderthal} />}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Composition                                                       */
/* ---------------------------------------------------------------- */

function CompositionTab({ entries }: { entries: CompositionEntry[] }) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.percent - a.percent),
    [entries]
  );
  const total = sorted.reduce((s, e) => s + e.percent, 0);

  const markers = useMemo<GlobeMarker[]>(
    () =>
      sorted.flatMap((e, i) => {
        const location = regionCoords(e.region);
        if (!location) return [];
        return [
          {
            id: `region-${i}`,
            location,
            label: `${e.region} ${formatPercent(e.percent)}`,
            weight: e.percent / 100,
            color: compositionColor(i),
          },
        ];
      }),
    [sorted]
  );

  if (sorted.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium text-muted-foreground">
          No ancestry composition has been recorded for this profile yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <SectionCard icon={Globe2} title="Your ancestry composition">
        <p className="mb-5 text-sm font-medium text-muted-foreground">
          Share of your genome associated with each ancestral region.
        </p>

        <div
          className="mb-5 flex h-3 w-full overflow-hidden rounded-full bg-secondary"
          role="img"
          aria-label={sorted
            .map((e) => `${e.region} ${formatPercent(e.percent)}`)
            .join(", ")}
        >
          {sorted.map((e, i) => (
            <div
              key={e.region}
              style={{
                width: `${(e.percent / total) * 100}%`,
                backgroundColor: compositionColor(i),
                marginRight: i < sorted.length - 1 ? 2 : 0,
              }}
            />
          ))}
        </div>

        <ul className="divide-y divide-border">
          {sorted.map((e, i) => (
            <li key={e.region} className="flex items-center gap-3 py-3">
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: compositionColor(i) }}
              />
              <span className="flex-1 text-sm font-semibold text-foreground">
                {e.region}
              </span>
              <span className="font-display text-base font-extrabold tabular-nums text-foreground">
                {formatPercent(e.percent)}
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <Card className="items-center justify-center p-6">
        <AncestryMap
          markers={markers}
          initialPhi={-0.2}
          caption="Drag the globe to explore. Marker size follows the share."
        />
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Maternal / paternal lineage                                       */
/* ---------------------------------------------------------------- */

function LineageTab({
  kind,
  lineage,
}: {
  kind: "maternal" | "paternal";
  lineage: LineageData | null;
}) {
  const isMaternal = kind === "maternal";
  const title = isMaternal ? "Maternal lineage" : "Paternal lineage";

  if (!lineage) {
    return (
      <SectionCard icon={Info} title={title} tone="info">
        {isMaternal ? (
          <p className="text-sm leading-relaxed font-medium text-foreground/90">
            No maternal haplogroup has been recorded for this profile.
          </p>
        ) : (
          <div className="space-y-3 text-sm leading-relaxed font-medium text-foreground/90">
            <p>
              The paternal lineage is traced through the Y chromosome, which
              is only present in people with XY chromosomes. This profile
              does not include a Y chromosome, so a paternal haplogroup
              cannot be determined from it.
            </p>
            <p className="text-muted-foreground">
              The paternal line can still be explored through a test of a
              male relative on the father&apos;s side (father, brother or
              paternal uncle), since they share the same Y chromosome.
            </p>
          </div>
        )}
      </SectionCard>
    );
  }

  return <LineageContent kind={kind} lineage={lineage} />;
}

function LineageContent({
  kind,
  lineage,
}: {
  kind: "maternal" | "paternal";
  lineage: LineageData;
}) {
  const isMaternal = kind === "maternal";
  const displayGroup = lineage.subhaplogroup ?? lineage.haplogroup;
  const steps = lineage.migration;

  const { markers, arcs } = useMemo(() => {
    const located = steps.flatMap((s, i) => {
      const location = haplogroupCoords(s.haplogroup);
      return location ? [{ ...s, location, index: i }] : [];
    });
    const markers: GlobeMarker[] = located.map((s, i) => ({
      id: `${kind}-step-${s.index}`,
      location: s.location,
      label: s.haplogroup,
      weight: i === located.length - 1 ? 0.5 : 0.15,
    }));
    const arcs: GlobeArc[] = located.slice(1).map((s, i) => ({
      id: `${kind}-arc-${s.index}`,
      from: located[i].location,
      to: s.location,
    }));
    return { markers, arcs };
  }, [steps, kind]);

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-secondary">
            <span className="font-display text-3xl font-extrabold tracking-tight text-primary">
              {displayGroup}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide text-primary uppercase">
              {isMaternal ? "Maternal haplogroup" : "Paternal haplogroup"}
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.4px] text-foreground">
              Your {isMaternal ? "maternal" : "paternal"} line belongs to
              haplogroup {displayGroup}
            </h2>
            {lineage.subhaplogroup && (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-foreground">
                  {lineage.haplogroup}
                </span>
                <span aria-hidden>→</span>
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-primary-foreground">
                  {lineage.subhaplogroup}
                </span>
                <span>
                  {lineage.subhaplogroup} is a branch of haplogroup{" "}
                  {lineage.haplogroup}
                </span>
              </p>
            )}
            <p className="mt-3 max-w-xl text-sm leading-relaxed font-medium text-muted-foreground">
              {isMaternal
                ? "Inherited through mitochondrial DNA, which passes from mother to child. Everyone in your direct maternal line shares this haplogroup."
                : "Inherited through the Y chromosome, which passes from father to son. Everyone in your direct paternal line shares this haplogroup."}
            </p>
          </div>
        </div>
      </Card>

      {steps.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <SectionCard icon={Footprints} title="Migration of your lineage">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              The succession of haplogroups that leads to yours, from the
              oldest to the most recent.
            </p>
            <MigrationTimeline steps={steps} />
          </SectionCard>

          <Card className="items-center justify-center p-6">
            <AncestryMap
              markers={markers}
              arcs={arcs}
              initialPhi={-0.4}
              caption={
                arcs.length > 0
                  ? "Approximate path of your lineage across the globe."
                  : "Approximate origin area of your lineage."
              }
            />
          </Card>
        </div>
      )}
    </div>
  );
}

function MigrationTimeline({ steps }: { steps: LineageData["migration"] }) {
  const [open, setOpen] = useState<number | null>(steps.length - 1);

  return (
    <ol className="relative ml-3 border-l-2 border-border">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const isOpen = open === i;
        const toggleable = Boolean(s.description);
        return (
          <li key={`${s.haplogroup}-${i}`} className="relative pb-5 pl-6 last:pb-0">
            <span
              aria-hidden
              className={`absolute top-1.5 -left-[9px] size-4 rounded-full border-2 border-card ${
                isLast ? "bg-primary" : "bg-muted-foreground/60"
              }`}
            />
            <button
              type="button"
              disabled={!toggleable}
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={toggleable ? isOpen : undefined}
              className="flex w-full items-start justify-between gap-3 text-left disabled:cursor-default"
            >
              <span>
                <span className="block text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  {s.era}
                </span>
                <span
                  className={`block font-display text-base font-extrabold ${
                    isLast ? "text-primary" : "text-foreground"
                  }`}
                >
                  Haplogroup {s.haplogroup}
                  {isLast && (
                    <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-primary">
                      yours
                    </span>
                  )}
                </span>
              </span>
              {toggleable && (
                <ChevronDown
                  size={16}
                  className={`mt-1 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
            {toggleable && isOpen && (
              <p className="mt-2 text-sm leading-relaxed font-medium whitespace-pre-line text-foreground/90">
                {s.description}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
