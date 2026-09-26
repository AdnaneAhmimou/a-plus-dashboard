import { describe, expect, it } from "vitest";
import {
  detectResultType,
  getResultZones,
  getActiveZoneIndex,
  getSummaryTone,
  parsePopulationPercent,
  splitIntoActionItems,
  getMetabolizerIndex,
} from "./result-type";

// Headlines below are the exact wordings the real corpus in /results
// produces, so these cases track the actual source data rather than
// invented strings.
describe("detectResultType", () => {
  it("classifies polygenic risk reports", () => {
    expect(detectResultType("Medium risk")).toBe("RISK");
    expect(detectResultType("Low risk")).toBe("RISK");
  });

  it("classifies carrier reports, including ones that also say risk", () => {
    expect(detectResultType("Variant present")).toBe("CARRIER");
    expect(detectResultType("Variant absent")).toBe("CARRIER");
  });

  it("classifies quantitative biomarker reports", () => {
    expect(detectResultType("Average levels")).toBe("LEVELS");
    expect(detectResultType("Low density")).toBe("LEVELS");
    expect(detectResultType("High levels")).toBe("LEVELS");
  });
});

describe("getActiveZoneIndex", () => {
  it("locates the zone for each risk tier", () => {
    expect(getActiveZoneIndex("Low risk", "RISK")).toBe(0);
    expect(getActiveZoneIndex("Medium risk", "RISK")).toBe(1);
    expect(getActiveZoneIndex("High risk", "RISK")).toBe(2);
  });

  it("treats 'Average' as the middle tier for levels results", () => {
    expect(getActiveZoneIndex("Average levels", "LEVELS")).toBe(1);
    expect(getActiveZoneIndex("Low density", "LEVELS")).toBe(0);
    expect(getActiveZoneIndex("High levels", "LEVELS")).toBe(2);
  });

  it("locates carrier status", () => {
    expect(getActiveZoneIndex("Variant absent", "CARRIER")).toBe(0);
    expect(getActiveZoneIndex("Variant present", "CARRIER")).toBe(1);
  });

  it("returns -1 for wording it doesn't recognise, rather than guessing", () => {
    expect(getActiveZoneIndex("Inconclusive", "RISK")).toBe(-1);
  });
});

describe("getSummaryTone", () => {
  it("uses traffic-light tones only for explicit risk wording", () => {
    expect(getSummaryTone("Low risk")).toBe("success");
    expect(getSummaryTone("Medium risk")).toBe("warning");
    expect(getSummaryTone("High risk")).toBe("destructive");
  });

  it("never marks a carrier finding as alarming", () => {
    expect(getSummaryTone("Variant absent")).toBe("success");
    expect(getSummaryTone("Variant present")).toBe("info");
  });

  it("stays neutral for biomarker levels, where direction has no fixed meaning", () => {
    expect(getSummaryTone("Low levels")).toBe("neutral");
    expect(getSummaryTone("Average levels")).toBe("neutral");
    expect(getSummaryTone("High levels")).toBe("neutral");
  });

  it("falls back to neutral for unrecognised wording", () => {
    expect(getSummaryTone("Inconclusive")).toBe("neutral");
  });
});

describe("getResultZones", () => {
  it("gives carrier results two zones and the others three", () => {
    expect(getResultZones("RISK")).toHaveLength(3);
    expect(getResultZones("LEVELS")).toHaveLength(3);
    expect(getResultZones("CARRIER")).toHaveLength(2);
  });

  it("keeps every levels zone neutral so no direction reads as good or bad", () => {
    expect(getResultZones("LEVELS").every((z) => z.tone === "neutral")).toBe(true);
  });
});

describe("parsePopulationPercent", () => {
  it("pulls the percentage out of the source's context sentence", () => {
    expect(
      parsePopulationPercent(
        "90% of the world's population has a medium risk. Within the medium risk, your results"
      )
    ).toBe(90);
  });

  it("handles decimals", () => {
    expect(parsePopulationPercent("Around 12.5% of people fall here")).toBe(12.5);
  });

  it("returns null when no percentage is quoted, rather than inventing one", () => {
    expect(parsePopulationPercent("Your results indicate a slight tendency")).toBeNull();
    expect(parsePopulationPercent(null)).toBeNull();
  });

  it("rejects out-of-range values", () => {
    expect(parsePopulationPercent("500% of people")).toBeNull();
  });
});

