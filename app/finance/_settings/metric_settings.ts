import ALL_DISTRICTS from "app/finance/_domain/ccddd";
import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";
import * as ChartableMetrics from "utilities/ChartableMetrics";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type {
  CurrencyNormalization,
  StaffingNormalization,
} from "utilities/ChartableMetrics";

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

export interface MetricSettings extends BaseSettings {
  ccddd: number;
  filterGrouping: FilterGrouping;
  currencyNormalization: CurrencyNormalization;
  staffingNormalization: StaffingNormalization;
}

export const DEFAULT_METRIC_SETTINGS: Array<MetricSettings> = [
  {
    id: 0,
    ccddd: 17001,
    filterGrouping: "spsbtn" as const,
    currencyNormalization: "amount" as const,
    staffingNormalization: "fte" as const,
  },
].map((e) => ({ ...e, name: ALL_DISTRICTS[e.ccddd].district }));

export function serializeMetricSettings(s: MetricSettings) {
  const settingsDict = {
    c: s.ccddd.toString(),
    g: serializeFilterGrouping(s.filterGrouping),
    cn: ChartableMetrics.serializeCurrencyNormalization(
      s.currencyNormalization,
    ),
    sn: ChartableMetrics.serializeStaffingNormalization(
      s.staffingNormalization,
    ),
  };

  return serializeSettingsDict(settingsDict);
}

export function deserializeOneMetricSettings(
  defaultSettings,
  serialized: string,
) {
  const settingsDict = deserializeSettingsDict(serialized);
  const settings = Object.assign({}, defaultSettings);
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case "c":
        settings.ccddd = parseInt(value) || settings.ccddd;
        break;

      case "g":
        settings.filterGrouping = deserializeFilterGrouping(value);
        break;

      case "cn":
        settings.currencyNormalization =
          ChartableMetrics.deserializeCurrencyNormalization(value);
        break;

      case "sn":
        settings.staffingNormalization =
          ChartableMetrics.deserializeStaffingNormalization(value);
        break;
    }
  }

  settings.name = ALL_DISTRICTS[settings.ccddd].district;

  return settings;
}

