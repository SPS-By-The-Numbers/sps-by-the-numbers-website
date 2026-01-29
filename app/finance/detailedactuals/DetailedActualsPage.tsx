"use client";

import { ALL_OBJECT_ITEMS, ALL_ACTIVITY_ITEMS, ALL_PROGRAM_ITEMS, } from "app/finance/_widgets/ExpenditureFilterContents";
import { DEFAULT_METRIC_SETTINGS, serializeOneMetricSettings, deserializeOneMetricSettings, } from "app/finance/_settings/metric_settings";
import { DEFAULT_PAO_FILTERS, serializePAOFilters, deserializePAOFilters, } from "app/finance/_settings/pao_settings";
import { deserializeSettings } from "app/finance/_settings/base_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeSchoolItems } from "app/finance/_widgets/ExpenditureFilterContents";
import { Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import DetailedActualsDashboard from "./DetailedActualsDashboard";

import type { MetricSettings } from "app/finance/_settings/metric_settings";
import type { PAOFilters } from "utilities/DistrictData";

export type DetailedActualsSettings = MetricSettings & PAOFilters & {
  selectedSchools: string[];
}

const DEFAULT_DETAILED_ACTUALS_SETTINGS = DEFAULT_METRIC_SETTINGS.map((v) => ({
  ...v,
  ...DEFAULT_PAO_FILTERS,
  selectedSchools: makeSchoolItems(v.ccddd),
}));

export function deserializeDetailedActualsSettings(
  defaultSettings,
  serialized: string,
) {
  const metricSettings = deserializeOneMetricSettings(defaultSettings, serialized);
  const paoSettings = deserializePAOFilters(defaultSettings, serialized);

  return {
    ...metricSettings,
    ...paoSettings
  };
}

export function serializeDetailedActualsDatasetSettings(allSettings : DetailedActualsSettings) : string {
  return "";
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

