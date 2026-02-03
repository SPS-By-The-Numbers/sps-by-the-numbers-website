"use client";

import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultDatasetSettings } from "app/finance/_settings/common_settings";
import CorrelationsDashboard from "./CorrelationsDashboard";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

export type CorrelationsSettings = DatasetSettings;


export const DEFAULT_CORRELATIONS_SETTINGS = DEFAULT_DATASET_SETTINGS.map(
  v => ({
    ...v,
    ...makeDefaultDatasetSettings(v.ccddd),
  }),
);

export const SERIALIZE_CORRELATIONS_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
];

export default function CorrelationsPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_CORRELATIONS_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_CORRELATIONS_SETTINGS_GENERATORS}
      defaultContextSettings={DUMMY_BASE_SETTINGS}
      contextSettingsConfigGenerators={[]}
      ContentComponent={CorrelationsDashboard}
    />
  );
}


