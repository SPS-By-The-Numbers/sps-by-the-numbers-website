import { expect } from "@jest/globals";
import { makeSchoolFilter } from "app/finance/_filteritems/school";

const SPS_CCDDD = 17001;
const TINY_DISTRICT_CCDDD = 1109; // Two schools, no region/ms_assignment.

function topGroupLabels(filter) {
  return filter.treeViewItems()[0].children.map((c) => c.label);
}

describe("school filter grouping", () => {
  it("groups by middle school area by default", () => {
    const labels = topGroupLabels(makeSchoolFilter(SPS_CCDDD));
    expect(labels).toContain("Eckstein Middle School");
    expect(labels).not.toContain("NE");
  });

  it("groups by region when requested", () => {
    const labels = topGroupLabels(makeSchoolFilter(SPS_CCDDD, "region"));
    expect(labels).toContain("NE");
    expect(labels).toContain("SW");
    expect(labels).not.toContain("Eckstein Middle School");
  });

  it("collapses to a flat tree when no grouping data is present", () => {
    const filter = makeSchoolFilter(TINY_DISTRICT_CCDDD);
    const top = filter.treeViewItems()[0];
    expect(top.label).toBe("All Schools");
    // Direct children are leaf schools, not group nodes.
    for (const c of top.children) {
      expect(c.children?.length ?? 0).toBe(0);
    }
  });

  it("returns distinct trees per (district, grouping) memoization key", () => {
    const a = makeSchoolFilter(SPS_CCDDD, "region");
    const b = makeSchoolFilter(SPS_CCDDD, "ms_assignment_code");
    expect(a).not.toBe(b);
    expect(makeSchoolFilter(SPS_CCDDD, "region")).toBe(a);
  });
});
