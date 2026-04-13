import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import ALL_GRADE_LEVELS from "utilities/domain/grade_levels";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "gl";

function makeGradeLevelTree() {
  const children = new Array<FilterDomainTree>;
  for (const d of ALL_GRADE_LEVELS) {
    children.push(
      makeLeafNode(ITEM_PREFIX, d.grade_level_code, d.grade_level)
    );
  }

  return makeInternalNode("all", "All Grade Levels", children);
}

const GradeLevelFilter = new Filter(makeGradeLevelTree(), ITEM_PREFIX);

export default GradeLevelFilter;
