import { describe, expect, it } from "vitest";
import { Cigarette, Milk, Dumbbell } from "lucide-react";

import { getActionIcon } from "./action-icons";

describe("getActionIcon", () => {
  it("matches the imperative verb in a recommendation sentence", () => {
    expect(getActionIcon("Quit smoking and limit alcohol consumption.")).toBe(
      Cigarette
    );
    expect(
      getActionIcon(
        "Ensure adequate calcium intake either through diet or supplements."
      )
    ).toBe(Milk);
    expect(
      getActionIcon("Engage in physical exercise regularly for at least 30 minutes a day.")
    ).toBe(Dumbbell);
  });

  it("returns null rather than a wrong icon for unrecognised text", () => {
    expect(getActionIcon("Zzzz nothing relevant here")).toBeNull();
  });
});
