import { DEFAULT_COMMON_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
import { useId } from "react";
import * as ChartOptions from "utilities/ChartOptions";
import InputLabel from "@mui/material/InputLabel";
import SettingsSelect from "app/finance/_widgets/SettingsSelect";
import Stack from "@mui/material/Stack";
import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";

import type { SerializationConfig } from "app/finance/_settings/common_settings";
import type { CommonContextSettings } from "app/finance/_settings/common_context_settings";
import type { SettingsContentsProps } from "app/finance/_widgets/SettingsContents";
import type { SortOrder, SortType } from "utilities/ChartOptions";

const ALL_FACETS = ["activity", "program", "object"];
type Facet = (typeof ALL_FACETS)[number];
const FACET_OPTIONS: Record<Facet, string> = {
  activity: "Activity",
  program: "Program",
  object: "Object",
};

const YSCALE_OPTIONS: Record<ChartOptions.YScale, string> = {
  ascending: "Ascending",
  descending: "Descending",
};

export type ExpendituresContextSettings = CommonContextSettings & {
  facet: Facet;
  facetLimit: ChartOptions.FacetLimit;
  sortOrder: SortOrder;
  sortType: SortType;
  yScale: ChartOptions.YScale;
}

export const DEFAULT_DASHBOARD_SETTINGS: ExpendituresContextSettings = {
  ...DEFAULT_COMMON_CONTEXT_SETTINGS,
  facet: "activity",
  facetLimit: "0",
  sortOrder: "descending",
  sortType: "variance",
  yScale: "fixed",
};

function serializeFacet(facet: Facet) {
  return facet as string;
}

function deserializeFacet(s: string): Facet {
  switch (s) {
    case "activity":
      return "activity";

    case "program":
      return "program";

    case "object":
      return "object";
  }

  return "activity";
}

export function makeExpenditureDashboardSerializeConfig(context?) : SerializationConfig {
  return [
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
    ], [
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
    ], [
      "yScale", {
        serializerType: "custom",
        urlVar: "ys",
        serialize: (settings, key) => ChartOptions.serializeYScales(settings[key]),
          deserialize: (settings, s) => ChartOptions.deserializeYScales(s),
      },
    ]
  ];
}

export default function ExpendituresContextSettingsContents(
  props: SettingsContentsProps<ExpendituresContextSettings>,
) {
  return (
    <>
      <SettingsSelect
        {...props}
        label="Facet"
        fieldName="facet"
        options={FACET_OPTIONS}
      />
      <SettingsSelect
        {...props}
        label="Facet Limit"
        fieldName="facetLimit"
        options={ChartOptions.FACET_LIMIT_OPTIONS}
      />
      <SettingsSelect
        {...props}
        label="Sort Type"
        fieldName="sortType"
        options={ChartOptions.SORT_TYPE_OPTIONS}
      />
      <SettingsSelect
        {...props}
        label="Sort Order"
        fieldName="sortOrder"
        options={ChartOptions.SORT_ORDER_OPTIONS}
      />
      <SettingsSelect
        {...props}
        label="YScale"
        fieldName="yScale"
        options={ChartOptions.YSCALES_OPTIONS}
      />
    </>
  );
}
