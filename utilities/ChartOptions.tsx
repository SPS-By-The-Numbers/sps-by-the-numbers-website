// TODO: Move SortOrder and SortType here.
import type { SortOrder, SortType } from "utilities/ChartableMetrics";

export const SORT_ORDER_OPTIONS: Record<SortOrder, string> = {
  ascending: "Ascending",
  descending: "Descending",
};

export const SORT_TYPE_OPTIONS: Record<SortType, string> = {
  variance: "Median Abs(Variance)",
  latest: "Latest Year",
};

export const ALL_YSCALES = ["free", "fixed", "free_zoomed"];
export type YScale = (typeof ALL_YSCALES)[number];
export const YSCALES_OPTIONS: Record<YScale, string> = {
  fixed: "Locked over Facets",
  free: "Facets differ",
  free_zoomed: "Facets differ (zoomed)",
};

export const ALL_FACET_LIMIT = ["99999", "10", "25", "50", "100"];
export type FacetLimit = (typeof ALL_FACET_LIMIT)[number];
export const FACET_LIMIT_OPTIONS: Record<FacetLimit, string> = {
  "99999": "Unlimited",
  "10": "10",
  "25": "25",
  "50": "50",
  "100": "100",
};
