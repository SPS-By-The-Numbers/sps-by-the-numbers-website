import ALL_DISTRICTS from "app/finance/_domain/ccddd";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type {
  CurrencyNormalization,
  StaffingNormalization,
} from "utilities/normalizations";

const ALL_FILTER_GROUPING = [
  // Organize filters into categories that makes sense to the SPS By The Numbers maintainers.
  "spsbtn",

  // The OSPI categories used by the state. These tend to not bucket every thing into areas that make
  // semantic sense.
  "ospi",
];
export type FilterGrouping = (typeof ALL_FILTER_GROUPING)[number];
export function serializeFilterGrouping(grouping: FilterGrouping) {
  return grouping as string;
}
export function deserializeFilterGrouping(s: string): FilterGrouping {
  if (ALL_FILTER_GROUPING.includes(s)) {
    return s as FilterGrouping;
  }

  return "spsbtn" as const;
}

export type DatasetSettings = BaseSettings & {
  ccddd: number;
  filterGrouping: FilterGrouping;
  currencyNormalization: CurrencyNormalization;
  staffingNormalization: StaffingNormalization;
}

export const DEFAULT_DATASET_SETTINGS: Array<DatasetSettings> = [
  {
    id: 0,
    ccddd: 17001,
    name: ALL_DISTRICTS[17001].district,
    filterGrouping: "spsbtn" as const,
    currencyNormalization: "amount" as const,
    staffingNormalization: "fte" as const,
  },
];
