import type { AncestryProfile } from "@prisma/client";

// Typed view of the AncestryProfile row's Json columns. Prisma types them
// as JsonValue, so this is the one place that narrows them (defensively:
// a malformed entry is dropped rather than crashing the page).

export interface CompositionEntry {
  region: string;
  percent: number;
}

export interface MigrationStep {
  era: string;
  haplogroup: string;
  description?: string;
}

export interface EducationalSection {
  title: string;
  text: string;
}

export interface AncestryProfileData {
  composition: CompositionEntry[];
  maternal: LineageData | null;
  paternal: LineageData | null;
  neanderthal: NeanderthalData | null;
}

export interface LineageData {
  haplogroup: string;
  subhaplogroup: string | null;
  migration: MigrationStep[];
}

export interface NeanderthalData {
  percent: number | null;
  variants: number | null;
  vsAverage: number | null;
  sections: EducationalSection[];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseComposition(raw: unknown): CompositionEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((e) =>
    isRecord(e) && typeof e.region === "string" && typeof e.percent === "number"
      ? [{ region: e.region, percent: e.percent }]
      : []
  );
}

function parseMigration(raw: unknown): MigrationStep[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((e) =>
    isRecord(e) && typeof e.era === "string" && typeof e.haplogroup === "string"
      ? [
          {
            era: e.era,
            haplogroup: e.haplogroup,
            description: typeof e.description === "string" ? e.description : undefined,
          },
        ]
      : []
  );
}

function parseSections(raw: unknown): EducationalSection[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((e) =>
    isRecord(e) && typeof e.title === "string" && typeof e.text === "string"
      ? [{ title: e.title, text: e.text }]
      : []
  );
}

export function toAncestryProfileData(row: AncestryProfile): AncestryProfileData {
  const hasNeanderthal =
    row.neanderthalPercent !== null ||
    row.neanderthalVariants !== null ||
    row.neanderthalVsAverage !== null;

  return {
    composition: parseComposition(row.composition),
    maternal: row.maternalHaplogroup
      ? {
          haplogroup: row.maternalHaplogroup,
          subhaplogroup: row.maternalSubhaplogroup,
          migration: parseMigration(row.maternalMigration),
        }
      : null,
    paternal: row.paternalHaplogroup
      ? {
          haplogroup: row.paternalHaplogroup,
          subhaplogroup: row.paternalSubhaplogroup,
          migration: parseMigration(row.paternalMigration),
        }
      : null,
    neanderthal: hasNeanderthal
      ? {
          percent: row.neanderthalPercent,
          variants: row.neanderthalVariants,
          vsAverage: row.neanderthalVsAverage,
          sections: parseSections(row.neanderthalSections),
        }
      : null,
  };
}
