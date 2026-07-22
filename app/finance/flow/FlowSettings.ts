// Settings type, defaults, and URL serializers for the Expenditure Flow
// (Sankey) view.
//
// The flow view is a SINGLE-dataset, per-district view (not a comparison view),
// so `DEFAULT_FLOW_SETTINGS` is a one-element array built on
// `DEFAULT_DATASET_SETTINGS`. Alongside the usual district + per-level filter
// serializers (`c`/`g`/`cn`/`sn`, `p`/`a`/`o`, `n`, `s`, `rc`/`rv`) it adds four
// custom URL vars unique to this view:
//   - `lv`  enabled optional levels, encoded as the letters "o"/"n"/"s"
//   - `sm`  source mode ("a" = account, omitted = category)
//   - `y`   selected class_of (fiscal year end); omitted => latest available
//   - `dt`  data type ("b" = budget, omitted = actuals)
// Defaults serialize to the empty string so they are omitted from the URL.

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import {
  makeDatasetSerializeConfig,
  makeDefaultActualsSettings,
  makeDefaultDatasetSettings,
  makeDefaultPaoSettings,
  makeDefaultRevenueSettings,
  makeNcesSerializeConfig,
  makePaoSerializeConfig,
  makeRevenueSerializeConfig,
  makeSchoolFilterConfig,
} from "app/finance/_settings/common_settings";

import type { SettingsConfig } from "app/finance/_settings/base_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type {
  NcesFilters,
  PAOFilters,
  RevenueAccountFilters,
  RevenueCategoryFilters,
  SchoolFilters,
} from "utilities/DistrictData";
import type { Level, SourceMode } from "utilities/sankey/types";

export type FlowSettings = DatasetSettings &
  Partial<
    PAOFilters &
      NcesFilters &
      SchoolFilters &
      RevenueCategoryFilters &
      RevenueAccountFilters
  > & {
    // The optional expenditure levels (object/nces/school) toggled on. The
    // mandatory source/program/activity columns are always rendered and are not
    // stored here (the compute engine adds them regardless).
    enabledLevels: Set<Level>;
    sourceMode: SourceMode;
    // null => latest available class_of.
    classOf: number | null;
    dataType: "actuals" | "budget";
  };

// The optional levels, in canonical order, and their compact URL letters.
const OPTIONAL_LEVELS: ReadonlyArray<Level> = ["object", "nces", "school"];
const LEVEL_LETTER: Record<string, string> = {
  object: "o",
  nces: "n",
  school: "s",
};
const LETTER_LEVEL: Record<string, Level> = {
  o: "object",
  n: "nces",
  s: "school",
};

export function serializeEnabledLevels(levels: Set<Level>): string {
  return OPTIONAL_LEVELS.filter((l) => levels.has(l))
    .map((l) => LEVEL_LETTER[l])
    .join("");
}

export function deserializeEnabledLevels(s: string): Set<Level> {
  const out = new Set<Level>();
  for (const ch of s) {
    const level = LETTER_LEVEL[ch];
    if (level) {
      out.add(level);
    }
  }
  return out;
}

export const DEFAULT_FLOW_SETTINGS: Array<FlowSettings> =
  DEFAULT_DATASET_SETTINGS.map((v) => ({
    ...v,
    ...makeDefaultDatasetSettings(v.ccddd),
    ...makeDefaultPaoSettings(),
    ...makeDefaultActualsSettings(v.ccddd),
    ...makeDefaultRevenueSettings(),
    enabledLevels: new Set<Level>(),
    sourceMode: "category" as const,
    classOf: null,
    dataType: "actuals" as const,
  }));

// Custom serializer config for the four flow-only URL vars. Kept separate from
// the shared filter serializers in common_settings.ts so the sankey types stay
// out of the shared settings engine.
export function makeFlowSerializeConfig(): SettingsConfig {
  return [
    [
      "enabledLevels",
      {
        serializerType: "custom",
        urlVar: "lv",
        serialize: (settings, key) => serializeEnabledLevels(settings[key]),
        deserialize: (settings, s) => deserializeEnabledLevels(s),
      },
    ],
    [
      "sourceMode",
      {
        serializerType: "custom",
        urlVar: "sm",
        // "category" is the default and serializes to "" (omitted from URL).
        serialize: (settings, key) => (settings[key] === "account" ? "a" : ""),
        deserialize: (settings, s) => (s === "a" ? "account" : "category"),
      },
    ],
    [
      "classOf",
      {
        serializerType: "custom",
        urlVar: "y",
        // null (latest) serializes to "" (omitted from URL).
        serialize: (settings, key) =>
          settings[key] == null ? "" : String(settings[key]),
        deserialize: (settings, s) => {
          const n = parseInt(s, 10);
          return Number.isNaN(n) ? null : n;
        },
      },
    ],
    [
      "dataType",
      {
        serializerType: "custom",
        urlVar: "dt",
        // "actuals" is the default and serializes to "" (omitted from URL).
        serialize: (settings, key) => (settings[key] === "budget" ? "b" : ""),
        deserialize: (settings, s) => (s === "b" ? "budget" : "actuals"),
      },
    ],
  ];
}

// The dataset-settings serializer generators for the flow view, in fold order:
// district identity, PAO filters, NCES, School (depends on ccddd), revenue
// category/account filters, then the four flow-only custom vars.
export const SERIALIZE_FLOW_SETTINGS_GENERATORS = [
  makeDatasetSerializeConfig,
  makePaoSerializeConfig,
  makeNcesSerializeConfig,
  makeSchoolFilterConfig,
  makeRevenueSerializeConfig,
  makeFlowSerializeConfig,
];
