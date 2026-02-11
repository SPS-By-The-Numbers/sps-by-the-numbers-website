"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultPaoSettings, makeDefaultDatasetSettings } from "app/finance/_settings/common_settings";
import ExpendituresDashboard from "./ExpendituresDashboard";
import { DEFAULT_DASHBOARD_SETTINGS, makeExpenditureDashboardSerializeConfig } from "./ExpendituresContextSettings";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { PAOFilters } from "utilities/DistrictData";
import type { SerializationConfig } from "app/finance/_settings/common_settings";

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

function makeExpenditreDatasetSerializeConfig(context?) : SerializationConfig {
  return [
    [
      "overridePrimaryFilter",
      {
        serializerType: "custom",
        urlVar: "of",
        serialize: (settings, key) => (settings[key] ? "1" : "0"),
          deserialize: (settings, s) => (s === "1" ? true : false)
      }
    ],
  ];
}

export const SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makePaoSerializeConfig,
  makeExpenditreDatasetSerializeConfig,
];

export const SERIALIZE_EXPENDITURES_CONTEXT_SETTINGS_GENERATORS = [
  makeExpenditureDashboardSerializeConfig,
];

export default function ExpendituresPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_EXPENDITURES_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS}
      defaultContextSettings={DEFAULT_DASHBOARD_SETTINGS}
      contextSettingsConfigGenerators={SERIALIZE_EXPENDITURES_CONTEXT_SETTINGS_GENERATORS}
      ContentComponent={ExpendituresDashboard}
    />
  );
}
