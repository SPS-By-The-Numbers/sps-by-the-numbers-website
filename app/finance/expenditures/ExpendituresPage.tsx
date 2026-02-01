"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { deserializeExpenditureContextSettings } from "./ExpendituresContextSettings";
import { useSearchParams } from "next/navigation";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultPaoSettings, makeDefaultDatasetSettings } from "app/finance/_settings/common_settings";
import ExpendituresDashboard from "./ExpendituresDashboard";

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
  const searchParams = useSearchParams();
  const contextSettings = deserializeExpenditureContextSettings(searchParams.getAll('s'));

  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_EXPENDITURES_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS}
      defaultContextSettings={contextSettings}
      ContentComponent={ExpendituresDashboard}
    />
  );
}

