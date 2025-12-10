import { expect } from "@jest/globals";
import ObjectFilter from "app/finance/_filteritems/object";

describe("object filter", () => {
  it("smoke test", () => {
    expect(ObjectFilter.toFilterString(new Set([2, 3, 4]))).toBe("2_3_4");
    expect(ObjectFilter.toSummaryText(new Set([2, 3, 4]))).toBe(
      "Only: Compensation",
    );
  });
});
