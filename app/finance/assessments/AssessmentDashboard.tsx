"use client";

import * as aq from "arquero";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { useMemo } from "react";
import { makeHighchartConfig } from "utilities/highcharts/utils";
import ALL_SCHOOLS from "utilities/domain/schools";
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
import ChartsEnabledContents from "app/finance/_widgets/ChartsEnabledContents";
import CovidYearsContents from "app/finance/assessments/CovidYearsContents";
import DisclosureAvoidanceContents from "app/finance/assessments/DisclosureAvoidanceContents";
import HcDashboard from "components/HcDashboard";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";
import {
  DISCLOSURE_AVOIDANCE_METRIC,
  SERIALIZE_ASSESSMENTS_SETTINGS_GENERATORS,
  SERIALIZE_ASSESSMENTS_CONTEXT_SETTINGS_GENERATORS,
} from "app/finance/assessments/AssessmentPage";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import SchoolGroupingContents from "app/finance/_widgets/SchoolGroupingContents";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import YScaleContents from "app/finance/_widgets/YScaleContents";

import { makeSchoolFilter } from "app/finance/_filteritems/school";
import AssessmentTypeFilter from "app/finance/_filteritems/assessment_type";
import GradeLevelFilter from "app/finance/_filteritems/grade_level";
import StudentGroupFilter from "app/finance/_filteritems/student_group";
import TestSubjectFilter from "app/finance/_filteritems/test_subject";

import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { AssessmentSettings, AssessmentContextSettings } from "app/finance/assessments/AssessmentPage";

const CONNECTOR_ID = "default-connector";

const ALL_FACETS = ["school", "test_subject", "grade_level", "test_administration", "student_group", "ms_assignment"] as const;
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  school: "School",
  test_subject: "Test Subject",
  grade_level: "Grade Level",
  test_administration: "Assessment Type",
  student_group: "Student Group",
  ms_assignment: "Middle School Area",
};

