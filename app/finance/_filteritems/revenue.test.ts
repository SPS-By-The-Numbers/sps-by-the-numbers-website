import { expect } from "@jest/globals";
import RevenueFilter from "app/finance/_filteritems/revenue";
import {
  ALL_REVENUES,
  ALL_REVENUE_CATEGORIES,
} from "utilities/domain/revenues";

describe("revenue filter", () => {
  it("round trips a subset of accounts through toFilterString/fromFilterString", () => {
    // 1100 Local Property Tax, 3100 Apportionment, 6151 ESEA Disadvantaged.
    const selected = new Set([1100, 3100, 6151]);
    const filterString = RevenueFilter.toFilterString(selected);
    expect(RevenueFilter.fromFilterString(filterString)).toEqual(selected);
  });

  it("round trips all accounts selected", () => {
    const allCodes = RevenueFilter.allCodes();
    expect(allCodes).toEqual(new Set(ALL_REVENUES.map((r) => r.revenue_code)));

    const filterString = RevenueFilter.toFilterString(allCodes);
    expect(RevenueFilter.fromFilterString(filterString)).toEqual(allCodes);
    expect(RevenueFilter.toSummaryText(allCodes)).toBe("all");
  });

  it("uses serializationCode for compact encoding of the sparse revenue_code domain", () => {
    // Every leaf's serializationCode should land in [0, ALL_REVENUES.length), unlike
    // the raw revenue_code values which range up to 9901.
    expect(RevenueFilter.fromSerializationCode(0)).toBe(1100);
  });

  it("groups accounts under their category in the tree", () => {
    const items = RevenueFilter.treeViewItems();
    expect(items).toHaveLength(1);
    const categories = items[0].children ?? [];
    expect(categories).toHaveLength(ALL_REVENUE_CATEGORIES.length);

    const totalLeaves = categories.reduce(
      (acc, category) => acc + (category.children?.length ?? 0),
      0,
    );
    expect(totalLeaves).toBe(ALL_REVENUES.length);
  });
});
