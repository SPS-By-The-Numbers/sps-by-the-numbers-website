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

// When on, force diploma_year as an extra series dim regardless of
// breakdown selection — overlays cohort lines on top of any breakdown.
// Each cohort series plots its enrollment per fiscal year for the
// ~13 years that cohort was in K–12.
function makeEnrollmentCohortLinesSerializeConfig(context?): SettingsConfig {
  return [
    [
      "cohortLines", {
        serializerType: "custom",
        urlVar: "ecl",
        serialize: (settings, key) => settings[key] ? "1" : "0",
        deserialize: (settings, s) => s === "1",
      },
    ]
  ];
}

// When on, every series is re-anchored to start at (X=0, Y=0). The
// chart's Y becomes the delta from each series's first non-null point,
// and X becomes years-since-start. Useful for comparing cohort trends
// or any group whose lines start at different fiscal years.
function makeEnrollmentDeltaModeSerializeConfig(context?): SettingsConfig {
  return [
    [
      "deltaMode", {
        serializerType: "custom",
        urlVar: "edm",
        serialize: (settings, key) => settings[key] ? "1" : "0",
        deserialize: (settings, s) => s === "1",
      },
    ]
  ];
}

// Bounds for the class_of range slider. Wider than the actual data so
// users can dial the range in either direction; rows outside the picked
// range are dropped before pivot, faceting, or delta rebase.
export const ENROLLMENT_CLASS_OF_MIN = 2010;
export const ENROLLMENT_CLASS_OF_MAX = 2030;

function makeEnrollmentClassOfRangeSerializeConfig(context?): SettingsConfig {
  return [
    [
      "classOfMin", {
        serializerType: "custom",
        urlVar: "ecmn",
        serialize: (settings, key) => String(settings[key]),
        deserialize: (settings, s) => {
          const n = Number(s);
          return Number.isFinite(n) ? n : ENROLLMENT_CLASS_OF_MIN;
        },
      },
    ], [
      "classOfMax", {
        serializerType: "custom",
        urlVar: "ecmx",
        serialize: (settings, key) => String(settings[key]),
        deserialize: (settings, s) => {
          const n = Number(s);
          return Number.isFinite(n) ? n : ENROLLMENT_CLASS_OF_MAX;
        },
      },
    ]
  ];
}

// Breakdown picks the series dimension within each facet's chart.
// Independent from the facet itself — e.g. facet by School, with
// breakdown Grade Cohort to get one line per cohort. "Summed"
// produces a single-series chart where each facet just shows its
// aggregated metric. Cohort identity is exposed via the Cohort Lines
// toggle, not as a breakdown.
export const ENROLLMENT_BREAKDOWN_OPTIONS = {
  none: "Summed",
  grade: "Grade",
  grade_cohort: "Grade Cohort",
} as const;

export type EnrollmentBreakdown = keyof typeof ENROLLMENT_BREAKDOWN_OPTIONS;

const BREAKDOWN_SERIALIZE_MAP: Record<EnrollmentBreakdown, string> = {
  none: "0",
  grade: "1",
  grade_cohort: "2",
};
const BREAKDOWN_DESERIALIZE_MAP = Object.fromEntries(
  Object.entries(BREAKDOWN_SERIALIZE_MAP).map(([k, v]) => [v, k]),
) as Record<string, EnrollmentBreakdown>;

export function serializeEnrollmentBreakdown(b: EnrollmentBreakdown): string {
  return BREAKDOWN_SERIALIZE_MAP[b] ?? "2";
}

export function deserializeEnrollmentBreakdown(s: string): EnrollmentBreakdown {
  return BREAKDOWN_DESERIALIZE_MAP[s] ?? "grade_cohort";
}

function makeEnrollmentBreakdownSerializeConfig(context?): SettingsConfig {
  return [
    [
      "breakdown", {
        serializerType: "custom",
        urlVar: "ebd",
        serialize: (settings, key) => serializeEnrollmentBreakdown(settings[key]),
          deserialize: (settings, s) => deserializeEnrollmentBreakdown(s),
      },
    ]
  ];
}

// codeColumn name on the enrollment frame for each breakdown choice.
// "none" maps to null so the dashboard skips per-series splitting.
export const ENROLLMENT_BREAKDOWN_CODE_COLUMNS: Record<EnrollmentBreakdown, string | null> = {
  none: null,
  grade: "grade_level_code",
  grade_cohort: "grade_cohort_code",
};

// Display-label column for each breakdown choice (used in chart legends).
export const ENROLLMENT_BREAKDOWN_LABEL_COLUMNS: Record<EnrollmentBreakdown, string | null> = {
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
  breakdown: EnrollmentBreakdown;
  cohortLines: boolean;
  deltaMode: boolean;
  classOfMin: number;
  classOfMax: number;
};

const DEFAULT_DASHBOARD_SETTINGS : EnrollmentContextSettings = {
  ...DEFAULT_COMMON_FACET_CONTEXT_SETTINGS,
  sortType: "latest" as const,
  facet: "ms_assignment" as const,
  breakdown: "grade_cohort",
  cohortLines: false,
  deltaMode: false,
  classOfMin: ENROLLMENT_CLASS_OF_MIN,
  classOfMax: ENROLLMENT_CLASS_OF_MAX,
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
  CommonContextSettingsAll.makeShowLegendSerializeConfig,
  makeEnrollmentBreakdownSerializeConfig,
  makeEnrollmentCohortLinesSerializeConfig,
  makeEnrollmentDeltaModeSerializeConfig,
  makeEnrollmentClassOfRangeSerializeConfig,
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

