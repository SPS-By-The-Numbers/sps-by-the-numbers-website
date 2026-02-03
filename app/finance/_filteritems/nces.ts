import { Filter, makeInternalNode, makeLeafNodeWithSerialization } from "utilities/filter";
import ALL_NCES from "app/finance/_domain/nces";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "nces";

function makeNcesTree() {
  // Collect into categories.
  const categories : Record<string, Array<FilterDomainTree>> = {};
  for (const d of ALL_NCES) {
    if (!categories[d.nces_category]) {
      categories[d.nces_category] = new Array<FilterDomainTree>;
    }
    categories[d.nces_category].push(
      makeLeafNodeWithSerialization(ITEM_PREFIX, d.nces_code, d.serialization_code, d.nces)
    );
  }

  // Build into basic tree.
  const children = new Array<FilterDomainTree>;
  for (const category of Object.keys(categories).sort()) {
    children.push(makeInternalNode(category, category, categories[category]));
  }

  return makeInternalNode("all", "All Nces", children);
}

const NcesFilter = new Filter(makeNcesTree(), ITEM_PREFIX);

export default NcesFilter;

