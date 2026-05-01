"use client";

import { DEFAULT_COMMON_FACET_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeDefaultSettings } from "app/finance/_settings/common_settings";
import { serializeFacet, deserializeFacet } from "./EnrollmentDashboard";
import * as CommonContextSettingsAll from "app/finance/_settings/common_context_settings";
import * as CommonSettings from "app/finance/_settings/common_settings";
import EnrollmentGradeLevelFilter from "app/finance/_filteritems/enrollment_grade_level";
import EnrollmentDashboard from "./EnrollmentDashboard";

import type { SettingsConfig } from "app/finance/_settings/base_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { Facet } from "./EnrollmentDashboard";
import type { CommonFacetContextSettings } from "app/finance/_settings/common_context_settings";
import type { SchoolFilters, GradeLevelFilters } from "utilities/DistrictData";

// rc_enrollment columns we expose as selectable counts. The key is the
// BigQuery column name (also used as the chart's metric name); the
// value is the user-visible label. Order shapes the dropdown UI.
export const ENROLLMENT_STUDENT_GROUP_OPTIONS: Record<string, string> = {
  all_students: "All Students",
  female: "Female",
  male: "Male",
  gender_x: "Gender X",
  american_indian_alaskan_native: "American Indian / Alaskan Native",
  asian: "Asian",
  black_african_american: "Black / African American",
  hispanic_latino_of_any_race: "Hispanic / Latino of any race",
  native_hawaiian_other_pacific: "Native Hawaiian / Other Pacific Islander",
  two_or_more_races: "Two or More Races",
  white: "White",
  english_language_learners: "English Language Learners",
  students_with_disabilities: "Students With Disabilities",
  section_504: "Section 504",
  highly_capable: "Highly Capable",
  low_income: "Low Income",
  homeless: "Homeless",
  foster_care: "Foster Care",
  migrant: "Migrant",
  military_parent: "Military Parent",
  mobile: "Mobile",
};

export type EnrollmentStudentGroup = keyof typeof ENROLLMENT_STUDENT_GROUP_OPTIONS;

const ENROLLMENT_STUDENT_GROUP_KEYS = Object.keys(ENROLLMENT_STUDENT_GROUP_OPTIONS);

export function serializeEnrollmentStudentGroup(g: EnrollmentStudentGroup): string {
  // Use the column name itself as the URL fragment — readable URLs and
  // stable across reorderings of the options map.
  return g as string;
}

export function deserializeEnrollmentStudentGroup(s: string): EnrollmentStudentGroup {
  return (ENROLLMENT_STUDENT_GROUP_KEYS.includes(s) ? s : "all_students") as EnrollmentStudentGroup;
}

function makeEnrollmentStudentGroupSerializeConfig(context?): SettingsConfig {
  return [
    [
      "studentGroup", {
        serializerType: "custom",
        urlVar: "esg",
        serialize: (settings, key) => serializeEnrollmentStudentGroup(settings[key]),
          deserialize: (settings, s) => deserializeEnrollmentStudentGroup(s),
      },
    ]
  ];
}

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

export type EnrollmentSettings = DatasetSettings & SchoolFilters & GradeLevelFilters;

const DEFAULT_DETAILED_ACTUALS_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultSettings(v.ccddd),
  gradeLevelCodes: new Set<number>(EnrollmentGradeLevelFilter.allCodes()),
}));

export type EnrollmentContextSettings = CommonFacetContextSettings<Facet> & {
  studentGroup: EnrollmentStudentGroup;
};

const DEFAULT_DASHBOARD_SETTINGS : EnrollmentContextSettings = {
  ...DEFAULT_COMMON_FACET_CONTEXT_SETTINGS,
  sortType: "latest" as const,
  facet: deserializeFacet(""),
  studentGroup: "all_students",
};

export const SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS = [
  CommonSettings.makeDatasetSerializeConfig,
  CommonSettings.makeSchoolFilterConfig,
  makeEnrollmentGradeLevelSerializeConfig,
];

export const SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS = [
  CommonContextSettingsAll.makeFacetSerializeConfigHelper<Facet>(serializeFacet, deserializeFacet),
  CommonContextSettingsAll.makeSortOrderSerializeConfig,
  CommonContextSettingsAll.makeSortOrderSerializeConfig,
  CommonContextSettingsAll.makeYScaleSerializeConfig,
  CommonContextSettingsAll.makeSchoolGroupingSerializeConfig,
  CommonContextSettingsAll.makeChartsEnabledSerializeConfig,
  makeEnrollmentStudentGroupSerializeConfig,
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

