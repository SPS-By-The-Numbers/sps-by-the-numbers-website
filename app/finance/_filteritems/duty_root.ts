import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import ALL_DUTY_ROOTS from "app/finance/_domain/duty_roots";

import type { FilterDomainTree } from "utilities/filter";

const ITEM_PREFIX = "duty";

function makeDutyRootTree() {
  // Collect into categories.
  const dutyCategories : Record<string, Array<FilterDomainTree>> = {};
  for (const d of ALL_DUTY_ROOTS) {
    if (!dutyCategories[d.duty_category]) {
      dutyCategories[d.duty_category] = new Array<FilterDomainTree>;
    }
    dutyCategories[d.duty_category].push(
      makeLeafNode(ITEM_PREFIX, d.duty_code, d.duty_root)
    );
  }

  // Build into basic tree.
  const children = new Array<FilterDomainTree>;
  for (const category of Object.keys(dutyCategories).sort()) {
    children.push(makeInternalNode(category, category, dutyCategories[category]));
  }

  return makeInternalNode("all", "All Duty Titles", children);
}

const DutyRootFilter = new Filter(makeDutyRootTree(), ITEM_PREFIX);

export default DutyRootFilter;
