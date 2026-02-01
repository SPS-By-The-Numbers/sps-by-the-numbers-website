"use client";

import { DEFAULT_DATASET_SETTINGS, serializeDatasetSettings, deserializeDatasetSettings, } from "app/finance/_settings/dataset_settings";
import { DEFAULT_PAO_FILTERS, serializePAOFilters, deserializePAOFilters } from "app/finance/_settings/pao_settings";
import { deserializeExpenditureSharedSettings } from "./ExpendituresSharedSettings";
import { deserializeSettings } from "app/finance/_settings/base_settings";
import { useSearchParams } from "next/navigation";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import ExpendituresDashboard from "./ExpendituresDashboard";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { PAOFilters } from "utilities/DistrictData";

export type ExpendituresSettings = DatasetSettings & PAOFilters & {
  overridePrimaryFilter: boolean;
};

export const DEFAULT_EXPENDITURES_SETTINGS = DEFAULT_DATASET_SETTINGS.map(
  (v) => ({
    ...v,
    overridePrimaryFilter: false,
    ...DEFAULT_PAO_FILTERS,
  }),
);

export function serializeExpendituresSettings(settings: ExpendituresSettings): string {
  const fragments =  [serializeDatasetSettings(settings)];

  // Only output filters if they are overridden or this is the primary setting.
  if (settings.overridePrimaryFilter || settings.id === 0) {
    fragments.push(serializePAOFilters(settings))
  }

  // Drop missing settings. Then join with ~.
  return fragments.join("~");
}

export function serializeExpenditureFilterSettings(
  allSettings: Array<ExpendituresSettings>,
): Array<string> {
  const result = new Array<string>();
  for (const setting of allSettings) {
    result.push(serializeExpendituresSettings(setting));
  }
  return result;
}

export function deserializeExpendituresSettings(
  defaultSettings,
  serialized: string,
) : ExpendituresSettings {
  const settings = deserializeDatasetSettings(defaultSettings, serialized);
  const paoSettings = deserializePAOFilters({}, serialized);
  const overridePrimaryFilter = Object.keys(paoSettings).length !== 0;

  return {
    ...settings,
    overridePrimaryFilter,
    ...paoSettings,
  };
}

export function deserializeExpenditureFilterSettings(queries: Array<string>) {
  return deserializeSettings(queries,
                             DEFAULT_EXPENDITURES_SETTINGS,
                             deserializeExpendituresSettings);
}

export default function ExpendituresPage() {
  const searchParams = useSearchParams();
  const allSettings = deserializeSettings(
    searchParams.getAll('d'),
    DEFAULT_EXPENDITURES_SETTINGS,
    deserializeExpendituresSettings);
  const sharedSettings = deserializeExpenditureSharedSettings(searchParams.getAll('s'));

  return (
    <EnsureDistrictData
      allSettings={allSettings}
      sharedSettings={sharedSettings}
      ContentComponent={ExpendituresDashboard}
    />
  );
}

