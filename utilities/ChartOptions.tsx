export const ALL_SORT_ORDER = ["ascending", "descending"];
export type SortOrder = (typeof ALL_SORT_ORDER)[number];
export const SORT_ORDER_OPTIONS: Record<SortOrder, string> = {
  ascending: "Ascending",
  descending: "Descending",
};
export function serializeSortOrder(sortOrder: SortOrder): string {
  switch (sortOrder) {
    case "ascending":
      return "a";
    case "descending":
      return "d";
  }
  return "a";
}
export function deserializeSortOrder(s: string): SortOrder {
  if (s === "a") {
    return "ascending";
  } else if (s === "d") {
    return "descending";
  }

  return "ascending";
}

export const ALL_SORT_TYPE = ["variance", "latest"];
export type SortType = (typeof ALL_SORT_TYPE)[number];
export const SORT_TYPE_OPTIONS: Record<SortType, string> = {
  variance: "Median Abs(Variance)",
  latest: "Latest Year",
};
export function serializeSortType(sortType: SortType) {
  switch (sortType) {
    case "variance":
      return "0";
    case "latest":
      return "1";
  }
  return "0";
}
export function deserializeSortType(s: string): SortType {
  if (s === "0") {
    return "variance";
  } else if (s === "1") {
    return "latest";
  }

  return "variance";
}

export const ALL_YSCALES = ["free", "fixed"];
export type YScale = (typeof ALL_YSCALES)[number];
export const YSCALES_OPTIONS: Record<YScale, string> = {
  fixed: "Locked across Facets",
  free: "Facets differ",
};
export function serializeYScales(yscales: YScale) {
  switch (yscales) {
    case "fixed":
      return "0";
    case "free":
      return "1";
  }
  return "0";
}
export function deserializeYScales(s: string): YScale {
  if (s === "0") {
    return "fixed";
  } else if (s === "1") {
    return "free";
  }

  return "fixed";
}

export const ALL_FACET_LIMIT = ["0", "10", "25", "50", "100"];
export type FacetLimit = (typeof ALL_FACET_LIMIT)[number];
export const FACET_LIMIT_OPTIONS: Record<FacetLimit, string> = {
  "0": "Unlimited",
  "10": "10",
  "25": "25",
  "50": "50",
  "100": "100",
};
export function serializeFacetLimit(facetLimit: FacetLimit) {
  return facetLimit as string;
}
export function deserializeFacetLimit(s: string): FacetLimit {
  if (s in FACET_LIMIT_OPTIONS) {
    return s as FacetLimit;
  }

  return "0" as const;
}
