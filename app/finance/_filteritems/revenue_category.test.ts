import { expect } from "@jest/globals";
import RevenueCategoryFilter from "app/finance/_filteritems/revenue_category";
import { ALL_REVENUE_CATEGORIES } from "utilities/domain/revenues";

describe("revenue category filter", () => {
  it("round trips a subset of categories through toFilterString/fromFilterString", () => {
    const selected = new Set([1000, 3000, 6000]);
    const filterString = RevenueCategoryFilter.toFilterString(selected);
    expect(RevenueCategoryFilter.fromFilterString(filterString)).toEqual(
      selected,
    );
  });

  it("round trips all categories selected", () => {
    const allCodes = RevenueCategoryFilter.allCodes();
    expect(allCodes).toEqual(
      new Set(ALL_REVENUE_CATEGORIES.map((c) => c.category_code)),
    );

    const filterString = RevenueCategoryFilter.toFilterString(allCodes);
    expect(RevenueCategoryFilter.fromFilterString(filterString)).toEqual(
      allCodes,
    );
    expect(RevenueCategoryFilter.toSummaryText(allCodes)).toBe("all");
  });

  it("summarizes a single selected category", () => {
    expect(RevenueCategoryFilter.toSummaryText(new Set([1000]))).toBe(
      "Only: Local Taxes",
    );
  });

  it("exposes a flat tree of the categories", () => {
    const items = RevenueCategoryFilter.treeViewItems();
    expect(items).toHaveLength(1);
    const categories = items[0].children ?? [];
    expect(categories).toHaveLength(ALL_REVENUE_CATEGORIES.length);
    for (const child of categories) {
      expect(child.children).toBeUndefined();
    }
  });
});
