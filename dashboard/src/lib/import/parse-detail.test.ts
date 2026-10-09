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

describe("parseDetailText — explanatory sections", () => {
  const FULL_PAGE = `Genetic vulnerability to health conditions
/
Abdominal aortic aneurysm
PDF
Abdominal aortic aneurysm

An aneurysm is an abnormal widening of an artery.

Your risk is
Medium risk

Causes and non-genetic risk factors

The exact causes of aortic aneurysm are unknown, although some environmental risk factors have been identified.

Smoking.

Symptoms

Aneurysms can appear and develop without causing any symptoms, making them difficult to detect.

Prevention

Since, in most cases, aneurysms are asymptomatic, it is important that people at higher risk undergo imaging tests.

In addition, it is generally recommended to avoid environmental risk factors such as smoking.

Technical report

Abdominal aortic aneurysm (AAA) is a complex disease influenced by environmental and genetic factors.

Bibliography

Klarin D, Verma SS, Judy R, et al. Genetic Architecture. Circulation. 2020.

UK National Health Service [March 2022]

Study limitations

The presence of important environmental factors can influence the phenotypic outcome.

The tellmeGen test is not diagnostic.
`;

  it("extracts every explanatory section, verbatim", () => {
    const parsed = parseDetailText(FULL_PAGE);

    expect(parsed.causesAndRiskFactors).toContain("environmental risk factors");
    expect(parsed.causesAndRiskFactors).toContain("Smoking.");
    expect(parsed.symptoms).toContain("without causing any symptoms");
    expect(parsed.prevention).toContain("imaging tests");
    expect(parsed.prevention).toContain("avoid environmental risk factors");
    expect(parsed.technicalNotes).toContain("complex disease influenced by");
    expect(parsed.studyLimitations).toContain("not diagnostic");
  });

  it("does not bleed one section's text into the next", () => {
    const parsed = parseDetailText(FULL_PAGE);
    expect(parsed.symptoms).not.toContain("imaging tests");
    expect(parsed.prevention).not.toContain("complex disease");
  });

  it("splits bibliography into separate citations by trailing punctuation", () => {
    const parsed = parseDetailText(FULL_PAGE);
    expect(parsed.bibliography).toHaveLength(2);
    expect(parsed.bibliography?.[0].label).toContain("Klarin D");
    expect(parsed.bibliography?.[1].label).toBe("UK National Health Service [March 2022]");
  });

  it("returns undefined for a section the page never had", () => {
    const parsed = parseDetailText(PAGE);
    expect(parsed.prevention).toBeUndefined();
    expect(parsed.bibliography).toBeUndefined();
  });
});
