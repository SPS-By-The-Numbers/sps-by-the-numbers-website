"use client";

import { DEFAULT_DATASET_SETTINGS, serializeDatasetSettings, deserializeDatasetSettings, } from "app/finance/_settings/dataset_settings";
import { DEFAULT_PAO_FILTERS } from "app/finance/_settings/pao_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { serializeSchoolFilters, deserializeSchoolFilters, } from "app/finance/_settings/school_settings";
import { useSearchParams } from 'next/navigation';
import DetailedActualsDashboard from "./DetailedActualsDashboard";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { PAOFilters, SchoolFilters } from "utilities/DistrictData";

export type DetailedActualsSettings = DatasetSettings & PAOFilters & SchoolFilters;

const DEFAULT_DETAILED_ACTUALS_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...DEFAULT_PAO_FILTERS,
  schoolCodes: makeSchoolFilter(v.ccddd).allCodes(),
}));

export const SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS = [
  CommonSettings.makePaoSerializeConfig,
  CommonSettings.makeDutyRootSerializeConfig,
  CommonSettings.makeSchoolFilterConfig,
];

export default function DetailedActualsPage() {
  const searchParams = useSearchParams();
  const allSettings = CommonSettings.deserializeDatasetSettings(
    searchParams.getAll('d'),
    DEFAULT_DETAILED_ACTUALS_SETTINGS,
    SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS
  );
  return (
    <EnsureDistrictData
      allSettings={allSettings}
      sharedSettings={DUMMY_BASE_SETTINGS}
      ContentComponent={DetailedActualsDashboard}
    />
  );
}

