import ALL_DISTRICTS from "app/finance/_domain/ccddd";
import CurrencyNormalizationSelector from "app/finance/_widgets/CurrencyNormalizationSelector";
import DistrictSelector from "app/finance/_widgets/DistrictSelector";
import FilterGroupingSelector from "app/finance/_widgets/FilterGroupingSelector";
import StaffingNormalizationSelector from "app/finance/_widgets/StaffingNormalizationSelector";
import * as ChartableMetrics from "utilities/ChartableMetrics";
import { serializeSettingsDict, deserializeSettingsDict } from 'utilities/settings';

import type {
  CurrencyNormalization,
  StaffingNormalization,
} from "utilities/ChartableMetrics";
import type { BaseSettings } from "app/finance/_widgets/SettingsContents";

const ALL_FILTER_GROUPING = [
  // Organize filters into categories that makes sense to the SPS By The Numbers maintainers.
  "spsbtn",

  // The OSPI categories used by the state. These tend to not bucket every thing into areas that make
  // semantic sense.
  "ospi",
];
export type FilterGrouping = (typeof ALL_FILTER_GROUPING[number]);
export function serializeFilterGrouping(grouping: FilterGrouping) {
  return grouping as string;
}
export function deserializeFilterGrouping(s: string) : FilterGrouping {
  if (s in ALL_FILTER_GROUPING) {
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
    id: "primary",
    ccddd: 17001,
    filterGrouping: "spsbtn" as const,
    currencyNormalization: "amount" as const,
    staffingNormalization: "fte" as const,
  },
].map((e) => ({ ...e, name: ALL_DISTRICTS[e.ccddd].district }));

export function serializeMetricSettings(s : MetricSettings) {
  const settingsDict = {
    i: s.id,
    c: s.ccddd.toString(),
    g: serializeFilterGrouping(s.filterGrouping),
    cn: ChartableMetrics.serializeCurrencyNormalization(s.currencyNormalization),
    sn: ChartableMetrics.serializeStaffingNormalization(s.staffingNormalization),
  };

  return serializeSettingsDict(settingsDict);
}

export function deserializeMetricSettings(serialized : string) {
  const settingsDict = deserializeSettingsDict(serialized);
  const allSettings = Object.assign({}, DEFAULT_METRIC_SETTINGS);
  const settings = allSettings[0];
  for (const [key, value] of Object.entries(settingsDict)) {
    switch (key) {
      case 'i':
        settings.id = value || settings.id;
        break;

      case 'c':
        settings.ccddd = parseInt(value) || settings.ccddd;
        break;

      case 'g':
        settings.filterGrouping = deserializeFilterGrouping(value);
        break;

      case 'cn':
        settings.currencyNormalization = ChartableMetrics.deserializeCurrencyNormalization(value);
        break;

      case 'sn':
        settings.staffingNormalization = ChartableMetrics.deserializeStaffingNormalization(value);
        break;
    }
  }

  return allSettings;
}

export default function MetricSettingsContents({
  settings,
  setSettings,
}: {
  settings: MetricSettings;
  setSettings: (x: MetricSettings) => void;
}) {
  return (
    <>
      <DistrictSelector
        ccddd={settings.ccddd}
        onChange={(ccddd) =>
          setSettings(Object.assign({}, settings, { ccddd }))
        }
      />
      <FilterGroupingSelector
        label={`Filter Grouping`}
        filterGrouping={settings.filterGrouping}
        onChange={(filterGrouping) =>
          setSettings(Object.assign({}, settings, { filterGrouping }))
        }
      />
      <CurrencyNormalizationSelector
        label={`Money Normalization`}
        normalization={settings.currencyNormalization}
        onChange={(currencyNormalization) =>
          setSettings(Object.assign({}, settings, { currencyNormalization }))
        }
      />
      <StaffingNormalizationSelector
        label={`Staffing Normalization`}
        normalization={settings.staffingNormalization}
        onChange={(staffingNormalization) =>
          setSettings(Object.assign({}, settings, { staffingNormalization }))
        }
      />
    </>
  );
}
