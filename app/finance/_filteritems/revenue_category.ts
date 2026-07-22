import {
  Filter,
  makeInternalNode,
  makeLeafNodeWithSerialization,
} from "utilities/filter";
import { ALL_REVENUE_CATEGORIES } from "utilities/domain/revenues";

const ITEM_PREFIX = "revcat";

// Flat tree of the ~9 OSPI revenue category (X000) codes. category_code ranges
// over [1000, 9000] which exceeds the compact serialization range, so a
// smaller serializationCode (category_code / 1000, i.e. 1-9) is used for URL
// encoding, mirroring nces.ts.
const RevenueCategoryFilterTree = makeInternalNode(
  "revcat",
  "All Revenue Categories",
  ALL_REVENUE_CATEGORIES.map((c) =>
    makeLeafNodeWithSerialization(
      ITEM_PREFIX,
      c.category_code,
      c.category_code / 1000,
      c.category,
    ),
  ),
);

const RevenueCategoryFilter = new Filter(
  RevenueCategoryFilterTree,
  ITEM_PREFIX,
);

export default RevenueCategoryFilter;
