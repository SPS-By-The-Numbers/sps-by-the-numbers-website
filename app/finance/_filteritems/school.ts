// Produces the Filter + UI structure for grouping schools in a district.
import ALL_SCHOOLS from 'app/finance/_domain/schools';
import { Filter, makeInternalNode, makeLeafNodeWithSerialization } from "utilities/filter";
import memoize from "lodash/memoize";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "school";

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

function makeSchoolFilterInternal(ccddd: number, groupingKey?: string) : Filter {
  const schools = ALL_SCHOOLS[ccddd];
  const childrenByGroups = {} as Record<string, Array<FilterDomainTree>>;
  for (const s of schools.sort(sortBySchoolName)) {
    const group = s[groupingKey] ?? "default";
    if (childrenByGroups[group] === undefined) {
      childrenByGroups[group] = new Array<FilterDomainTree>;
    }
    childrenByGroups[group].push(makeLeafNodeWithSerialization(ITEM_PREFIX,
                                                               s.school_code,
                                                               s.serialization_code,
                                                               s.school));
  }

  let schoolFilterTree;
  if (Object.keys(childrenByGroups).length === 1) {
    // There's just the one group. Collapse it.
    schoolFilterTree = makeInternalNode('all', 'All Schools', Object.values(childrenByGroups)[0]);
  } else {
    const children = new Array<FilterDomainTree>;
    for (const [name, c] of Object.entries(childrenByGroups)) {
      children.push(makeInternalNode(name, name, c));
    }
    schoolFilterTree = makeInternalNode('all', 'All Schools', children);
  }
  return new Filter(schoolFilterTree, ITEM_PREFIX);
}

export const makeSchoolFilter = memoize(makeSchoolFilterInternal);
