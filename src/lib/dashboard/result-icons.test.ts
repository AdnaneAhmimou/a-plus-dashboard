import { describe, expect, it } from "vitest";
import { Microscope } from "lucide-react";

import { getResultIcon } from "./result-icons";

// The icon is decorative, so these tests are not about taste — they pin
// the ordering rules that would otherwise silently regress, where a
// general pattern steals a match from a specific one.
describe("getResultIcon", () => {
  it("matches the subject of the result, not its category", () => {
    expect(getResultIcon("Open angle glaucoma")).toBe(getResultIcon("Eye clarity"));
    expect(getResultIcon("Age-related hearing impairment")).toBe(
      getResultIcon("Sensorineural hearing loss")
    );
  });

  it("prefers the specific rule over the general one", () => {
    // "Blood glucose" must reach the glucose rule, not the blood rule.
    expect(getResultIcon("Blood glucose")).not.toBe(getResultIcon("Blood Group ABO/Rh"));
    // "Bone mineral density" must reach bone, not the generic density wording.
    expect(getResultIcon("Bone mineral density")).toBe(getResultIcon("Osteoporosis"));
  });

  it("falls back to a neutral icon rather than a confident wrong one", () => {
    expect(getResultIcon("Zzzz unmatched result", "no clue")).toBe(Microscope);
  });

  it("uses the summary when the name alone says nothing", () => {
    expect(getResultIcon("Gene COMT", "You have two copies of the V158M variant")).toBe(
      getResultIcon("Gene MTHFR")
    );
  });

  it("covers the common trait subjects", () => {
    const distinct = new Set(
      [
        "Caffeine and anxiety",
        "Lactose intolerance",
        "Nicotine dependence after prolonged consumption",
        "Height",
        "Insomnia",
        "Metabolizer profile CYP2C19",
        "Colorectal cancer",
        "Resting heart rate",
      ].map((n) => getResultIcon(n))
    );
    // Eight different subjects should not collapse onto one glyph.
    expect(distinct.size).toBeGreaterThanOrEqual(7);
  });
});
