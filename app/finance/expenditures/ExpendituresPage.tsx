"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultPaoSettings, makeDefaultDatasetSettings } from "app/finance/_settings/common_settings";
import ExpendituresDashboard from "./ExpendituresDashboard";
import { DEFAULT_DASHBOARD_SETTINGS } from "./ExpendituresContextSettings";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { PAOFilters } from "utilities/DistrictData";

export type ExpendituresSettings = DatasetSettings & PAOFilters & {
  overridePrimaryFilter: boolean;
};

export const DEFAULT_EXPENDITURES_SETTINGS = DEFAULT_DATASET_SETTINGS.map(
  v => ({
    ...v,
    overridePrimaryFilter: false,
    ...makeDefaultDatasetSettings(v.ccddd),
    ...makeDefaultPaoSettings(),
  }),
);

export const SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makePaoSerializeConfig,
];

export default function ExpendituresPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_EXPENDITURES_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS}
      defaultContextSettings={DEFAULT_DASHBOARD_SETTINGS}
      contextSettingsConfigGenerators={[]}
      ContentComponent={ExpendituresDashboard}
    />
  );
}
