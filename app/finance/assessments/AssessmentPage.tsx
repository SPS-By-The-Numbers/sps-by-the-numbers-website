"use client";

import { DEFAULT_COMMON_FACET_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultDatasetSettings, makeDefaultAssessmentFilterSettings } from "app/finance/_settings/common_settings";
import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { serializeFacet, deserializeFacet } from "./AssessmentDashboard";
import * as CommonContextSettingsAll from "app/finance/_settings/common_context_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import AssessmentDashboard from "./AssessmentDashboard";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { Facet } from "./AssessmentDashboard";
import type { CommonFacetContextSettings } from "app/finance/_settings/common_context_settings";
import type { SettingsConfig } from "app/finance/_settings/base_settings";

export const ALL_COVID_YEARS = ["exclude", "include"] as const;
export type CovidYears = (typeof ALL_COVID_YEARS)[number];

export const ALL_DISCLOSURE_AVOIDANCE = ["best_guess", "drop"] as const;
export type DisclosureAvoidance = (typeof ALL_DISCLOSURE_AVOIDANCE)[number];

const DISCLOSURE_AVOIDANCE_SERIALIZE_MAP: Record<DisclosureAvoidance, string> = {
  best_guess: "0",
  drop: "1",
};
const DISCLOSURE_AVOIDANCE_DESERIALIZE_MAP = Object.fromEntries(
  Object.entries(DISCLOSURE_AVOIDANCE_SERIALIZE_MAP).map(([k, v]) => [v, k]),
) as Record<string, DisclosureAvoidance>;

export function serializeDisclosureAvoidance(v: DisclosureAvoidance): string {
  return DISCLOSURE_AVOIDANCE_SERIALIZE_MAP[v] ?? "0";
}

export function deserializeDisclosureAvoidance(s: string): DisclosureAvoidance {
  return DISCLOSURE_AVOIDANCE_DESERIALIZE_MAP[s] ?? "best_guess";
}

// Maps a disclosure-avoidance choice to the BigQuery column the chart
// should source pct_met_standard from.
export const DISCLOSURE_AVOIDANCE_METRIC: Record<DisclosureAvoidance, string> = {
  best_guess: "pct_met_standard_withdat",
  drop: "pct_met_standard_nodat",
};

function makeDisclosureAvoidanceSerializeConfig(context?): SettingsConfig {
  return [
    [
      "disclosureAvoidance", {
        serializerType: "custom",
        urlVar: "da",
        serialize: (settings, key) => serializeDisclosureAvoidance(settings[key]),
          deserialize: (settings, s) => deserializeDisclosureAvoidance(s),
      },
    ]
  ];
}

const COVID_YEARS_SERIALIZE_MAP: Record<CovidYears, string> = {
  exclude: "0",
  include: "1",
};
const COVID_YEARS_DESERIALIZE_MAP = Object.fromEntries(
  Object.entries(COVID_YEARS_SERIALIZE_MAP).map(([k, v]) => [v, k]),
) as Record<string, CovidYears>;

export function serializeCovidYears(v: CovidYears): string {
  return COVID_YEARS_SERIALIZE_MAP[v] ?? "0";
}

export function deserializeCovidYears(s: string): CovidYears {
  return COVID_YEARS_DESERIALIZE_MAP[s] ?? "include";
}

function makeCovidYearsSerializeConfig(context?): SettingsConfig {
  return [
    [
      "covidYears", {
        serializerType: "custom",
        urlVar: "cy",
        serialize: (settings, key) => serializeCovidYears(settings[key]),
          deserialize: (settings, s) => deserializeCovidYears(s),
      },
    ]
  ];
}
import type { SortOrder, SortType, YScale, FacetLimit } from "utilities/ChartOptions";
import type { SchoolFilters, GradeLevelFilters, TestAdministrationFilters, StudentGroupFilters, TestSubjectFilters } from "utilities/DistrictData";

export type AssessmentSettings = DatasetSettings & SchoolFilters & GradeLevelFilters & TestAdministrationFilters & StudentGroupFilters & TestSubjectFilters;

const DEFAULT_ASSESSMENTS_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultDatasetSettings(v.ccddd),
  schoolCodes: makeSchoolFilter(v.ccddd).allCodes(),
  ...CommonSettings.makeDefaultAssessmentFilterSettings(),
}));

export type AssessmentContextSettings = CommonFacetContextSettings<Facet> & {
  covidYears: CovidYears;
  disclosureAvoidance: DisclosureAvoidance;
};

const DEFAULT_DASHBOARD_SETTINGS : AssessmentContextSettings = {
  ...DEFAULT_COMMON_FACET_CONTEXT_SETTINGS,
  sortType: "latest" as const,
  yScale: "fixed" as const,
  facet: "ms_assignment" as const,
  covidYears: "include" as const,
  disclosureAvoidance: "best_guess" as const,
};

export const SERIALIZE_ASSESSMENTS_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makeSchoolFilterConfig,
  CommonSettings.makeGradeLevelSerializeConfig,
  CommonSettings.makeTestAdministrationSerializeConfig,
  CommonSettings.makeStudentGroupSerializeConfig,
  CommonSettings.makeTestSubjectSerializeConfig,
];

export const SERIALIZE_ASSESSMENTS_CONTEXT_SETTINGS_GENERATORS = [
  CommonContextSettingsAll.makeFacetSerializeConfigHelper<Facet>(serializeFacet, deserializeFacet),
  CommonContextSettingsAll.makeSortOrderSerializeConfig,
  CommonContextSettingsAll.makeSortOrderSerializeConfig,
  CommonContextSettingsAll.makeYScaleSerializeConfig,
  CommonContextSettingsAll.makeSchoolGroupingSerializeConfig,
  CommonContextSettingsAll.makeChartsEnabledSerializeConfig,
  makeCovidYearsSerializeConfig,
  makeDisclosureAvoidanceSerializeConfig,
];

export default function AssessmentPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_ASSESSMENTS_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_ASSESSMENTS_SETTINGS_GENERATORS}
      defaultContextSettings={DEFAULT_DASHBOARD_SETTINGS}
      contextSettingsConfigGenerators={SERIALIZE_ASSESSMENTS_CONTEXT_SETTINGS_GENERATORS}
      ContentComponent={AssessmentDashboard}
    />
  );
}

