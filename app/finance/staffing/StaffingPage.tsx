"use client";

import { DEFAULT_METRIC_SETTINGS, serializeMetricSettings } from "app/finance/_settings/metric_settings";
import { makePaSerializeConfig, makeDutyRootSerializeConfig } from "app/finance/_settings/common_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import { deserializeDatasetSettings } from "app/finance/_settings/common_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeSchoolFilterConfig } from "app/finance/_filteritems/school";
import { makeDefaultSettings, serializeFilters } from "app/finance/_settings/common_settings";
import { useSearchParams } from 'next/navigation';
import StaffingDashboard from "./StaffingDashboard";

import type { MetricSettings } from "app/finance/_settings/metric_settings";
import type { DutyRootFilters, PAFilters, SchoolFilters } from "utilities/DistrictData";

export type StaffingSettings = MetricSettings & PAFilters & SchoolFilters & DutyRootFilters;

const DEFAULT_STAFF_SETTINGS = DEFAULT_METRIC_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultSettings(v.ccddd)
}));

export const SERIALIZE_STAFFING_SETTINGS_GENERATORS = [
  makePaSerializeConfig,
  makeDutyRootSerializeConfig,
  x => makeSchoolFilterConfig(x.ccddd),
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

