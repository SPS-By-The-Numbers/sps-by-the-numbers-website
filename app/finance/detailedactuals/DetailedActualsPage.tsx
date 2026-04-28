"use client";

import { DEFAULT_COMMON_FACET_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
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
import type { CommonFacetContextSettings } from "app/finance/_settings/common_context_settings";
import type { SortOrder, SortType, YScale, FacetLimit } from "utilities/ChartOptions";
import type { PAOFilters, SchoolFilters, NcesFilters } from "utilities/DistrictData";

export type DetailedActualsSettings = DatasetSettings & PAOFilters & SchoolFilters & NcesFilters;

const DEFAULT_DETAILED_ACTUALS_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultSettings(v.ccddd)
}));

export type DetailedActualsContextSettings = CommonFacetContextSettings<Facet>;

const DEFAULT_DASHBOARD_SETTINGS : DetailedActualsContextSettings = {
  ...DEFAULT_COMMON_FACET_CONTEXT_SETTINGS,
  facet: "nces",
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
  CommonContextSettingsAll.makeSchoolGroupingSerializeConfig,
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

