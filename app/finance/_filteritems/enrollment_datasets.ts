import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import ALL_ENROLLMENT_STUDENT_GROUPS from "utilities/domain/enrollment_student_groups";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "esg";

function makeLeaf(d) {
  return makeLeafNode(ITEM_PREFIX, d.student_group_code, d.student_group);
}

function makeEnrollmentStudentGroupTree() {
  // Group leaves by their student_group_type. "All" sits at the top
  // outside any category so the All Students option is always visible.
  const byType = new Map<string, Array<FilterDomainTree>>();
  let topLevelAll: FilterDomainTree | null = null;
  for (const g of ALL_ENROLLMENT_STUDENT_GROUPS) {
    if (g.student_group_type === "All") {
      topLevelAll = makeLeaf(g);
      continue;
    }
    if (!byType.has(g.student_group_type)) {
      byType.set(g.student_group_type, []);
    }
    byType.get(g.student_group_type)!.push(makeLeaf(g));
  }

  const children: Array<FilterDomainTree> = [];
  if (topLevelAll) children.push(topLevelAll);
  for (const [type, leaves] of byType) {
    children.push(makeInternalNode(type, type, leaves));
  }
  return makeInternalNode("all", "Datasets", children);
}

const EnrollmentStudentGroupFilter = new Filter(makeEnrollmentStudentGroupTree(), ITEM_PREFIX);

export default EnrollmentStudentGroupFilter;