const FACET_SERIALIZE_MAP: Record<Facet, string> = {
  school: "0",
  test_subject: "1",
  grade_level: "2",
  test_administration: "3",
  student_group: "4",
  ms_assignment: "5",
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

type DimensionsBundle = {
  // Dimensions that can appear as series within a chart.
  seriesDims: Array<DimensionDef>;
  // Dimensions that can only ever be the chart facet, never a series.
  // (ms_assignment is redundant with school in series since each school
  // belongs to exactly one MS area.)
  facetOnlyDims: Array<DimensionDef>;
};

// School and middle-school-area lookups are district-specific, so dimensions
// are rebuilt per render using ALL_SCHOOLS for the active ccddd.
function buildDimensions(ccddd: number): DimensionsBundle {
  const schools = ALL_SCHOOLS[ccddd] ?? [];
  const schoolLookup = new Map<number, string>(schools.map(s => [s.school_code, s.school]));
  const msAreaLookup = new Map<number, string>();
  for (const s of schools) {
    if (s.ms_assignment_code !== undefined && !msAreaLookup.has(s.ms_assignment_code)) {
      msAreaLookup.set(s.ms_assignment_code, s.ms_assignment ?? String(s.ms_assignment_code));
    }
  }
  return {
    seriesDims: [
      { facetName: "school", codeColumn: "school_code", lookup: schoolLookup },
      { facetName: "test_subject", codeColumn: "test_subject_code", lookup: new Map(ALL_TEST_SUBJECTS.map(t => [t.test_subject_code, t.test_subject])) },
      { facetName: "grade_level", codeColumn: "grade_level_code", lookup: new Map(ALL_GRADE_LEVELS.map(g => [g.grade_level_code, g.grade_level])) },
      { facetName: "test_administration", codeColumn: "test_administration_code", lookup: new Map(ALL_ASSESSMENT_TYPES.map(t => [t.test_administration_code, t.test_administration])) },
      { facetName: "student_group", codeColumn: "student_group_code", lookup: new Map(ALL_STUDENT_GROUPS.map(g => [g.student_group_code, g.student_group])) },
    ],
    facetOnlyDims: [
      { facetName: "ms_assignment", codeColumn: "ms_assignment_code", lookup: msAreaLookup },
    ],
  };
}

function getFacetDim(dimensions: DimensionsBundle, facet: Facet): DimensionDef {
  return (
    dimensions.facetOnlyDims.find(d => d.facetName === facet) ??
    dimensions.seriesDims.find(d => d.facetName === facet)!
  );
}

function getSeriesDimensions(dimensions: DimensionsBundle, facet: Facet): Array<DimensionDef> {
  // Only series-eligible dims can appear as series; facet-only dims
  // disappear from the series legend even when they're not the chart facet.
  return dimensions.seriesDims.filter(d => d.facetName !== facet);
}

// Color identity columns. (subject, grade, administration) are always part
// of the colour key so a second dataset that differs only on student_group
// still maps the same subject/grade/test triple to the same colour. The
// school dimension is added when school is a series within each chart
// (i.e. when school is not the chart facet) — so e.g. the Middle School
// Area facet colours each school separately, but the per-school facet
// reuses the same (subject, grade, test) palette across every chart.
function colorKeyColumns(facet: Facet): Array<string> {
  const cols = ["test_subject_code", "grade_level_code", "test_administration_code"];
  if (facet !== "school") {
    cols.push("school_code");
  }
  return cols;
}

function extractSeriesDefsByFacet(
  filtered,
  facet: Facet,
  dimensions: DimensionsBundle,
  globalColorIndex: Map<string, number>,
  globalSeriesOrder: Map<string, number>,
): Map<string, Array<SeriesCodeDef>> {
  const facetDim = getFacetDim(dimensions, facet);
  const seriesDims = getSeriesDimensions(dimensions, facet);
  const facetArray = filtered.array(facetDim.codeColumn) as number[];
  const seriesArrays = seriesDims.map(d => filtered.array(d.codeColumn) as number[]);

  // Per-column accessor that combines the facet's code (when the column is
  // the chart facet) with series-dim arrays, so we can read any of the
  // five base codes regardless of which one is currently the facet.
  function codeFor(column: string, rowIndex: number): number | null {
    if (facetDim.codeColumn === column) {
      return facetArray[rowIndex] ?? null;
    }
    const j = seriesDims.findIndex(d => d.codeColumn === column);
    return j >= 0 ? (seriesArrays[j][rowIndex] ?? null) : null;
  }

  const colorKeyCols = colorKeyColumns(facet);
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
      const colorKey = colorKeyCols.map(c => codeFor(c, i)).join("_");
      if (!globalColorIndex.has(colorKey)) {
        globalColorIndex.set(colorKey, globalColorIndex.size);
      }
      if (!globalSeriesOrder.has(key)) {
        globalSeriesOrder.set(key, globalSeriesOrder.size);
      }
      const nameParts = seriesDims.map((dim, j) =>
        dim.lookup.get(codes[j]) ?? codes[j].toString()
      );
      // Highcharts' default styled palette defines color classes 0-9.
      // colorIndex values beyond that lose their line stroke styling, so
      // wrap into the palette. Series sharing a wrapped index just share
      // a colour — fine, since any collision is between distinct color
      // keys we'd already have to distinguish in the legend.
      result.get(facetCode)!.push({
        key,
        name: nameParts.join(" / "),
        colorIndex: globalColorIndex.get(colorKey)! % 10,
      });
    }
  }
  // Sort each facet's series by the globally-assigned order so the same
  // series key lands in the same position in every dataset's chart.
  for (const defs of result.values()) {
    defs.sort((a, b) =>
      (globalSeriesOrder.get(a.key) ?? 0) - (globalSeriesOrder.get(b.key) ?? 0),
    );
  }
  return result;
}

