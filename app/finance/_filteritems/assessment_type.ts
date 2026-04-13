import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import ALL_ASSESSMENT_TYPES from "utilities/domain/assessment_types";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "ta";

function makeAssessmentTypeTree() {
  const children = new Array<FilterDomainTree>;
  for (const d of ALL_ASSESSMENT_TYPES) {
    children.push(
      makeLeafNode(ITEM_PREFIX, d.test_administration_code, d.test_administration)
    );
  }

  return makeInternalNode("all", "All Assessment Types", children);
}

const AssessmentTypeFilter = new Filter(makeAssessmentTypeTree(), ITEM_PREFIX);

export default AssessmentTypeFilter;
