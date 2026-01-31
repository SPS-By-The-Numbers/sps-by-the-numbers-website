"use client";

import { DEFAULT_DUTY_FILTERS, serializeDutyFilters, deserializeDutyFilters } from "app/finance/_settings/duty_root_settings";
import { DEFAULT_METRIC_SETTINGS, serializeOneMetricSettings, deserializeOneMetricSettings } from "app/finance/_settings/metric_settings";
import { DEFAULT_PA_FILTERS, serializePAFilters, deserializePAFilters } from "app/finance/_settings/pao_settings";
import { DUMMY_BASE_SETTINGS, deserializeSettings } from "app/finance/_settings/base_settings";
import { serializeSchoolFilters, deserializeSchoolFilters } from "app/finance/_settings/school_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { useSearchParams } from 'next/navigation';
import StaffingDashboard from "./StaffingDashboard";

import type { MetricSettings } from "app/finance/_settings/metric_settings";
import type { DutyFilters, PAFilters, SchoolFilters } from "utilities/DistrictData";

export type StaffingSettings = MetricSettings & PAFilters & SchoolFilters & DutyFilters;

const DEFAULT_STAFF_SETTINGS = DEFAULT_METRIC_SETTINGS.map((v) => ({
  ...v,
  ...DEFAULT_PA_FILTERS,
  ...DEFAULT_DUTY_FILTERS,
  schoolCodes: makeSchoolFilter(v.ccddd).allCodes(),
}));

export function deserializeStaffingSettings(
  defaultSettings,
  serialized: string,
) : StaffingSettings {
  const metricSettings = deserializeOneMetricSettings(defaultSettings, serialized);
  const paSettings = deserializePAFilters({}, serialized);
  const schoolSettings = deserializeSchoolFilters(metricSettings.ccddd, serialized);
  const dutySettings = deserializeDutyFilters(defaultSettings, serialized);

  return {
    ...metricSettings,
    ...paSettings,
    ...schoolSettings,
    ...dutySettings,
  };
}

export function serializeStaffingSettings(settings : StaffingSettings) : string {
  return [
    serializeOneMetricSettings(settings),
    serializePAFilters(settings),
    serializeSchoolFilters(settings.ccddd, settings),
    serializeDutyFilters(settings),
  ].join('~');
}

export default function StaffingPage() {
  const searchParams = useSearchParams();
  const allSettings = deserializeSettings(
    searchParams.getAll('d'),
    DEFAULT_STAFF_SETTINGS,
    deserializeStaffingSettings);
  console.log(allSettings);
  return (
    <EnsureDistrictData
      allSettings={allSettings}
      sharedSettings={DUMMY_BASE_SETTINGS}
      ContentComponent={StaffingDashboard}
    />
  );
}

