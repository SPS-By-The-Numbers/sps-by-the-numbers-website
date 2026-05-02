"use client";

import * as aq from "arquero";
import { op } from "arquero";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { useMemo } from "react";
import { getDataBounds, makeHighchartConfig } from "utilities/highcharts/utils";
import { makeContextCell } from "utilities/highcharts/ChartConfigGenerators";
import {
  toFacetedCharatbleEnrollmentDataset,
} from "utilities/ChartableMetrics";
import { extractFacets } from "utilities/ChartableVitals";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
import { makeMultiSeriesLineChartConfig } from "utilities/highcharts/ChartConfigGenerators";

import type { SeriesCodeDef } from "utilities/highcharts/ChartConfigGenerators";
import {
  SchoolFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import ALL_SCHOOLS from "utilities/domain/schools";
import DistrictData from "utilities/DistrictData";
import EnrollmentDatasetSettingsContents from "app/finance/enrollment/EnrollmentDatasetSettingsContents";
import HcDashboard from "components/HcDashboard";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";
import {
  ENROLLMENT_MODE_CODE_COLUMNS,
  ENROLLMENT_MODE_LABEL_COLUMNS,
  ENROLLMENT_MODE_OPTIONS,
  SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS,
  SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS,
} from "app/finance/enrollment/EnrollmentPage";
import EnrollmentModeContents from "app/finance/enrollment/EnrollmentModeContents";
import EnrollmentGradeLevelFilterContents from "app/finance/enrollment/EnrollmentGradeLevelFilterContents";
import EnrollmentStudentGroupFilterContents from "app/finance/enrollment/EnrollmentStudentGroupFilterContents";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import ChartsEnabledContents from "app/finance/_widgets/ChartsEnabledContents";
import SchoolGroupingContents from "app/finance/_widgets/SchoolGroupingContents";
import YScaleContents from "app/finance/_widgets/YScaleContents";

import { makeSchoolFilter } from "app/finance/_filteritems/school";

import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { EnrollmentSettings, EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

const CONNECTOR_ID = "default-connector";

const ALL_FACETS = ["school", "ms_assignment", "region", "grade_level", "grade_cohort"] as const;
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  school: "School",
  ms_assignment: "Middle School Area",
  region: "Region",
  grade_level: "Grade",
  grade_cohort: "Grade Cohort",
};

const FACET_SERIALIZE_MAP: Record<Facet, string> = {
  school: "0",
  ms_assignment: "1",
  region: "2",
  grade_level: "3",
  grade_cohort: "4",
};
const FACET_DESERIALIZE_MAP = Object.fromEntries(
  Object.entries(FACET_SERIALIZE_MAP).map(([k, v]) => [v, k]),
) as Record<string, Facet>;

export function serializeFacet(facet: Facet): string {
  return FACET_SERIALIZE_MAP[facet] ?? "0";
}

export function deserializeFacet(s: string): Facet {
  return FACET_DESERIALIZE_MAP[s] ?? "school";
}

function makeComponentsGenerator(
  metricName: string,
  seriesDefsByFacet: Map<string, Array<SeriesCodeDef>>,
) {
  return function componentsGenerator(
    facetOrder,
    contextSettings: EnrollmentContextSettings,
    settings: EnrollmentSettings,
    yBounds,
  ) {
    const schoolFilter = makeSchoolFilter(settings.ccddd, contextSettings.schoolGrouping);
    const groupLabel = `${settings.studentGroupCodes?.size ?? 0} group(s)`;
    const modeLabel = ENROLLMENT_MODE_OPTIONS[contextSettings.mode] ?? contextSettings.mode;
    const subtitle = `
    School(${schoolFilter.toSummaryText(settings.schoolCodes)}) /
    Group(${groupLabel}) /
    Mode(${modeLabel})
    `;
    return makeFacetComponents({
      idPrefix: settings.id.toString(),
      xColumn: "class_of",
      xLabel: "Fiscal Year End",
      yColumnRoot: metricName,
      facetOrder,
      connectorId: CONNECTOR_ID,
      normalizations: [settings.currencyNormalization],
      captionType: "stats",
      subtitle,
      yBounds,
      yValueFormatOverride: "decimal",
      chartConfigMaker: (options) => makeMultiSeriesLineChartConfig({
        ...options,
        yLabel: "Student Headcount",
        seriesDefs: seriesDefsByFacet.get(String(options.facet)) ?? [],
      }),
    });
  };
}

// Charts expenditures for
export default function EnrollmentDashboard({
  districtDataMap,
  allSettings,
  contextSettings,
}: DistrictDataContentProps<EnrollmentSettings, EnrollmentContextSettings>) {
  const config = useMemo(() => {
    if (contextSettings.chartsEnabled === false) return null;

    // After filteredEnrollment fold-into-long, the headcount is in the
    // "amount" column regardless of which student group(s) the user
    // picked.
    const metricName = "amount";

    // Per-district lookup that adds the school's middle-school
    // attendance area and region to each row, so the dashboard can
    // facet by MS area or region. Districts with no ms_assignment_code
    // populated collapse every school under code 0 / "unknown".
    // Region is a string in the schools domain; synthesize a numeric
    // region_code (>= 9000 so makeFacetCodeText suppresses the code in
    // the chart title) to use as the pivot facet key.
    function buildSchoolDomain(ccddd: number) {
      const schools = ALL_SCHOOLS[ccddd] ?? [];
      const regionCodes = new Map<string, number>();
      let nextRegionCode = 9001;
      const regionPerSchool = schools.map(s => {
        const region = s.region ?? "unknown";
        if (!regionCodes.has(region)) {
          regionCodes.set(region, nextRegionCode++);
        }
        return { region, region_code: regionCodes.get(region)! };
      });
      return aq.table({
        school_code: schools.map(s => s.school_code),
        ms_assignment_code: schools.map(s => s.ms_assignment_code ?? 0),
        ms_assignment: schools.map(s => s.ms_assignment ?? "unknown"),
        region: regionPerSchool.map(r => r.region),
        region_code: regionPerSchool.map(r => r.region_code),
      });
    }

    function filteredEnrollmentWithSchoolDomain(this: DistrictData, s: EnrollmentSettings) {
      return this.filteredEnrollment(s).join_left(buildSchoolDomain(s.ccddd), "school_code");
    }

    // Map mode choice to the matching code/label columns on the
    // enrollment frame. When the mode column is the same as the
    // current facet's code column, the dataset transformer treats the
    // chart as a single-line render (no mode applied).
    const modeCodeColumn = ENROLLMENT_MODE_CODE_COLUMNS[contextSettings.mode];
    const modeLabelColumn = ENROLLMENT_MODE_LABEL_COLUMNS[contextSettings.mode];
    const facetCodeColumn = `${contextSettings.facet}_code`;
    const effectiveModeCol = modeCodeColumn === facetCodeColumn ? null : modeCodeColumn;

    // Expand out the filter per sub-setting. The enrollment dashboard
    // sorts facets alphabetically by name, so the sortType/sortOrder
    // arguments here are placeholders — the result is re-sorted below.
    const { data: facetData, fullFacetOrder } = extractFacets(
      districtDataMap,
      allSettings,
      contextSettings.facet,
      "latest",
      "ascending",
      filteredEnrollmentWithSchoolDomain,
      (districtData, filteredDf, facet, settings) =>
        toFacetedCharatbleEnrollmentDataset(
          districtData,
          filteredDf,
          facet,
          settings,
          metricName,
          effectiveModeCol,
        ),
      metricName,
    );

    // Per-facet series defs for the multi-series chart. The series key
    // is only the mode code (or the facet code when mode collapses with
    // the facet) — the chart prepends the facet code on its own when
    // looking up data columns.
    const seriesDefsByFacet = (() => {
      const result = new Map<string, Array<SeriesCodeDef>>();
      const firstFiltered = filteredEnrollmentWithSchoolDomain.call(
        districtDataMap[allSettings[0].ccddd],
        allSettings[0],
      ).filter((d) => d.grade != "All Grades");
      const facetArr = firstFiltered.array(facetCodeColumn) as Array<number | null>;
      const studentGroupArr = firstFiltered.array("student_group_code") as Array<number | null>;
      const studentGroupNameArr = firstFiltered.array("student_group") as Array<string | null>;
      if (effectiveModeCol) {
        const modeArr = firstFiltered.array(effectiveModeCol) as Array<number | null>;
        const labelArr = firstFiltered.array(modeLabelColumn) as Array<string | null>;
        const seenByFacet = new Map<string, Set<string>>();
        const modeLabelByCode = new Map<string, string>();
        const studentGroupLabelByCode = new Map<string, string>();
        for (let i = 0; i < firstFiltered.numRows(); i++) {
          const facetCode = String(facetArr[i]);
          const modeCode = String(modeArr[i]);
          const studentGroupCode = String(studentGroupArr[i]);
          const seriesKey = `${modeCode}_${studentGroupCode}`;
          let seen = seenByFacet.get(facetCode);
          if (!seen) {
            seen = new Set();
            seenByFacet.set(facetCode, seen);
            result.set(facetCode, []);
          }
          if (!modeLabelByCode.has(modeCode)) {
            modeLabelByCode.set(modeCode, String(labelArr[i] ?? modeCode));
          }
          if (!studentGroupLabelByCode.has(studentGroupCode)) {
            studentGroupLabelByCode.set(studentGroupCode, String(studentGroupNameArr[i] ?? studentGroupCode));
          }
          if (!seen.has(seriesKey)) {
            seen.add(seriesKey);
            result.get(facetCode)!.push({
              key: seriesKey,
              name: `${modeLabelByCode.get(modeCode)} / ${studentGroupLabelByCode.get(studentGroupCode)}`,
            });
          }
        }
        // Stable sort by (mode code, student-group code).
        for (const defs of result.values()) {
          defs.sort((a, b) => {
            const [ab, ag] = a.key.split("_").map(Number);
            const [bb, bg] = b.key.split("_").map(Number);
            return ab - bb || ag - bg;
          });
        }
      } else {
        // No effective mode — one series per selected dataset. The
        // composite_key in the dataset transformer is `<facet>_<group>`,
        // so the chart's seriesKey is just the student-group code.
        const seenByFacet = new Map<string, Set<string>>();
        const studentGroupLabelByCode = new Map<string, string>();
        for (let i = 0; i < firstFiltered.numRows(); i++) {
          const facetCode = String(facetArr[i]);
          const studentGroupCode = String(studentGroupArr[i]);
          let seen = seenByFacet.get(facetCode);
          if (!seen) {
            seen = new Set();
            seenByFacet.set(facetCode, seen);
            result.set(facetCode, []);
          }
          if (!studentGroupLabelByCode.has(studentGroupCode)) {
            studentGroupLabelByCode.set(studentGroupCode, String(studentGroupNameArr[i] ?? studentGroupCode));
          }
          if (!seen.has(studentGroupCode)) {
            seen.add(studentGroupCode);
            result.get(facetCode)!.push({
              key: studentGroupCode,
              name: studentGroupLabelByCode.get(studentGroupCode)!,
            });
          }
        }
        for (const defs of result.values()) {
          defs.sort((a, b) => Number(a.key) - Number(b.key));
        }
      }
      return result;
    })();

    // Inject a district-wide total-enrollment column into the data so
    // augmentContextComponents below can render a Total Enrollment
    // context graph alongside the funded-enrollment / cashflow ones
    // already supplied by makeChartableVitals.
    const firstDistrictData = districtDataMap[allSettings[0].ccddd];
    // filteredEnrollment now returns long-format rows keyed by
    // student_group_code; pick the All Students rows (code 1) and sum
    // their amount per class_of for the district-wide total.
    const totalEnrollmentDf = firstDistrictData
      .filteredEnrollment({ studentGroupCodes: new Set<number>([1]) })
      .filter((d) => d.grade != "All Grades")
      .groupby("class_of")
      .rollup({
        context_amount_totalEnrollment_actuals: (d) => op.sum(d.amount),
      });
    const data = facetData.join_left(totalEnrollmentDf, "class_of");

    // Sort by facet name (alphabetical, locale-aware) so charts
    // appear in a stable order regardless of underlying data values.
    const nameSortedFacetOrder = [...fullFacetOrder].sort((a, b) =>
      String(a.title).localeCompare(String(b.title)),
    );

    // Drop facets whose data columns are entirely null/NaN — otherwise
    // they render as empty charts. This matters most for the MS-area
    // facet, where some areas may have no enrolled schools in the
    // user's filter.
    const facetsWithData = nameSortedFacetOrder.filter(f =>
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

    function augmentContextComponents(gui, components, _data) {
      const totalEnrollmentBounds = getDataBounds(data, "context_amount_totalEnrollment");
      const fundedEnrollmentBounds = getDataBounds(data, "context_amount_fundedEnrollment");
      const cashflowBounds = getDataBounds(data, "context_amount_cashflow");

      gui.layouts.unshift({
        rowClassName: "context-row",
        cellClassName: "context-cell context-smaller",
        rows: [
          {
            cells: [
              { id: "context-totalEnrollment" },
              { id: "context-fundedEnrollment" },
              { id: "context-cashflow" },
            ],
          },
        ],
      });

      components.push(
        makeContextCell(
          "context-totalEnrollment",
          CONNECTOR_ID,
          "context_amount_totalEnrollment",
          "Total Enrollment",
          "decimal" as const,
          totalEnrollmentBounds,
          "Headcount",
        ),
        makeContextCell(
          "context-fundedEnrollment",
          CONNECTOR_ID,
          "context_amount_fundedEnrollment",
          "Funded Enrollment",
          "fte" as const,
          fundedEnrollmentBounds,
        ),
        makeContextCell(
          "context-cashflow",
          CONNECTOR_ID,
          "context_amount_cashflow",
          "Cashflow",
          "currency" as const,
          cashflowBounds,
        ),
      );
    }

    return makeHighchartConfig(
      {
        connectorId: CONNECTOR_ID,
        metricName,
        contextSettings,
        allSettings,
        fullFacetOrder: titledFacetOrder,
        componentsGenerator: makeComponentsGenerator(metricName, seriesDefsByFacet),
        augmentContextComponents,
        data,
      }
    );
  }, [contextSettings, districtDataMap, allSettings]);

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: newAllSettings => serializeDatasetSettings(newAllSettings, SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS),
          serializeContext: context => serializeOneSetting(context, SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS),
      }}
      allSettings={allSettings}
      contextSettings={contextSettings}
      contextSettingsComponents={[
        makeFacetContents(FACET_OPTIONS),
        EnrollmentModeContents,
        YScaleContents,
        SchoolGroupingContents,
        ChartsEnabledContents,
      ]}
      settingsContentsComponents={[
        EnrollmentDatasetSettingsContents,
        SchoolFilterContents,
        EnrollmentGradeLevelFilterContents,
        EnrollmentStudentGroupFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Enrollment Explorer
      </Typography>
      {config && <HcDashboard config={config} />}
    </SettingsLayout>
  );
}
