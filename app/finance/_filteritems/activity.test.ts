import { expect } from "@jest/globals";
import ActivityFilter from "app/finance/_filteritems/activity";
import {SYNTH_ACT_CODE_PRINCIPAL_OFFICE} from 'utilities/DistrictData';

describe("activity filter", () => {
  it("smoke test", () => {
    expect(ActivityFilter.toFilterString(new Set([11, SYNTH_ACT_CODE_PRINCIPAL_OFFICE]))).toBe("IAABwCLP");
    expect(ActivityFilter.toSummaryText(new Set([11, SYNTH_ACT_CODE_PRINCIPAL_OFFICE]))).toBe(
      "Only: Principal's Office (23) / Principal (84), Board of Directors"
    );
  });
});
