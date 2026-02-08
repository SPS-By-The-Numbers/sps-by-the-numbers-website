"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultSettings } from "app/finance/_settings/common_settings";
import DetailedActualsDashboard from "./DetailedActualsDashboard";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { PAOFilters, SchoolFilters, NcesFilters } from "utilities/DistrictData";

export type DetailedActualsSettings = DatasetSettings & PAOFilters & SchoolFilters & NcesFilters;

const DEFAULT_DETAILED_ACTUALS_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultSettings(v.ccddd)
}));

export const SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makePaoSerializeConfig,
  CommonSettings.makeDutyRootSerializeConfig,
  CommonSettings.makeSchoolFilterConfig,
  CommonSettings.makeNcesSerializeConfig,
];

export default function DetailedActualsPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_DETAILED_ACTUALS_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS}
      defaultContextSettings={DUMMY_BASE_SETTINGS}
      ContentComponent={DetailedActualsDashboard}
    />
  );
}

