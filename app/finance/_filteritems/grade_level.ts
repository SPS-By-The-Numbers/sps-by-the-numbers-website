import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import ALL_GRADE_LEVELS from "utilities/domain/grade_levels";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "gl";

function makeLeaf(d) {
  return makeLeafNode(ITEM_PREFIX, d.grade_level_code, d.grade_level);
}

function byCode(code: number) {
  return ALL_GRADE_LEVELS.find(d => d.grade_level_code === code)!;
}

function makeGradeLevelTree() {
  const allGrades = makeLeaf(byCode(99));

  const k5 = makeInternalNode("k5", "K-5", [
    makeLeaf(byCode(98)),
    ...([1, 2, 3, 4, 5].map(c => makeLeaf(byCode(c)))),
  ]);

  const middle = makeInternalNode("68", "6-8", [
    ...([6, 7, 8].map(c => makeLeaf(byCode(c)))),
  ]);

  const high = makeInternalNode("912", "9-12", [
    ...([9, 10, 11, 12].map(c => makeLeaf(byCode(c)))),
  ]);

  return makeInternalNode("all", "All Grade Levels", [allGrades, k5, middle, high]);
}

const GradeLevelFilter = new Filter(makeGradeLevelTree(), ITEM_PREFIX);

export default GradeLevelFilter;
