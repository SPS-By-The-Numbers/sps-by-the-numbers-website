import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import ALL_GRADE_LEVELS from "utilities/domain/grade_levels";

import type { FilterDomainTree } from "utilities/filter";

// rc_enrollment data has both per-grade rows and synthetic "All Grades"
// rollups. The dashboard sums per-grade rows itself, so exposing the
// "All Grades" rollup as a selectable bucket would just produce a noisy
// double-count. This filter omits code 99 and adds PK (code 97), which
// only appears in enrollment data.
const ITEM_PREFIX = "egl";

function makeLeaf(d) {
  return makeLeafNode(ITEM_PREFIX, d.grade_level_code, d.grade_level);
}

function byCode(code: number) {
  return ALL_GRADE_LEVELS.find(d => d.grade_level_code === code)!;
}

function makeEnrollmentGradeLevelTree() {
  const preK = makeInternalNode("prek", "Pre-K", [
    makeLeaf(byCode(97)),
  ]);

  const k2 = makeInternalNode("k2", "K-2", [
    makeLeaf(byCode(98)),
    ...([1, 2].map(c => makeLeaf(byCode(c)))),
  ]);

  const upperElementary = makeInternalNode("35", "3-5", [
    ...([3, 4, 5].map(c => makeLeaf(byCode(c)))),
  ]);

  const middle = makeInternalNode("68", "6-8", [
    ...([6, 7, 8].map(c => makeLeaf(byCode(c)))),
  ]);

  const high = makeInternalNode("912", "9-12", [
    ...([9, 10, 11, 12].map(c => makeLeaf(byCode(c)))),
  ]);

  return makeInternalNode("all", "Grades", [preK, k2, upperElementary, middle, high]);
}

const EnrollmentGradeLevelFilter = new Filter(makeEnrollmentGradeLevelTree(), ITEM_PREFIX);

export default EnrollmentGradeLevelFilter;
