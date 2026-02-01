"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultDatasetSettings } from "app/finance/_settings/common_settings";
import VitalsDashboard from "./VitalsDashboard";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

export type VitalsSettings = DatasetSettings;

export const DEFAULT_VITALS_SETTINGS = DEFAULT_DATASET_SETTINGS.map(
  v => ({
    ...v,
    overridePrimaryFilter: false,
    ...makeDefaultDatasetSettings(v.ccddd),
  }),
);

export const SERIALIZE_VITALS_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
];

export default function VitalsPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_VITALS_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_VITALS_SETTINGS_GENERATORS}
      defaultContextSettings={DEFAULT_DATASET_SETTINGS}
      contextSettingsConfigGenerators={[]}
      ContentComponent={VitalsDashboard}
    />
  );
}

