"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map,
  PersonStanding,
  Flame,
  Apple,
  Hand,
  Info,
  Dna,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import type { NeanderthalData, EducationalSection } from "@/lib/dashboard/ancestry-profile";

// Each educational section gets a decorative illustration panel picked
// by its title. Titles come verbatim from the source, so the match is on
// keywords; anything unknown falls back to a generic icon. Purely
// decorative (aria-hidden): the text beside it carries the content.
const SECTION_ART: { match: RegExp; icon: LucideIcon }[] = [
  { match: /origin|extinction/i, icon: Map },
  { match: /physical|feature/i, icon: PersonStanding },
  { match: /lifestyle|life style/i, icon: Flame },
  { match: /feed|diet|food/i, icon: Apple },
  { match: /culture|art/i, icon: Hand },
];

function artFor(title: string): LucideIcon {
  return SECTION_ART.find((a) => a.match.test(title))?.icon ?? Info;
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(2).replace(/\.?0+$/, "")}%`;
}

export function NeanderthalTab({ data }: { data: NeanderthalData | null }) {
  if (!data) {
    return (
      <Card className="p-6">
        <p className="text-sm font-medium text-muted-foreground">
          No Neanderthal ancestry data has been recorded for this profile yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <HeroBanner />
      <HeadlineStat data={data} />
      {data.sections.length > 0 && <SectionsWithNav sections={data.sections} />}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function HeroBanner() {
  return (
    <Card className="relative overflow-hidden p-7 sm:p-9">
      <div className="relative max-w-xl">
        <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Ancestry
        </p>
        <h2 className="font-display text-3xl font-extrabold tracking-[-0.5px] text-foreground sm:text-4xl">
          DNA Neanderthal
        </h2>
        <p className="mt-3 text-sm leading-relaxed font-medium text-muted-foreground">
          Between 0% and 4% of our genome comes from Neanderthals. This
          phenomenon happens because Homo sapiens, our species, and
          Neanderthals interbred.
        </p>
      </div>
      <Dna
        aria-hidden
        size={150}
        strokeWidth={1}
        className="absolute -right-6 -bottom-8 text-muted sm:right-6"
      />
    </Card>
  );
}

function HeadlineStat({ data }: { data: NeanderthalData }) {
  const { percent, variants, vsAverage } = data;
  return (
    <Card className="items-center gap-4 p-8 text-center">
      <div className="flex items-center gap-6">
        <SilhouetteMark />
        <div>
          <p className="text-sm font-semibold text-muted-foreground">You have</p>
          <p className="font-display text-5xl font-extrabold tracking-tight text-primary">
            {percent !== null ? formatPercent(percent) : "n/a"}
          </p>
          <p className="text-sm font-semibold text-muted-foreground">
            of Neanderthal DNA
          </p>
        </div>
        <SilhouetteMark flip />
      </div>

      {(variants !== null || vsAverage !== null) && (
        <p className="max-w-md text-sm leading-relaxed font-medium text-muted-foreground">
          {variants !== null && (
            <>
              We have analyzed genetic variants from Neanderthals, of which{" "}
              <strong className="font-extrabold text-primary">
                {variants.toLocaleString("en-US")}
              </strong>{" "}
              are present in your DNA.{" "}
            </>
          )}
          {vsAverage !== null && (
            <>
              These results mean that you have{" "}
              <strong className="font-extrabold text-primary">
                {formatPercent(Math.abs(vsAverage))}
              </strong>{" "}
              {vsAverage >= 0 ? "more" : "less"} Neanderthal genetic material
              than the average of our clients.
            </>
          )}
        </p>
      )}
    </Card>
  );
}

/** Simple head-profile silhouette; decorative only. */
function SilhouetteMark({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 64"
      className="hidden size-16 text-muted-foreground/30 sm:block"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      fill="currentColor"
    >
      <path d="M24 6c-11 0-18 8-18 18 0 6 3 9 5 12l-4 8c-1 2 0 4 2 4h5v6c0 2 1 3 3 3h13c2 0 3-1 3-3v-8c6-3 10-9 10-17C43 14 35 6 24 6z" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */

function SectionsWithNav({ sections }: { sections: EducationalSection[] }) {
  const ids = sections.map((s) => slugify(s.title));
  const [active, setActive] = useState(ids[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track which section is in view so the sub-tabs follow the scroll.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-section]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.getAttribute("data-section")!);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [sections]);

  const jump = (id: string) => {
    setActive(id);
    document.getElementById(`neanderthal-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div ref={containerRef}>
      <nav
        aria-label="Neanderthal sections"
        className="bg-muted sticky z-10 mb-6 flex gap-1 overflow-x-auto rounded-xl p-1"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 72px)" }}
      >
        {sections.map((s, i) => {
          const id = ids[i];
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => jump(id)}
              aria-current={isActive ? "true" : undefined}
              className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {s.title}
            </button>
          );
        })}
      </nav>

      <div className="space-y-6">
        {sections.map((s, i) => (
          <EducationalCard
            key={ids[i]}
            id={ids[i]}
            section={s}
            reverse={i % 2 === 1}
          />
        ))}
      </div>
    </div>
  );
}

function EducationalCard({
  id,
  section,
  reverse,
}: {
  id: string;
  section: EducationalSection;
  reverse: boolean;
}) {
  const Icon = artFor(section.title);
  const paragraphs = section.text.split(/\n\s*\n/).filter(Boolean);

  return (
    <Card
      id={`neanderthal-${id}`}
      data-section={id}
      className="scroll-mt-32 p-6 sm:p-8"
    >
      <div
        className={`grid items-center gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] ${
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div>
          <h3 className="mb-3 font-display text-xl font-extrabold tracking-[-0.3px] text-primary">
            {section.title}
          </h3>
          <div className="space-y-3">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed font-medium text-foreground/90"
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        <div
          aria-hidden
          className="relative mx-auto flex aspect-[4/3] w-full max-w-[280px] items-center justify-center"
        >
          <div
            className="absolute inset-0 rounded-[38%_62%_55%_45%/48%_42%_58%_52%]"
            style={{ backgroundColor: "var(--secondary)" }}
          />
          <div
            className="absolute inset-[14%] rounded-[55%_45%_40%_60%/50%_60%_40%_50%]"
            style={{ backgroundColor: "var(--muted)" }}
          />
          <Icon size={72} strokeWidth={1.3} className="relative text-primary" />
        </div>
      </div>
    </Card>
  );
}
