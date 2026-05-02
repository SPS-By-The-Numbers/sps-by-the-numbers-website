"use client";

import { DEFAULT_COMMON_FACET_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultSettings } from "app/finance/_settings/common_settings";
import { serializeFacet, deserializeFacet } from "./EnrollmentDashboard";
import * as CommonContextSettingsAll from "app/finance/_settings/common_context_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import EnrollmentGradeLevelFilter from "app/finance/_filteritems/enrollment_grade_level";
import EnrollmentStudentGroupFilter from "app/finance/_filteritems/enrollment_datasets";
import EnrollmentDashboard from "./EnrollmentDashboard";

import type { SettingsConfig } from "app/finance/_settings/base_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { Facet } from "./EnrollmentDashboard";
import type { CommonFacetContextSettings } from "app/finance/_settings/common_context_settings";
import type { SchoolFilters, GradeLevelFilters, StudentGroupFilters } from "utilities/DistrictData";

// Mode picks the series dimension within each facet's chart.
// Independent from the facet itself — e.g. facet by School, with mode
// Grade Cohort to get one line per cohort. "Summed" produces a
// single-series chart where each facet just shows its aggregated
// metric.
export const ENROLLMENT_MODE_OPTIONS = {
  none: "Summed",
  grade: "Grade",
  grade_cohort: "Grade Cohort",
} as const;

export type EnrollmentMode = keyof typeof ENROLLMENT_MODE_OPTIONS;

const MODE_SERIALIZE_MAP: Record<EnrollmentMode, string> = {
  none: "0",
  grade: "1",
  grade_cohort: "2",
};
const MODE_DESERIALIZE_MAP = Object.fromEntries(
  Object.entries(MODE_SERIALIZE_MAP).map(([k, v]) => [v, k]),
) as Record<string, EnrollmentMode>;

export function serializeEnrollmentMode(m: EnrollmentMode): string {
  return MODE_SERIALIZE_MAP[m] ?? "2";
}

export function deserializeEnrollmentMode(s: string): EnrollmentMode {
  return MODE_DESERIALIZE_MAP[s] ?? "grade_cohort";
}

function makeEnrollmentModeSerializeConfig(context?): SettingsConfig {
  return [
    [
      "mode", {
        serializerType: "custom",
        urlVar: "em",
        serialize: (settings, key) => serializeEnrollmentMode(settings[key]),
          deserialize: (settings, s) => deserializeEnrollmentMode(s),
      },
    ]
  ];
}

// codeColumn name on the enrollment frame for each mode choice.
// "none" maps to null so the dashboard skips per-series splitting.
export const ENROLLMENT_MODE_CODE_COLUMNS: Record<EnrollmentMode, string | null> = {
  none: null,
  grade: "grade_level_code",
  grade_cohort: "grade_cohort_code",
};

// Display-label column for each mode choice (used in chart legends).
export const ENROLLMENT_MODE_LABEL_COLUMNS: Record<EnrollmentMode, string | null> = {
  none: null,
  grade: "grade_level",
  grade_cohort: "grade_cohort",
};

function makeEnrollmentGradeLevelSerializeConfig(context?): SettingsConfig {
  return [
    [
      "gradeLevelCodes", {
        serializerType: "filter",
        urlVar: "egl",
        filter: EnrollmentGradeLevelFilter,
      },
    ]
  ];
}

function makeEnrollmentStudentGroupFilterConfig(context?): SettingsConfig {
  return [
    [
      "studentGroupCodes", {
        serializerType: "filter",
        urlVar: "esgf",
        filter: EnrollmentStudentGroupFilter,
      },
    ]
  ];
}

export type EnrollmentSettings = DatasetSettings & SchoolFilters & GradeLevelFilters & StudentGroupFilters;

const DEFAULT_DETAILED_ACTUALS_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultSettings(v.ccddd),
  gradeLevelCodes: new Set<number>(EnrollmentGradeLevelFilter.allCodes()),
  // Default to just All Students so first-load charts are a single
  // headcount line per facet.
  studentGroupCodes: new Set<number>([1]),
}));

export type EnrollmentContextSettings = CommonFacetContextSettings<Facet> & {
  mode: EnrollmentMode;
};

const DEFAULT_DASHBOARD_SETTINGS : EnrollmentContextSettings = {
  ...DEFAULT_COMMON_FACET_CONTEXT_SETTINGS,
  sortType: "latest" as const,
  facet: "ms_assignment" as const,
  mode: "grade_cohort",
};

export const SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makeSchoolFilterConfig,
  makeEnrollmentGradeLevelSerializeConfig,
  makeEnrollmentStudentGroupFilterConfig,
];

export const SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS = [
  CommonContextSettingsAll.makeFacetSerializeConfigHelper<Facet>(serializeFacet, deserializeFacet),
  CommonContextSettingsAll.makeYScaleSerializeConfig,
  CommonContextSettingsAll.makeSchoolGroupingSerializeConfig,
  CommonContextSettingsAll.makeChartsEnabledSerializeConfig,
  makeEnrollmentModeSerializeConfig,
];

export default function EnrollmentPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_DETAILED_ACTUALS_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS}
      defaultContextSettings={DEFAULT_DASHBOARD_SETTINGS}
      contextSettingsConfigGenerators={SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS}
      ContentComponent={EnrollmentDashboard}
    />
  );
}

