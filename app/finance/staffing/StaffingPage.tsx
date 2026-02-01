"use client";

import { DEFAULT_DATASET_SETTINGS, serializeDatasetSettings } from "app/finance/_settings/dataset_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import { deserializeDatasetSettings } from "app/finance/_settings/common_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultSettings, serializeFilters } from "app/finance/_settings/common_settings";
import { useSearchParams } from 'next/navigation';
import StaffingDashboard from "./StaffingDashboard";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { DutyRootFilters, PAFilters, SchoolFilters } from "utilities/DistrictData";

export type StaffingSettings = DatasetSettings & PAFilters & SchoolFilters & DutyRootFilters;

const DEFAULT_STAFF_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultSettings(v.ccddd)
}));

export const SERIALIZE_STAFFING_SETTINGS_GENERATORS = [
  CommonSettings.makePaSerializeConfig,
  CommonSettings.makeDutyRootSerializeConfig,
  CommonSettings.makeSchoolFilterConfig,
];

export default function StaffingPage() {
  const searchParams = useSearchParams();
  const allSettings = deserializeDatasetSettings(
    searchParams.getAll('d'),
    DEFAULT_STAFF_SETTINGS,
    SERIALIZE_STAFFING_SETTINGS_GENERATORS
  );
  return (
    <EnsureDistrictData
      allSettings={allSettings}
      sharedSettings={DUMMY_BASE_SETTINGS}
      ContentComponent={StaffingDashboard}
    />
  );
}

