import { describe, expect, it } from "vitest";

import { parseDetailText } from "./parse-detail";

const PAGE = `Genetic vulnerability to health conditions
/
Osteoporosis
PDF
Osteoporosis

It is the result of the loss of bone mass.

Your risk is
High risk
Number of variants	Number of risk loci	Genes analyzed
13.5 million variants	

7 loci

	
AKAP11 AQP1 CTNNB1

These results have been obtained by Polygenic Risk Score (PRS) analysis.`;

describe("parseDetailText", () => {
  it("reads the heading below PDF, not the breadcrumb above it", () => {
    expect(parseDetailText(PAGE).name).toBe("Osteoporosis");
  });

  it("keeps the description free of the PDF line and repeated title", () => {
    const description = parseDetailText(PAGE).description ?? "";
    expect(description).toContain("loss of bone mass");
    expect(description).not.toContain("PDF");
    expect(description.startsWith("Osteoporosis")).toBe(false);
  });

  it("reads the verdict, variant count, loci and genes", () => {
    const parsed = parseDetailText(PAGE);
    expect(parsed.verdict).toBe("High risk");
    expect(parsed.variantCount).toBe("13.5 million variants");
    expect(parsed.riskLociCount).toBe(7);
    expect(parsed.genesAnalyzed).toBe("AKAP11 AQP1 CTNNB1");
  });

  it("rejects an untranslated i18n key as a name", () => {
    // The portal shows these when its dictionary has not loaded. Storing
    // one would put "item.compleximputation.13.name" in front of a patient.
    const page = PAGE.replace(/^Osteoporosis$/gm, "item.compleximputation.13.name");
    expect(parseDetailText(page).name).toBeUndefined();
  });
});
