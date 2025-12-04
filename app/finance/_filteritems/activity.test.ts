import { expect } from "@jest/globals";
import ActivityFilter from "app/finance/_filteritems/activity";

describe("activity filter", () => {
  it("smoke test", () => {
    expect(ActivityFilter.toFilterString(new Set([11, 9991]))).toBe("11_9991");
    expect(ActivityFilter.toSummaryText(new Set([11, 9991]))).toBe(
      "Only: Board of Directors, Principal's Office / Principal",
    );
  });
});
