import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import ALL_TEST_SUBJECTS from "utilities/domain/test_subjects";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "ts";

function makeTestSubjectTree() {
  const children = new Array<FilterDomainTree>;
  for (const d of ALL_TEST_SUBJECTS) {
    children.push(
      makeLeafNode(ITEM_PREFIX, d.test_subject_code, d.test_subject)
    );
  }

  return makeInternalNode("all", "All Test Subjects", children);
}

const TestSubjectFilter = new Filter(makeTestSubjectTree(), ITEM_PREFIX);

export default TestSubjectFilter;
