// Produces the Filter + UI structure for grouping schools in a district.
import ALL_SCHOOLS from 'app/finance/_domain/schools';
import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
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

function makeSchoolFilterInternal(ccddd: number) {
  const schools = ALL_SCHOOLS[ccddd];
  const children = new Array<FilterDomainTree>;
  for (const s of schools.sort(sortBySchoolName)) {
    children.push(makeLeafNode(ITEM_PREFIX, s.school_code, s.school, s.short_code));
  }
  const schoolFilterTree = makeInternalNode('all', 'All Schools', children);
  return new Filter(schoolFilterTree, ITEM_PREFIX);
}

export const makeSchoolFilter = memoize(makeSchoolFilterInternal);
