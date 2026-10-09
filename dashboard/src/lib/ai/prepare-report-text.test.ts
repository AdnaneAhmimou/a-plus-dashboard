import { describe, expect, it } from "vitest";
import { prepareReportText } from "./prepare-report-text";

// Fixtures mirror the exact structural pattern of the real source PDFs
// (verified against 20 real samples before writing the parser) without
// reproducing their copyrighted prose at length.
const POLYGENIC_RISK_TEXT = `
Age-related macular degeneration
It is characterized by the degeneration of the macula, which progressively leads to
the loss of central vision.
Your risk is
Medium risk
90% of the world's population has a medium risk. Within the medium risk band.
Number of risk loci 9 loci
Genes analyzed
ARMS2
C3
CFH
Genes analyzed
CFHR3
FAAP100
These results have been obtained by Polygenic Risk Score (PRS) analysis. From your
genetic data obtained in the test, the potential number of variants that can be
analyzed is increased to more than 13 million by the technical/statistical procedure.
Causes and non-genetic risk factors
There are two primary types of AMD: dry and wet.
Symptoms
Blurred or fuzzy vision.
Prevention
Eat healthy and avoid smoking.
Technical report
Three main factors have been described that contribute to AMD.
Bibliography
Saunier V et al. Incidence of and Risk Factors Associated With AMD:
Four-Year Follow-up. JAMA Ophthalmol 2018;136(5):473-481.
National Institute of Health. Age-Related Macular Degeneration [March 2022].
Study limitations
The tellmeGen test is not diagnostic. Consult your physician.
`;

const MONOGENIC_CARRIER_TEXT = `
Hereditary hemochromatosis type 1 (HFE gene)
Hemochromatosis is a disease that causes systemic iron overload.
Your result is
Variant present
SNP
Gen or
Region
GENOTYPEInterpretation
rs1799945HFECG
You have one copy of the mutation associated with hemochromatosis.
Symptoms
Early stages are asymptomatic.
Disease management
Regular monitoring of iron levels is recommended.
Technical report
Genotyping was performed using a targeted panel.
Bibliography
Feder JN et al. A novel MHC class I-like gene. Nat Genet 1996;13(4):399-408.
Study limitations
The tellmeGen test is not diagnostic. Consult your physician.
`;

describe("prepareReportText", () => {
  it("extracts the title, intro, and result headline for a polygenic-risk report", () => {
    const result = prepareReportText(POLYGENIC_RISK_TEXT);
    expect(result.title).toBe("Age-related macular degeneration");
    expect(result.whatIsIt).toContain("degeneration of the macula");
    expect(result.resultHeadline).toBe("Medium risk");
    expect(result.resultContext).toContain("90% of the world's population");
  });

  it("extracts risk loci count and variant count", () => {
    const result = prepareReportText(POLYGENIC_RISK_TEXT);
    expect(result.riskLociCount).toBe(9);
    expect(result.variantCount).toBe("more than 13 million");
  });

  it("dedupes gene symbols collected across repeated 'Genes analyzed' headers", () => {
    const result = prepareReportText(POLYGENIC_RISK_TEXT);
    expect(result.genesAnalyzed).toBe("ARMS2, C3, CFH, CFHR3, FAAP100");
  });

  it("splits explanatory sections by their known headers", () => {
    const result = prepareReportText(POLYGENIC_RISK_TEXT);
    expect(result.causesAndRiskFactors).toContain("dry and wet");
    expect(result.symptoms).toContain("Blurred or fuzzy vision");
    expect(result.prevention).toContain("avoid smoking");
    expect(result.technicalNotes).toContain("Three main factors");
    expect(result.studyLimitations).toContain("not diagnostic");
    expect(result.diseaseManagement).toBeNull();
  });

  it("splits the bibliography into individual citation entries", () => {
    const result = prepareReportText(POLYGENIC_RISK_TEXT);
    expect(result.bibliography).toHaveLength(2);
    expect(result.bibliography?.[0].label).toContain("Saunier V et al.");
    expect(result.bibliography?.[0].label).toContain("473-481.");
    expect(result.bibliography?.[1].label).toContain("National Institute of Health");
  });

  it("never returns a field it can't ground in the source text — no risk loci or gene list for a monogenic carrier report", () => {
    const result = prepareReportText(MONOGENIC_CARRIER_TEXT);
    expect(result.resultHeadline).toBe("Variant present");
    expect(result.riskLociCount).toBeNull();
  });

  it("recovers the gene symbol from a jammed variant-table row (SNP+gene+genotype with no whitespace)", () => {
    const result = prepareReportText(MONOGENIC_CARRIER_TEXT);
    expect(result.genesAnalyzed).toBe("HFE");
  });

  it("captures disease management section when present", () => {
    const result = prepareReportText(MONOGENIC_CARRIER_TEXT);
    expect(result.diseaseManagement).toContain("Regular monitoring");
    expect(result.causesAndRiskFactors).toBeNull();
    expect(result.prevention).toBeNull();
  });

  it("builds a small classification context for the AI category call", () => {
    const result = prepareReportText(POLYGENIC_RISK_TEXT);
    expect(result.classificationContext).toContain("Age-related macular degeneration");
    expect(result.classificationContext).toContain("Result: Medium risk");
    expect(result.classificationContext.length).toBeLessThan(800);
  });

  it("returns null resultHeadline when the text doesn't match any known report format", () => {
    const result = prepareReportText("Some unrelated document\nwith no structure at all.");
    expect(result.resultHeadline).toBeNull();
  });
});
