import { expect } from "@jest/globals";
import ActivityFilter from "app/finance/_filteritems/activity";

describe("activity filter", () => {
  it("smoke test", () => {
    expect(ActivityFilter.toFilterString(new Set([11, 9991]))).toBe("IAABwCLP");
    expect(ActivityFilter.toSummaryText(new Set([11, 9991]))).toBe(
      "Only: Principal's Office / Principal, Board of Directors",
    );
  });
});
