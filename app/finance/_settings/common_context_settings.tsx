import { deserializeByConfig } from "app/finance/_settings/common_settings";
import * as ChartOptions from "utilities/ChartOptions";

import type { BaseSettings, SettingsConfig, SettingsConfigGenerators } from "app/finance/_settings/base_settings";
import type { SortOrder, SortType, YScale, FacetLimit } from "utilities/ChartOptions";

export type CommonContextSettings = BaseSettings & {
  // Whether the dashboard should actually build and render the chart
  // config. Toggling off lets the user stage filter/setting changes
  // without paying the per-dataset chart-build cost.
  chartsEnabled: boolean;
};

const ALL_SCHOOL_GROUPING = ["region", "ms_assignment_code"] as const;
export type SchoolGrouping = (typeof ALL_SCHOOL_GROUPING)[number];

const SCHOOL_GROUPING_SERIALIZE_MAP: Record<SchoolGrouping, string> = {
  ms_assignment_code: "0",
  region: "1",
};
const SCHOOL_GROUPING_DESERIALIZE_MAP = Object.fromEntries(
  Object.entries(SCHOOL_GROUPING_SERIALIZE_MAP).map(([k, v]) => [v, k]),
) as Record<string, SchoolGrouping>;

export function serializeSchoolGrouping(grouping: SchoolGrouping) : string {
  return SCHOOL_GROUPING_SERIALIZE_MAP[grouping] ?? "0";
}

export function deserializeSchoolGrouping(s: string) : SchoolGrouping {
  return SCHOOL_GROUPING_DESERIALIZE_MAP[s] ?? "ms_assignment_code";
}

export type BaseFacetContextSettings = CommonContextSettings & {
  facetLimit: FacetLimit;
  sortOrder: SortOrder;
  sortType: SortType;
  yScale: YScale;
  schoolGrouping: SchoolGrouping;
};

export type CommonFacetContextSettings<FacetType> = BaseFacetContextSettings & {
  facet: FacetType;
};

export const DEFAULT_COMMON_CONTEXT_SETTINGS: CommonContextSettings = {
  name: "Dashboard Settings",
  id: -1,
  chartsEnabled: true,
};

export const DEFAULT_COMMON_FACET_CONTEXT_SETTINGS : BaseFacetContextSettings = {
  ...DEFAULT_COMMON_CONTEXT_SETTINGS,

  facetLimit: "0",
  sortOrder: "descending",
  sortType: "variance",
  yScale: "fixed",
  schoolGrouping: "ms_assignment_code",
};

// Type that constraints to just a string literal.
//
// https://github.com/microsoft/TypeScript/issues/42644#issuecomment-774315112
type StringLiteral<T> = T extends string ? string extends T ? never : T : never;

export function makeFacetSerializeConfigHelper<T>(
  serializeFacet : (v: StringLiteral<T>) => string,
    deserializeFacet : (s: string) => T) : (context?) => SettingsConfig
  {
    return (context?) => [
      [
        "facet",
        {
          serializerType: "custom",
          urlVar: "f",
          serialize: (settings, key) => serializeFacet(settings[key]),
            deserialize: (settings, s) => deserializeFacet(s),
        },
      ], [
        "facetLimit",
        {
          serializerType: "custom",
          urlVar: "l",
          serialize: (settings, key) => ChartOptions.serializeFacetLimit(settings[key]),
            deserialize: (settings, s) => ChartOptions.deserializeFacetLimit(s),
        },
      ],
    ];
}

export function makeSortOrderSerializeConfig(context?) : SettingsConfig {
  return [
    [
      "sortOrder", {
        serializerType: "custom",
        urlVar: "so",
        serialize: (settings, key) => ChartOptions.serializeSortOrder(settings[key]),
          deserialize: (settings, s) => ChartOptions.deserializeSortOrder(s),
      },
    ], [
      "sortType", {
        serializerType: "custom",
        urlVar: "st",
        serialize: (settings, key) => ChartOptions.serializeSortType(settings[key]),
          deserialize: (settings, s) => ChartOptions.deserializeSortType(s),
      },
    ]
  ];
}

export function makeSchoolGroupingSerializeConfig(context?) : SettingsConfig {
  return [
    [
      "schoolGrouping", {
        serializerType: "custom",
        urlVar: "csg",
        serialize: (settings, key) => serializeSchoolGrouping(settings[key]),
          deserialize: (settings, s) => deserializeSchoolGrouping(s),
      },
    ]
  ];
}

export function makeChartsEnabledSerializeConfig(context?) : SettingsConfig {
  return [
    [
      "chartsEnabled", {
        serializerType: "custom",
        urlVar: "ce",
        serialize: (settings, key) => settings[key] ? "1" : "0",
          deserialize: (settings, s) => s !== "0",
      },
    ]
  ];
}

export function makeYScaleSerializeConfig(context?) : SettingsConfig {
  return [
    [
      "yScale", {
        serializerType: "custom",
        urlVar: "ys",
        serialize: (settings, key) => ChartOptions.serializeYScales(settings[key]),
          deserialize: (settings, s) => ChartOptions.deserializeYScales(s),
      },
    ]
  ];
}

export function deserializeContextSettings<ContextSettingsType extends BaseSettings>(
  queries: Array<string>,
  defaultContextSettings: ContextSettingsType,
  configGenerators: SettingsConfigGenerators
) : ContextSettingsType {
  if (queries.length === 0) {
    return defaultContextSettings;
  }
  // Only use the first parameter for the context settings if there are repeats.
  const firstQuery = queries[0];

  // Make settings.
  let settings = Object.assign({}, defaultContextSettings);

  // Run through each config in order.
  for (const geneator of configGenerators) {
    settings = deserializeByConfig(settings, geneator(settings), firstQuery);
  }

  // Stamp an invalid id for the context.
  settings.id = -1;

  return settings;
}

export const COMMON_FACET_CONTEXT_SETTINGS_GENERATORS = [
  makeSortOrderSerializeConfig,
  makeSortOrderSerializeConfig,
  makeYScaleSerializeConfig,
  makeChartsEnabledSerializeConfig,
];