function makeComponentsGenerator(
  seriesDefsBySettings: Map<number | string, Map<string, Array<SeriesCodeDef>>>,
  metricName: string,
) {
  return function componentsGenerator(facetOrder,
                             contextSettings :AssessmentContextSettings,
                             settings: AssessmentSettings,
                             yBounds) {
    const seriesDefsByFacet = seriesDefsBySettings.get(settings.id) ?? new Map();
    const schoolFilter = makeSchoolFilter(settings.ccddd, contextSettings.schoolGrouping);
    const subtitle = `
    School(${schoolFilter.toSummaryText(settings.schoolCodes)}) /
    Subj(${TestSubjectFilter.toSummaryText(settings.testSubjectCodes)}) /
    Grade(${GradeLevelFilter.toSummaryText(settings.gradeLevelCodes)}) /
    Test(${AssessmentTypeFilter.toSummaryText(settings.testAdministrationCodes)}) /
    Group(${StudentGroupFilter.toSummaryText(settings.studentGroupCodes)})
    `;
    const components = makeFacetComponents({
      idPrefix: settings.id.toString(),
      xColumn: "class_of",
      xLabel: "Fiscal Year End",
      yColumnRoot: metricName,
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
    // Skip the (often-expensive) chart-config build when the user has
    // toggled rendering off in the context settings panel.
    if (contextSettings.chartsEnabled === false) {
      return null;
    }

    // Extract unique series definitions from the filtered data,
    // excluding the facet dimension (which becomes one chart per value).
    const firstSettings = allSettings[0];
    const districtData = districtDataMap[firstSettings.ccddd];
    const metricName = DISCLOSURE_AVOIDANCE_METRIC[contextSettings.disclosureAvoidance];

    // 2020 and 2021 were the COVID-disrupted assessment years.
    const excludeCovid = contextSettings.covidYears === "exclude";

    // Per-district lookup that adds school name + middle-school
    // attendance area to each row. ms_assignment_code lets the
    // dashboard facet by MS area; school name powers the legend.
    function buildSchoolDomain(ccddd: number) {
      const schools = ALL_SCHOOLS[ccddd] ?? [];
      return aq.table({
        school_code: schools.map(s => s.school_code),
        ms_assignment_code: schools.map(s => s.ms_assignment_code ?? 0),
        ms_assignment: schools.map(s => s.ms_assignment ?? "unknown"),
      });
    }

    function filteredAssessmentMaybeNoCovid(this: DistrictData, s: AssessmentSettings) {
      let result = this.filteredAssessment(s).join_left(buildSchoolDomain(s.ccddd), "school_code");
      if (excludeCovid) {
        result = result.filter(d => d.class_of !== 2020 && d.class_of !== 2021);
      }
      return result;
    }

    const dimensions = buildDimensions(firstSettings.ccddd);

    // Build series defs per dataset using shared global maps so that
    // (a) the same series tuple gets the same colour in every chart on
    // the page across datasets and (b) the same series key sorts to the
    // same position in every chart. Each dataset's chart still only
    // declares the series its own filters produce.
    const globalColorIndex = new Map<string, number>();
    const globalSeriesOrder = new Map<string, number>();
    const seriesDefsBySettings = new Map<number | string, Map<string, Array<SeriesCodeDef>>>();
    for (const s of allSettings) {
      const dd = districtDataMap[s.ccddd];
      const filteredS = filteredAssessmentMaybeNoCovid.call(dd, s);
      seriesDefsBySettings.set(
        s.id,
        extractSeriesDefsByFacet(
          filteredS,
          contextSettings.facet,
          dimensions,
          globalColorIndex,
          globalSeriesOrder,
        ),
      );
    }

    // Expand out the filter per sub-setting.
    const { data, fullFacetOrder } = extractFacets(
      districtDataMap,
      allSettings,
      contextSettings.facet,
      contextSettings.sortType,
      contextSettings.sortOrder,
      filteredAssessmentMaybeNoCovid,
      (districtData, filteredDf, facet, settings) =>
        toFacetedCharatbleAssessmentDataset(districtData, filteredDf, facet, settings, metricName),
      metricName,
    );

    // Drop facets whose data columns are entirely null/NaN — otherwise
    // they render as empty charts and break fixed-scale y-axis bounds.
    const facetsWithData = fullFacetOrder.filter(f =>
      allSettings.some(s => {
        const prefix = `${s.id}_${s.currencyNormalization}_${metricName}_${f.code}_`;
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

    // For Middle School Area charts, the facet value is the name of the
    // middle school the area is assigned to — append a clarifier so the
    // chart title reads e.g. "Aki Kurose Middle School (3774) Attendance
    // Area" rather than implying the chart is for that one school.
    const titledFacetOrder =
      contextSettings.facet === "ms_assignment"
        ? facetsWithData.map(f => ({ ...f, title: `${f.title} Attendance Area` }))
        : facetsWithData;

    return makeHighchartConfig(
      {
        connectorId: CONNECTOR_ID,
        metricName,
        contextSettings,
        allSettings,
        fullFacetOrder: titledFacetOrder,
        componentsGenerator: makeComponentsGenerator(seriesDefsBySettings, metricName),
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
        DisclosureAvoidanceContents,
        ChartsEnabledContents,
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
      {config && <HcDashboard config={config} />}
    </SettingsLayout>
  );
}
