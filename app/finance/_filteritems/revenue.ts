import {
  Filter,
  makeInternalNode,
  makeLeafNodeWithSerialization,
} from "utilities/filter";
import {
  ALL_REVENUES,
  ALL_REVENUE_CATEGORIES,
} from "utilities/domain/revenues";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "rev";

function makeRevenueTree() {
  // Collect leaves into their category, keyed by category_code so we can
  // iterate in the natural 1000..9000 order rather than alphabetically.
  const categoryLabels: Record<number, string> = {};
  for (const c of ALL_REVENUE_CATEGORIES) {
    categoryLabels[c.category_code] = c.category;
  }

  const byCategory: Record<number, Array<FilterDomainTree>> = {};
  for (const r of ALL_REVENUES) {
    if (!byCategory[r.category_code]) {
      byCategory[r.category_code] = new Array<FilterDomainTree>();
    }
    byCategory[r.category_code].push(
      makeLeafNodeWithSerialization(
        ITEM_PREFIX,
        r.revenue_code,
        r.serialization_code,
        `${r.revenue_code} ${r.revenue}`,
        r.revenue,
      ),
    );
  }

  const children = new Array<FilterDomainTree>();
  for (const categoryCode of Object.keys(byCategory)
    .map(Number)
    .sort((a, b) => a - b)) {
    children.push(
      makeInternalNode(
        `revcat-${categoryCode}`,
        categoryLabels[categoryCode],
        byCategory[categoryCode],
      ),
    );
  }

  return makeInternalNode("all", "All Revenue Accounts", children);
}

const RevenueFilter = new Filter(makeRevenueTree(), ITEM_PREFIX);

export default RevenueFilter;
