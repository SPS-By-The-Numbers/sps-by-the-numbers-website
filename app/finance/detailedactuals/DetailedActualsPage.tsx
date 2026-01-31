"use client";

import { DEFAULT_METRIC_SETTINGS, serializeMetricSettings, deserializeMetricSettings, } from "app/finance/_settings/metric_settings";
import { DEFAULT_PAO_FILTERS, serializePAOFilters, deserializePAOFilters, } from "app/finance/_settings/pao_settings";
import { DUMMY_BASE_SETTINGS, deserializeSettings } from "app/finance/_settings/base_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { serializeSchoolFilters, deserializeSchoolFilters, } from "app/finance/_settings/school_settings";
import { useSearchParams } from 'next/navigation';
import DetailedActualsDashboard from "./DetailedActualsDashboard";

import type { MetricSettings } from "app/finance/_settings/metric_settings";
import type { PAOFilters, SchoolFilters } from "utilities/DistrictData";

export type DetailedActualsSettings = MetricSettings & PAOFilters & SchoolFilters;

const DEFAULT_DETAILED_ACTUALS_SETTINGS = DEFAULT_METRIC_SETTINGS.map((v) => ({
  ...v,
  ...DEFAULT_PAO_FILTERS,
  schoolCodes: makeSchoolFilter(v.ccddd).allCodes(),
}));

export function deserializeDetailedActualsSettings(
  defaultSettings,
  serialized: string,
) : DetailedActualsSettings {
  const metricSettings = deserializeMetricSettings(defaultSettings, serialized);
  const paoSettings = deserializePAOFilters(defaultSettings, serialized);
  const schoolSettings = deserializeSchoolFilters(metricSettings.ccddd, serialized);

  return {
    ...metricSettings,
    ...paoSettings,
    ...schoolSettings
  };
}

export function serializeDetailedActualsSettings(settings : DetailedActualsSettings) : string {
  return [
    serializeMetricSettings(settings),
    serializePAOFilters(settings),
    serializeSchoolFilters(settings.ccddd, settings),
  ].join('~');
}

export default function DetailedActualsPage() {
  const searchParams = useSearchParams();
  const allSettings = deserializeSettings(
    searchParams.getAll('d'),
    DEFAULT_DETAILED_ACTUALS_SETTINGS,
    deserializeDetailedActualsSettings);
  return (
    <EnsureDistrictData
      allSettings={allSettings}
      sharedSettings={DUMMY_BASE_SETTINGS}
      ContentComponent={DetailedActualsDashboard}
    />
  );
}

