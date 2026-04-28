// Produces the Filter + UI structure for grouping schools in a district.
import ALL_SCHOOLS from 'utilities/domain/schools';
import { Filter, makeInternalNode, makeLeafNodeWithSerialization } from "utilities/filter";
import memoize from "lodash/memoize";

import type { FilterDomainTree } from "utilities/filter";
import type { SchoolGrouping } from "app/finance/_settings/common_context_settings";
import type { SchoolInfo } from "utilities/domain/schools";

const ITEM_PREFIX = "school";

// Per grouping, the SchoolInfo field used as the human-readable label
// for each group. (For "region", the value is its own label.)
const GROUPING_LABEL_KEY: Record<SchoolGrouping, keyof SchoolInfo> = {
  region: "region",
  ms_assignment_code: "ms_assignment",
};

export function sortBySchoolName(a, b) {
  if (a.is_district_office && !b.is_district_office) {
    return -1;
  }

  if (!a.is_district_office && b.is_district_office) {
    return 1;
  }

  if (a.school < b.school) {
    return -1;
  }

  if (a.school > b.school) {
    return 1;
  }

  return 0;
}

function makeSchoolFilterInternal(ccddd: number, grouping: SchoolGrouping = "ms_assignment_code") : Filter {
  const schools = ALL_SCHOOLS[ccddd];
  const labelKey = GROUPING_LABEL_KEY[grouping];
  const childrenByGroups = {} as Record<string, { label: string; children: Array<FilterDomainTree> }>;
  for (const s of schools.sort(sortBySchoolName)) {
    const groupKey = String(s[grouping] ?? "default");
    const groupLabel = String(s[labelKey] ?? "default");
    if (childrenByGroups[groupKey] === undefined) {
      childrenByGroups[groupKey] = { label: groupLabel, children: new Array<FilterDomainTree> };
    }
    childrenByGroups[groupKey].children.push(makeLeafNodeWithSerialization(ITEM_PREFIX,
                                                               s.school_code,
                                                               s.serialization_code,
                                                               s.school));
  }

  let schoolFilterTree;
  if (Object.keys(childrenByGroups).length === 1) {
    // There's just the one group. Collapse it.
    schoolFilterTree = makeInternalNode('all', 'All Schools', Object.values(childrenByGroups)[0].children);
  } else {
    const children = new Array<FilterDomainTree>;
    for (const groupKey of Object.keys(childrenByGroups).sort()) {
      const { label, children: groupChildren } = childrenByGroups[groupKey];
      children.push(makeInternalNode(groupKey, label, groupChildren));
    }
    schoolFilterTree = makeInternalNode('all', 'All Schools', children);
  }
  return new Filter(schoolFilterTree, ITEM_PREFIX);
}

export const makeSchoolFilter = memoize(
  makeSchoolFilterInternal,
  (ccddd, grouping = "ms_assignment_code") => `${ccddd}:${grouping}`,
);
