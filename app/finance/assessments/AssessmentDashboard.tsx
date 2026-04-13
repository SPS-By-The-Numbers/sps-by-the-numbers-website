"use client";

import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { useMemo } from "react";
import { makeHighchartConfig } from "utilities/highcharts/utils";
import {
  toFacetedCharatbleAssessmentDataset,
} from "utilities/ChartableMetrics";
import { extractFacets } from "utilities/ChartableVitals";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
import { makeMultiSeriesLineChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import ALL_ASSESSMENT_TYPES from "utilities/domain/assessment_types";
import ALL_GRADE_LEVELS from "utilities/domain/grade_levels";
import ALL_STUDENT_GROUPS from "utilities/domain/student_groups";
import ALL_TEST_SUBJECTS from "utilities/domain/test_subjects";

import type { SeriesCodeDef } from "utilities/highcharts/ChartConfigGenerators";
import {
  SchoolFilterContents,
  GradeLevelFilterContents,
  AssessmentTypeFilterContents,
  StudentGroupFilterContents,
  TestSubjectFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import DistrictData from "utilities/DistrictData";
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import HcDashboard from "components/HcDashboard";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";
import { SERIALIZE_ASSESSMENTS_SETTINGS_GENERATORS, SERIALIZE_ASSESSMENTS_CONTEXT_SETTINGS_GENERATORS } from "app/finance/assessments/AssessmentPage";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import YScaleContents from "app/finance/_widgets/YScaleContents";

import { makeSchoolFilter } from "app/finance/_filteritems/school";

import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { AssessmentSettings, AssessmentContextSettings } from "app/finance/assessments/AssessmentPage";

const CONNECTOR_ID = "default-connector";
const METRIC_NAME = "pct_met_standard";

const ALL_FACETS = ["school"];
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  school: "School",
};

export function serializeFacet(facet: Facet): string {
  switch (facet) {
    case "school":
      return "0";
  }

  return "0";
}

export function deserializeFacet(s: string): Facet {
  switch (s) {
    case "0":
      return "school";
  }

  return "school";
}

// Domain lookups for translating codes to display names.
const testSubjectLookup = new Map(ALL_TEST_SUBJECTS.map(t => [t.test_subject_code, t.test_subject]));
const gradeLevelLookup = new Map(ALL_GRADE_LEVELS.map(g => [g.grade_level_code, g.grade_level]));
const assessmentTypeLookup = new Map(ALL_ASSESSMENT_TYPES.map(t => [t.test_administration_code, t.test_administration]));
const studentGroupLookup = new Map(ALL_STUDENT_GROUPS.map(g => [g.student_group_code, g.student_group]));

type SeriesTuple = {
  testSubjectCode: number;
  gradeLevelCode: number;
  testAdministrationCode: number;
  studentGroupCode: number;
};

function tupleToSeriesDef(t: SeriesTuple): SeriesCodeDef {
  const key = `${t.testSubjectCode}_${t.gradeLevelCode}_${t.testAdministrationCode}_${t.studentGroupCode}`;
  const parts = [
    testSubjectLookup.get(t.testSubjectCode),
    gradeLevelLookup.get(t.gradeLevelCode),
    assessmentTypeLookup.get(t.testAdministrationCode),
    studentGroupLookup.get(t.studentGroupCode),
  ].filter(Boolean);
  return { key, name: parts.join(" / ") };
}

function makeComponentsGenerator(seriesDefs: Array<SeriesCodeDef>) {
  return function componentsGenerator(facetOrder,
                             contextSettings :AssessmentContextSettings,
                             settings: AssessmentSettings,
                             yBounds) {
    const schoolFilter = makeSchoolFilter(settings.ccddd);
    const subtitle = `
    School(${schoolFilter.toSummaryText(settings.schoolCodes)})
    `;
    const components = makeFacetComponents({
      idPrefix: settings.id.toString(),
      xColumn: "class_of",
      xLabel: "Fiscal Year End",
      yColumnRoot: METRIC_NAME,
      facetOrder,
      connectorId: CONNECTOR_ID,
      normalizations: [settings.currencyNormalization],
      captionType: "none",
      subtitle,
      yBounds,
      yValueFormatOverride: "decimal",
      chartConfigMaker: (options) => makeMultiSeriesLineChartConfig({...options, seriesDefs}),
    });

    return components;
  };
}

// Charts expenditures for
export default function AssessmentDashboard({
  districtDataMap,
  allSettings,
  contextSettings,
}: DistrictDataContentProps<AssessmentSettings, AssessmentContextSettings>) {
  const config = useMemo(() => {
    // Extract unique series tuples from the filtered data.
    const firstSettings = allSettings[0];
    const districtData = districtDataMap[firstSettings.ccddd];
    const filtered = districtData.filteredAssessment(firstSettings);

    const tupleSet = new Set<string>();
    const seriesTuples: Array<SeriesTuple> = [];
    const tsArr = filtered.array("test_subject_code") as number[];
    const glArr = filtered.array("grade_level_code") as number[];
    const taArr = filtered.array("test_administration_code") as number[];
    const sgArr = filtered.array("student_group_code") as number[];
    for (let i = 0; i < filtered.numRows(); i++) {
      const key = `${tsArr[i]}_${glArr[i]}_${taArr[i]}_${sgArr[i]}`;
      if (!tupleSet.has(key)) {
        tupleSet.add(key);
        seriesTuples.push({
          testSubjectCode: tsArr[i],
          gradeLevelCode: glArr[i],
          testAdministrationCode: taArr[i],
          studentGroupCode: sgArr[i],
        });
      }
    }
    const seriesDefs = seriesTuples.map(tupleToSeriesDef);

    // Expand out the filter per sub-setting.
    const { data, fullFacetOrder } = extractFacets(
      districtDataMap,
      allSettings,
      contextSettings.facet,
      contextSettings.sortType,
      contextSettings.sortOrder,
      DistrictData.prototype.filteredAssessment,
      toFacetedCharatbleAssessmentDataset,
      METRIC_NAME,
    );

    return makeHighchartConfig(
      {
        connectorId: CONNECTOR_ID,
        metricName: METRIC_NAME,
        contextSettings,
        allSettings,
        fullFacetOrder,
        componentsGenerator: makeComponentsGenerator(seriesDefs),
        data,
      }
    );
  }, [contextSettings, districtDataMap, allSettings]);

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: newAllSettings => serializeDatasetSettings(newAllSettings, SERIALIZE_ASSESSMENTS_SETTINGS_GENERATORS),
          serializeContext: context => serializeOneSetting(context, SERIALIZE_ASSESSMENTS_CONTEXT_SETTINGS_GENERATORS),
      }}
      allSettings={allSettings}
      contextSettings={contextSettings}
      contextSettingsComponents={[
        makeFacetContents(FACET_OPTIONS),
        SortOrderContents,
        YScaleContents,
      ]}
      settingsContentsComponents={[
        DatasetSettingsContents,
        SchoolFilterContents,
        GradeLevelFilterContents,
        AssessmentTypeFilterContents,
        StudentGroupFilterContents,
        TestSubjectFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Assessment Data.
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
