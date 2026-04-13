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
import type { SortOrder, SortType, YScale, FacetLimit } from "utilities/ChartOptions";
import type { SchoolFilters, GradeLevelFilters, TestAdministrationFilters, StudentGroupFilters, TestSubjectFilters } from "utilities/DistrictData";

export type AssessmentSettings = DatasetSettings & SchoolFilters & GradeLevelFilters & TestAdministrationFilters & StudentGroupFilters & TestSubjectFilters;

const DEFAULT_ASSESSMENTS_SETTINGS = DEFAULT_DATASET_SETTINGS.map((v) => ({
  ...v,
  ...makeDefaultDatasetSettings(v.ccddd),
  schoolCodes: makeSchoolFilter(v.ccddd).allCodes(),
  ...CommonSettings.makeDefaultAssessmentFilterSettings(),
}));

export type AssessmentContextSettings = CommonFacetContextSettings<Facet>;

const DEFAULT_DASHBOARD_SETTINGS : AssessmentContextSettings = {
  ...DEFAULT_COMMON_FACET_CONTEXT_SETTINGS,
  sortType: "latest" as const,
  facet: deserializeFacet(""),
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

