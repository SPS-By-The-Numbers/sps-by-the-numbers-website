import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import ALL_STUDENT_GROUPS from "utilities/domain/student_groups";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "sg";

function makeStudentGroupTree() {
  const groupTypes : Record<string, Array<FilterDomainTree>> = {};
  for (const d of ALL_STUDENT_GROUPS) {
    if (!groupTypes[d.student_group_type]) {
      groupTypes[d.student_group_type] = new Array<FilterDomainTree>;
    }
    groupTypes[d.student_group_type].push(
      makeLeafNode(ITEM_PREFIX, d.student_group_code, d.student_group)
    );
  }

  const children = new Array<FilterDomainTree>;
  for (const groupType of Object.keys(groupTypes).sort()) {
    children.push(makeInternalNode(groupType, groupType, groupTypes[groupType]));
  }

  return makeInternalNode("all", "All Student Groups", children);
}

const StudentGroupFilter = new Filter(makeStudentGroupTree(), ITEM_PREFIX);

export default StudentGroupFilter;
