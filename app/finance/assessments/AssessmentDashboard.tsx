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
import AssessmentDatasetSettingsContents from "app/finance/assessments/AssessmentDatasetSettingsContents";
import CovidYearsContents from "app/finance/assessments/CovidYearsContents";
import HcDashboard from "components/HcDashboard";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";
import { SERIALIZE_ASSESSMENTS_SETTINGS_GENERATORS, SERIALIZE_ASSESSMENTS_CONTEXT_SETTINGS_GENERATORS } from "app/finance/assessments/AssessmentPage";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import SchoolGroupingContents from "app/finance/_widgets/SchoolGroupingContents";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import YScaleContents from "app/finance/_widgets/YScaleContents";

import { makeSchoolFilter } from "app/finance/_filteritems/school";

import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { AssessmentSettings, AssessmentContextSettings } from "app/finance/assessments/AssessmentPage";

const CONNECTOR_ID = "default-connector";
const METRIC_NAME = "pct_met_standard_withdat";

const ALL_FACETS = ["school", "test_subject", "grade_level", "test_administration", "student_group"] as const;
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  school: "School",
  test_subject: "Test Subject",
  grade_level: "Grade Level",
  test_administration: "Assessment Type",
  student_group: "Student Group",
};

const FACET_SERIALIZE_MAP: Record<Facet, string> = {
  school: "0",
  test_subject: "1",
  grade_level: "2",
  test_administration: "3",
  student_group: "4",
};
const FACET_DESERIALIZE_MAP = Object.fromEntries(
  Object.entries(FACET_SERIALIZE_MAP).map(([k, v]) => [v, k])
) as Record<string, Facet>;

export function serializeFacet(facet: Facet): string {
  return FACET_SERIALIZE_MAP[facet] ?? "0";
}

export function deserializeFacet(s: string): Facet {
  return FACET_DESERIALIZE_MAP[s] ?? "school";
}

// All assessment dimension definitions. The facet picks one of these as the
// chart-per-value dimension; the rest become series within each chart.
type DimensionDef = {
  facetName: Facet;
  codeColumn: string;
  lookup: Map<number, string>;
};

const DIMENSIONS: Array<DimensionDef> = [
  { facetName: "school", codeColumn: "school_code", lookup: new Map() },  // school names come from data, not a static domain
  { facetName: "test_subject", codeColumn: "test_subject_code", lookup: new Map(ALL_TEST_SUBJECTS.map(t => [t.test_subject_code, t.test_subject])) },
  { facetName: "grade_level", codeColumn: "grade_level_code", lookup: new Map(ALL_GRADE_LEVELS.map(g => [g.grade_level_code, g.grade_level])) },
  { facetName: "test_administration", codeColumn: "test_administration_code", lookup: new Map(ALL_ASSESSMENT_TYPES.map(t => [t.test_administration_code, t.test_administration])) },
  { facetName: "student_group", codeColumn: "student_group_code", lookup: new Map(ALL_STUDENT_GROUPS.map(g => [g.student_group_code, g.student_group])) },
];

function getSeriesDimensions(facet: Facet): Array<DimensionDef> {
  return DIMENSIONS.filter(d => d.facetName !== facet);
}

function extractSeriesDefsByFacet(filtered, facet: Facet): Map<string, Array<SeriesCodeDef>> {
  const facetDim = DIMENSIONS.find(d => d.facetName === facet)!;
  const seriesDims = getSeriesDimensions(facet);
  const facetArray = filtered.array(facetDim.codeColumn) as number[];
  const seriesArrays = seriesDims.map(d => filtered.array(d.codeColumn) as number[]);

  const result = new Map<string, Array<SeriesCodeDef>>();
  const seenByFacet = new Map<string, Set<string>>();
  for (let i = 0; i < filtered.numRows(); i++) {
    const facetCode = String(facetArray[i]);
    const codes = seriesArrays.map(a => a[i]);
    const key = codes.join("_");
    let seen = seenByFacet.get(facetCode);
    if (!seen) {
      seen = new Set();
      seenByFacet.set(facetCode, seen);
      result.set(facetCode, []);
    }
    if (!seen.has(key)) {
      seen.add(key);
      const nameParts = seriesDims.map((dim, j) =>
        dim.lookup.get(codes[j]) ?? codes[j].toString()
      );
      result.get(facetCode)!.push({ key, name: nameParts.join(" / ") });
    }
  }
  return result;
}

function makeComponentsGenerator(seriesDefsByFacet: Map<string, Array<SeriesCodeDef>>) {
  return function componentsGenerator(facetOrder,
                             contextSettings :AssessmentContextSettings,
                             settings: AssessmentSettings,
                             yBounds) {
    const schoolFilter = makeSchoolFilter(settings.ccddd, contextSettings.schoolGrouping);
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
      yValueFormatOverride: "pctexp",
      chartConfigMaker: (options) => makeMultiSeriesLineChartConfig({
        ...options,
        yLabel: "% Met Standard",
        seriesDefs: seriesDefsByFacet.get(String(options.facet)) ?? [],
      }),
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
    // Extract unique series definitions from the filtered data,
    // excluding the facet dimension (which becomes one chart per value).
    const firstSettings = allSettings[0];
    const districtData = districtDataMap[firstSettings.ccddd];

    // 2020 and 2021 were the COVID-disrupted assessment years.
    const excludeCovid = contextSettings.covidYears === "exclude";
    function filteredAssessmentMaybeNoCovid(this: DistrictData, s: AssessmentSettings) {
      const result = this.filteredAssessment(s);
      return excludeCovid
        ? result.filter(d => d.class_of !== 2020 && d.class_of !== 2021)
        : result;
    }

    const filtered = filteredAssessmentMaybeNoCovid.call(districtData, firstSettings);
    const seriesDefsByFacet = extractSeriesDefsByFacet(filtered, contextSettings.facet);

    // Expand out the filter per sub-setting.
    const { data, fullFacetOrder } = extractFacets(
      districtDataMap,
      allSettings,
      contextSettings.facet,
      contextSettings.sortType,
      contextSettings.sortOrder,
      filteredAssessmentMaybeNoCovid,
      toFacetedCharatbleAssessmentDataset,
      METRIC_NAME,
    );

    // Drop facets whose data columns are entirely null/NaN — otherwise
    // they render as empty charts and break fixed-scale y-axis bounds.
    const facetsWithData = fullFacetOrder.filter(f =>
      allSettings.some(s => {
        const prefix = `${s.id}_${s.currencyNormalization}_${METRIC_NAME}_${f.code}_`;
        const cols = data.columnNames().filter(c =>
          c.startsWith(prefix) && c.endsWith("_actuals"),
        );
        return cols.some(c =>
          (data.array(c) as Array<number | null>).some(v =>
            v !== null && v !== undefined && !Number.isNaN(v),
          ),
        );
      }),
    );

    return makeHighchartConfig(
      {
        connectorId: CONNECTOR_ID,
        metricName: METRIC_NAME,
        contextSettings,
        allSettings,
        fullFacetOrder: facetsWithData,
        componentsGenerator: makeComponentsGenerator(seriesDefsByFacet),
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
        SchoolGroupingContents,
        CovidYearsContents,
      ]}
      settingsContentsComponents={[
        AssessmentDatasetSettingsContents,
        SchoolFilterContents,
        GradeLevelFilterContents,
        AssessmentTypeFilterContents,
        StudentGroupFilterContents,
        TestSubjectFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        % Meeting Standard for Assessment
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
