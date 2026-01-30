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

function makeToShortCodeInternal(ccddd: number) {
  const schools = ALL_SCHOOLS[ccddd];
  const mapping : Record<number, number> = {};
  for (const s of schools.sort(sortBySchoolName)) {
    mapping[s.school_code] = s.short_code;
  }
  return x => mapping[x];
}

function makeFromShortCodeInternal(ccddd: number) {
  const schools = ALL_SCHOOLS[ccddd];
  const mapping : Record<number, number> = {};
  for (const s of schools.sort(sortBySchoolName)) {
    mapping[s.short_code] = s.school_code;
  }
  return x => mapping[x];
}

function makeSchoolFilterInternal(ccddd: number) {
  const schools = ALL_SCHOOLS[ccddd];
  const children = new Array<FilterDomainTree>;
  for (const s of schools.sort(sortBySchoolName)) {
    children.push(makeLeafNodeWithSerialization(ITEM_PREFIX,
                                                s.school_code,
                                                s.serialization_code,
                                                s.school));
  }
  const schoolFilterTree = makeInternalNode('all', 'All Schools', children);
  return new Filter(schoolFilterTree, ITEM_PREFIX);
}

export const makeSchoolFilter = memoize(makeSchoolFilterInternal);
export const makeToShortCode = memoize(makeToShortCodeInternal);
export const makeFromShortCode = memoize(makeFromShortCodeInternal);
