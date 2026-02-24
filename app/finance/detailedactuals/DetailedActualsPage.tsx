"use client";

import { DEFAULT_COMMON_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultSettings } from "app/finance/_settings/common_settings";
import { serializeFacet, deserializeFacet } from "./DetailedActualsDashboard";
import * as CommonContextSettingsAll from "app/finance/_settings/common_context_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import DetailedActualsDashboard from "./DetailedActualsDashboard";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { Facet } from "./DetailedActualsDashboard";
import type { CommonContextSettings } from "app/finance/_settings/common_context_settings";
import type { SortOrder, SortType, YScale, FacetLimit } from "utilities/ChartOptions";
import type { PAOFilters, SchoolFilters, NcesFilters } from "utilities/DistrictData";

export type DetailedActualsSettings = DatasetSettings & PAOFilters & SchoolFilters & NcesFilters;

const DEFAULT_DETAILED_ACTUALS_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultSettings(v.ccddd)
}));

export type DetailedActualsContextSettings = CommonContextSettings & {
  facet: Facet;
  facetLimit: FacetLimit;
  sortOrder: SortOrder;
  sortType: SortType;
  yScale: YScale;
}

const DEFAULT_DASHBOARD_SETTINGS = {
  ...DEFAULT_COMMON_CONTEXT_SETTINGS,
  facet: "nces",
  facetLimit: "0",
  sortOrder: "descending",
  sortType: "variance",
  yScale: "fixed",
};

export const SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makePaoSerializeConfig,
  CommonSettings.makeDutyRootSerializeConfig,
  CommonSettings.makeSchoolFilterConfig,
  CommonSettings.makeNcesSerializeConfig,
];

export const SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS = [
  CommonContextSettingsAll.makeFacetSerializeConfigHelper<Facet>(serializeFacet, deserializeFacet),
  CommonContextSettingsAll.makeSortOrderSerializeConfig,
  CommonContextSettingsAll.makeSortOrderSerializeConfig,
  CommonContextSettingsAll.makeYScaleSerializeConfig,
];

export default function DetailedActualsPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_DETAILED_ACTUALS_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS}
      defaultContextSettings={DEFAULT_DASHBOARD_SETTINGS}
      contextSettingsConfigGenerators={SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS}
      ContentComponent={DetailedActualsDashboard}
    />
  );
}

