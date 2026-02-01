"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultSettings } from "app/finance/_settings/common_settings";
import StaffingDashboard from "./StaffingDashboard";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { DutyRootFilters, PAFilters, SchoolFilters } from "utilities/DistrictData";

export type StaffingSettings = DatasetSettings & PAFilters & SchoolFilters & DutyRootFilters;

const DEFAULT_STAFF_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultSettings(v.ccddd)
}));

export const SERIALIZE_STAFFING_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makePaSerializeConfig,
  CommonSettings.makeDutyRootSerializeConfig,
  CommonSettings.makeSchoolFilterConfig,
];

export default function StaffingPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_STAFF_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_STAFFING_SETTINGS_GENERATORS}
      defaultContextSettings={DUMMY_BASE_SETTINGS}
      ContentComponent={StaffingDashboard}
    />
  );
}

