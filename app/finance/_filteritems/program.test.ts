import { expect } from "@jest/globals";
import ProgramFilter from "app/finance/_filteritems/program";

describe("program filter", () => {
  it("smoke test", () => {
    expect(ProgramFilter.toFilterString(new Set([1, 88]))).toBe("1_88");
    expect(ProgramFilter.toSummaryText(new Set([1, 88]))).toBe(
      "Only: Basic Education, Child Care");
  });
});
