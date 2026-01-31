import { expect } from "@jest/globals";
import DutyRootFilter from "app/finance/_filteritems/duty_root";

describe("duty root filter", () => {
  it("golden test", () => {
    expect(DutyRootFilter.toFilterString(new Set([11, 22, 31]))).toBe("OAABACAQ");
    expect(DutyRootFilter.toSummaryText(new Set([11, 22, 31]))).toBe(
      "Only: Superintendent, Elementary Vice Principal, Elementary Homeroom Teacher"
    );
  });
  it("roundtrip", () => {
    const serialized = DutyRootFilter.toFilterString(new Set([11, 22, 31]));
    expect(DutyRootFilter.fromFilterString(serialized)).toEqual(new Set([11, 22, 31]));
  });
});

