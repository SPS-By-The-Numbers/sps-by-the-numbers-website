"use client";

import * as aq from "arquero";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { useMemo } from "react";
import { makeHighchartConfig } from "utilities/highcharts/utils";
import {
  toFacetedCharatbleEnrollmentDataset,
} from "utilities/ChartableMetrics";
import { extractFacets } from "utilities/ChartableVitals";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
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
  ENROLLMENT_STUDENT_GROUP_OPTIONS,
  SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS,
  SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS,
} from "app/finance/enrollment/EnrollmentPage";
import EnrollmentStudentGroupContents from "app/finance/enrollment/EnrollmentStudentGroupContents";
import EnrollmentGradeLevelFilterContents from "app/finance/enrollment/EnrollmentGradeLevelFilterContents";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import ChartsEnabledContents from "app/finance/_widgets/ChartsEnabledContents";
import SchoolGroupingContents from "app/finance/_widgets/SchoolGroupingContents";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import YScaleContents from "app/finance/_widgets/YScaleContents";

import { makeSchoolFilter } from "app/finance/_filteritems/school";

import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { EnrollmentSettings, EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

const CONNECTOR_ID = "default-connector";

const ALL_FACETS = ["school", "ms_assignment", "region"] as const;
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  school: "School",
  ms_assignment: "Middle School Area",
  region: "Region",
};

const FACET_SERIALIZE_MAP: Record<Facet, string> = {
  school: "0",
  ms_assignment: "1",
  region: "2",
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

function makeComponentsGenerator(metricName: string) {
  return function componentsGenerator(
    facetOrder,
    contextSettings: EnrollmentContextSettings,
    settings: EnrollmentSettings,
    yBounds,
  ) {
    const schoolFilter = makeSchoolFilter(settings.ccddd, contextSettings.schoolGrouping);
    const groupLabel = ENROLLMENT_STUDENT_GROUP_OPTIONS[contextSettings.studentGroup] ?? contextSettings.studentGroup;
    const subtitle = `
    School(${schoolFilter.toSummaryText(settings.schoolCodes)}) /
    Group(${groupLabel})
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
      disableLegend: true,
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

    const metricName = contextSettings.studentGroup;

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

    // Expand out the filter per sub-setting.
    const { data, fullFacetOrder } = extractFacets(
      districtDataMap,
      allSettings,
      contextSettings.facet,
      contextSettings.sortType,
      contextSettings.sortOrder,
      filteredEnrollmentWithSchoolDomain,
      (districtData, filteredDf, facet, settings) =>
        toFacetedCharatbleEnrollmentDataset(districtData, filteredDf, facet, settings, metricName),
      metricName,
    );

    // Drop facets whose data columns are entirely null/NaN — otherwise
    // they render as empty charts. This matters most for the MS-area
    // facet, where some areas may have no enrolled schools in the
    // user's filter.
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
        componentsGenerator: makeComponentsGenerator(metricName),
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
        SortOrderContents,
        YScaleContents,
        SchoolGroupingContents,
        EnrollmentStudentGroupContents,
        ChartsEnabledContents,
      ]}
      settingsContentsComponents={[
        EnrollmentDatasetSettingsContents,
        SchoolFilterContents,
        EnrollmentGradeLevelFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Enrollment Headcount (Different from AAFTE in budgets which treats Running Start and Special Education students as less than 1).
      </Typography>
      {config && <HcDashboard config={config} />}
    </SettingsLayout>
  );
}