describe("splitIntoActionItems", () => {
  it("splits a prevention section into verbatim checklist items", () => {
    const result = splitIntoActionItems(
      "There are recommendations that can slow its progression: Eat healthy. Limit saturated fats. Quit smoking and avoid alcohol."
    );
    expect(result?.lead).toBe(
      "There are recommendations that can slow its progression:"
    );
    expect(result?.items).toEqual([
      "Eat healthy.",
      "Limit saturated fats.",
      "Quit smoking and avoid alcohol.",
    ]);
  });

  it("works without an intro sentence", () => {
    const result = splitIntoActionItems("Regular eye exams. Avoid smoking.");
    expect(result?.lead).toBeNull();
    expect(result?.items).toHaveLength(2);
  });

  it("returns null for a single sentence so callers render prose instead", () => {
    expect(
      splitIntoActionItems("There is no preventive treatment for this condition.")
    ).toBeNull();
    expect(splitIntoActionItems(null)).toBeNull();
  });

  it("caps the list so a long section can't flood the card", () => {
    const many = Array.from({ length: 20 }, (_, i) => `Item number ${i}.`).join(" ");
    expect(splitIntoActionItems(many)?.items.length).toBeLessThanOrEqual(8);
  });
});

describe("detectResultType — probability and outcome shapes", () => {
  it("routes likelihood wording to PROBABILITY", () => {
    expect(detectResultType("High probability of having acne")).toBe("PROBABILITY");
    expect(detectResultType("Low probability of being a redhead")).toBe("PROBABILITY");
    expect(detectResultType("Increased probability")).toBe("PROBABILITY");
    expect(detectResultType("Slight predisposition to increase")).toBe("PROBABILITY");
  });

  it("routes named categorical results to OUTCOME", () => {
    expect(detectResultType("Light eyes (blue and green)")).toBe("OUTCOME");
    expect(detectResultType("Farmer profile")).toBe("OUTCOME");
    expect(detectResultType("Secretory state")).toBe("OUTCOME");
    expect(detectResultType("Ability to perceive bitter taste")).toBe("OUTCOME");
  });

  it("routes metabolizer status to OUTCOME, never LEVELS", () => {
    // "Poor CYP2D6 metabolizer" contains no level wording but would fall
    // through to LEVELS without the explicit metabolizer check.
    expect(detectResultType("Normal CYP2C19 metabolizer")).toBe("OUTCOME");
    expect(detectResultType("Poor CYP3A5 metabolizer")).toBe("OUTCOME");
    expect(detectResultType("Ultrafast CYP2C19 metabolizer")).toBe("OUTCOME");
  });

  it("keeps risk wording as RISK even when it mentions a tendency", () => {
    expect(detectResultType("Medium risk")).toBe("RISK");
    expect(detectResultType("slight tendency towards high risk")).toBe("RISK");
  });

  it("does not treat risk-taking personality as disease risk", () => {
    // Routing this to the risk template would put a red "High risk" zone
    // on a patient's temperament.
    expect(detectResultType("High probability of being a risk-taker")).toBe(
      "PROBABILITY"
    );
  });

  it("keeps biomarker wording as LEVELS", () => {
    expect(detectResultType("Average levels")).toBe("LEVELS");
    expect(detectResultType("Low count")).toBe("LEVELS");
    expect(detectResultType("High body mass index")).toBe("LEVELS");
  });
});

describe("getMetabolizerIndex", () => {
  it("maps each named state to its position on the scale", () => {
    expect(getMetabolizerIndex("Poor CYP3A5 metabolizer")).toBe(0);
    expect(getMetabolizerIndex("Intermediate CYP2C9 metabolizer")).toBe(1);
    expect(getMetabolizerIndex("Normal CYP2D6 metabolizer")).toBe(2);
    expect(getMetabolizerIndex("Rapid CYP2C19 metabolizer")).toBe(3);
    expect(getMetabolizerIndex("Ultrafast CYP2C19 metabolizer")).toBe(4);
  });

  it("returns -1 rather than guessing when the wording is unfamiliar", () => {
    expect(getMetabolizerIndex("Unusual metabolizer")).toBe(-1);
  });
});
