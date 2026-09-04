"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import * as CommonContextSettingsAll from "app/finance/_settings/common_context_settings";
import { DEFAULT_COMMON_FACET_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultSettings } from "app/finance/_settings/common_settings";
import StaffingDashboard from "./StaffingDashboard";

import type { CommonFacetContextSettings } from "app/finance/_settings/common_context_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type {
  DutyRootFilters,
  EmploymentClassFilters,
  PAFilters,
  SchoolFilters,
} from "utilities/DistrictData";
import { METRICS_DATASETS } from "utilities/ChartableMetrics";
import { VITALS_DATASETS } from "utilities/ChartableVitals";

export type StaffingSettings = DatasetSettings &
  PAFilters &
  SchoolFilters &
  DutyRootFilters &
  EmploymentClassFilters;
export type StaffingContextSettings = CommonFacetContextSettings<Facet>;

const ALL_FACETS = [
  "activity",
  "program",
  "school",
  "duty_root",
  "staff_category",
] as const;
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  activity: "Activity",
  program: "Program",
  school: "School",
  duty_root: "Duty Root",
  staff_category: "Staff Category",
};

export function serializeFacet(facet: Facet): string {
  switch (facet) {
    case "activity":
      return "0";

    case "program":
      return "1";

    case "school":
      return "2";

    case "duty_root":
      return "3";

    case "staff_category":
      return "4";
  }

  return "0";
}

export function deserializeFacet(s: string): Facet {
  switch (s) {
    case "0":
      return "activity";

    case "1":
      return "program";

    case "2":
      return "school";

    case "3":
      return "duty_root";

    case "4":
      return "staff_category";
  }

  return "duty_root";
}

const DEFAULT_STAFF_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultSettings(v.ccddd),
}));

export const SERIALIZE_STAFFING_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makePaSerializeConfig,
  CommonSettings.makeDutyRootSerializeConfig,
  CommonSettings.makeEmploymentClassSerializeConfig,
  CommonSettings.makeSchoolFilterConfig,
];

export const SERIALIZE_STAFFING_CONTEXT_SETTINGS_GENERATORS = [
  ...CommonContextSettingsAll.COMMON_FACET_CONTEXT_SETTINGS_GENERATORS,
  CommonContextSettingsAll.makeFacetSerializeConfigHelper<Facet>(
    serializeFacet,
    deserializeFacet,
  ),
  CommonContextSettingsAll.makeSchoolGroupingSerializeConfig,
];

const DEFAULT_CONTEXT_SETTINGS: StaffingContextSettings = {
  ...DEFAULT_COMMON_FACET_CONTEXT_SETTINGS,
  facet: deserializeFacet(""),
  sortType: "latest" as const,
};

export default function StaffingPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_STAFF_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_STAFFING_SETTINGS_GENERATORS}
      defaultContextSettings={DEFAULT_CONTEXT_SETTINGS}
      contextSettingsConfigGenerators={
        SERIALIZE_STAFFING_CONTEXT_SETTINGS_GENERATORS
      }
      ContentComponent={StaffingDashboard}
      datasets={[...METRICS_DATASETS, ...VITALS_DATASETS]}
    />
  );
}
