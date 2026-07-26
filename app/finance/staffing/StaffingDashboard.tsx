"use client";

import {
  ActivityFilterContents,
  ProgramFilterContents,
  SchoolFilterContents,
  DutyRootFilterContents,
  EmploymentClassFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import ActivityFilter from "app/finance/_filteritems/activity";
import ProgramFilter from "app/finance/_filteritems/program";
import DutyRootFilter from "app/finance/_filteritems/duty_root";
import EmploymentClassFilter from "app/finance/_filteritems/employment_class";
import { makeHighchartConfig, getDataBounds } from "utilities/highcharts/utils";
import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { useMemo } from "react";
import {
  extractRawS275Staffing,
  toChartableDataset,
  getDataColumnNames,
} from "utilities/ChartableMetrics";
import { makeContextCell } from "utilities/highcharts/ChartConfigGenerators";
import { BUDGET_REVISED_ACTUALS_SERIES } from "utilities/highcharts/SeriesSpecs";
import { extractFacets } from "utilities/ChartableVitals";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import ChartsEnabledContents from "app/finance/_widgets/ChartsEnabledContents";
import SchoolGroupingContents from "app/finance/_widgets/SchoolGroupingContents";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import YScaleContents from "app/finance/_widgets/YScaleContents";
import {
  serializeDatasetSettings,
  serializeOneSetting,
} from "app/finance/_settings/common_settings";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
import { op } from "arquero";
import {
  SERIALIZE_STAFFING_SETTINGS_GENERATORS,
  SERIALIZE_STAFFING_CONTEXT_SETTINGS_GENERATORS,
} from "./StaffingPage";
import * as aq from "arquero";
import HcDashboard from "components/HcDashboard";
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import DistrictData from "utilities/DistrictData";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";
import { FACET_OPTIONS } from "./StaffingPage";

import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { StaffingSettings, StaffingContextSettings } from "./StaffingPage";

const CONNECTOR_ID = "default-connector";
const METRIC_NAME = "fte";

function augmentContextComponents(gui, components, data) {
  const fundedEnrollmentBounds = getDataBounds(
    data,
    "context_amount_fundedEnrollment",
  );

  const teachingBounds = {
    min: 0,
    max: getDataBounds(data, "context_fte_teachingFte_actuals").max,
  };

  const fteBounds = {
    min: 0,
    max: Math.max(
      ...[
        getDataBounds(data, "context_fte_studentSupportFte_actuals").max,
        getDataBounds(data, "context_fte_buildingSupportFte_actuals").max,
        getDataBounds(data, "context_fte_otherFte_actuals").max,
      ],
    ),
  };
  const cashflowBounds = getDataBounds(data, "context_amount_cashflow");
  gui.layouts.unshift({
    rowClassName: "context-row",
    cellClassName: "context-cell context-smaller",

    rows: [
      {
        cells: [
          { id: "context-fundedEnrollment" },
          { id: "context-teachingFte" },
        ],
      },
      {
        cells: [
          { id: "context-studentSupportFte" },
          { id: "context-buildingSupportFte" },
          { id: "context-otherFte" },
        ],
      },
    ],
  });

  // Add Context cells. All three series are declared; Revised Budget is
  // dropped per-cell wherever the frame has no data for it (all the FTE
  // metrics today).
  const seriesOptions = { seriesSpecs: BUDGET_REVISED_ACTUALS_SERIES, data };
  components.push(
    makeContextCell(
      `context-fundedEnrollment`,
      CONNECTOR_ID,
      `context_amount_fundedEnrollment`,
      "Funded Enrollment",
      "fte" as const,
      fundedEnrollmentBounds,
      undefined,
      seriesOptions,
    ),
    makeContextCell(
      `context-teachingFte`,
      CONNECTOR_ID,
      `context_fte_teachingFte`,
      "Teaching",
      "fte" as const,
      teachingBounds,
      undefined,
      seriesOptions,
    ),
    makeContextCell(
      `context-studentSupportFte`,
      CONNECTOR_ID,
      `context_fte_studentSupportFte`,
      "Student Support",
      "fte" as const,
      fteBounds,
      undefined,
      seriesOptions,
    ),
    makeContextCell(
      `context-buildingSupportFte`,
      CONNECTOR_ID,
      "context_fte_buildingSupportFte",
      "Building Support",
      "fte" as const,
      fteBounds,
      undefined,
      seriesOptions,
    ),
    makeContextCell(
      `context-otherFte`,
      CONNECTOR_ID,
      `context_fte_otherFte`,
      "Other FTE",
      "fte" as const,
      fteBounds,
      undefined,
      seriesOptions,
    ),
  );
}

function componentsGenerator(
  facetOrder,
  contextSettings: StaffingContextSettings,
  settings: StaffingSettings,
  yBounds,
) {
  const schoolFilter = makeSchoolFilter(
    settings.ccddd,
    contextSettings.schoolGrouping,
  );
  const subtitle = `
  School(${schoolFilter.toSummaryText(settings.schoolCodes)}) /
  Prog(${ProgramFilter.toSummaryText(settings.programCodes)}) /
  Act(${ActivityFilter.toSummaryText(settings.activityCodes)}) /
  Duty(${DutyRootFilter.toSummaryText(settings.dutyRootCodes)}) /
  Class(${EmploymentClassFilter.toSummaryText(settings.employmentClassCodes)})
  `;
  const components = makeFacetComponents({
    idPrefix: settings.id.toString(),
    xColumn: "class_of",
    xLabel: "Fiscal Year End",
    yColumnRoot: METRIC_NAME,
    facetOrder,
    connectorId: CONNECTOR_ID,
    normalizations: [settings.staffingNormalization],
    captionType: "stats",
    subtitle,
    yBounds,
    disableLegend: true,
  });

  return components;
}

// Budgeted FTE (F-195) is reported only by program / activity / duty root --
// never by school. Every other Staffing dimension (program, activity, duty root,
// and the derived employment class / staff category) IS carried by the F-195
// budget, so the budget overlay is eligible whenever the facet is not "school"
// and the School filter is not narrowed below its full domain. When it isn't
// eligible the dashboard hides the (empty) budget series and surfaces an
// explanatory banner instead (see `budgetBanner` in the component).
export function budgetOverlayEligible(
  facet: string,
  staffingSettings: StaffingSettings,
): boolean {
  if (facet === "school") {
    return false;
  }
  const allSchools = makeSchoolFilter(staffingSettings.ccddd).allCodes().size;
  const schoolsNarrowed =
    staffingSettings.schoolCodes !== undefined &&
    staffingSettings.schoolCodes.size < allSchools;
  return !schoolsNarrowed;
}

function makeFacetedStaffingForDistrict(
  districtData,
  filteredS275Summary,
  facet,
  staffingSettings,
) {
  const facetCodeColumn = `${facet}_code`;
  const rawColumns = [
    "class_of",
    facetCodeColumn,
    "finalSalary",
    "initialSalary",
    "fte",
    "data_type",
  ];

  // Actuals (S-275) in long form, tagged data_type="actuals".
  let rawData = extractRawS275Staffing(filteredS275Summary, facet).derive({
    data_type: () => "actuals",
  });

  // Overlay budgeted FTE (F-195) as data_type="budget" rows when eligible. It
  // has no salary, so finalSalary / initialSalary are zero-filled to match the
  // actuals shape for the union; the single data_type pivot in
  // toChartableDataset then emits paired fte_<code>_actuals / _budget columns
  // that light up the chart's already-present Budget series.
  if (budgetOverlayEligible(facet, staffingSettings)) {
    const budgetRaw = districtData
      .filteredBudgetedFte(staffingSettings)
      .groupby("class_of", facetCodeColumn)
      .rollup({ fte: (d) => op.sum(d.fte) })
      .derive({
        finalSalary: () => 0,
        initialSalary: () => 0,
        data_type: () => "budget",
      })
      .select(...rawColumns);
    rawData = rawData.select(...rawColumns).concat(budgetRaw);
  }

  const formatedData = rawData
    .params({ name: METRIC_NAME })
    .groupby("class_of", "data_type")
    .pivot([facetCodeColumn], {
      finalSalary: (d) => op.sum(d.finalSalary),
      fte: (d, $) => op.sum(d[$.name]),
    })
    .select(aq.not("_pivot_name_hack_"));

  const joinedData = formatedData.join_left(
    districtData.fundedEnrollmentSummary(),
  );
  const names = getDataColumnNames(joinedData);
  return toChartableDataset(
    districtData,
    joinedData,
    staffingSettings,
    names.filter((d) => !d.includes("finalSalary_") && !d.includes("amount_")),
    names.filter((d) => d.includes("finalSalary_")),
    names.filter((d) => d.includes("fte_")),
  );
}

// Charts expenditures for
export default function StaffingDashboard({
  districtDataMap,
  allSettings,
  contextSettings,
}: DistrictDataContentProps<StaffingSettings, StaffingContextSettings>) {
  const config = useMemo(() => {
    if (contextSettings.chartsEnabled === false) return null;

    // Expand out the filter per sub-setting.
    const { data, fullFacetOrder } = extractFacets(
      districtDataMap,
      allSettings,
      contextSettings.facet,
      contextSettings.sortType,
      contextSettings.sortOrder,
      DistrictData.prototype.filteredS275Summary,
      makeFacetedStaffingForDistrict,
      METRIC_NAME,
    );

    return makeHighchartConfig({
      connectorId: CONNECTOR_ID,
      metricName: METRIC_NAME,
      contextSettings,
      allSettings,
      fullFacetOrder,
      componentsGenerator,
      augmentContextComponents,
      data,
    });
  }, [contextSettings, districtDataMap, allSettings]);

  // Budgeted FTE (F-195) has no school breakdown. When a view can't show it --
  // faceting by School or with a narrowed School filter -- the only dimension
  // the budget lacks -- explain why the Budget series is absent rather than
  // leaving it silently missing. Keyed off the primary dataset's settings.
  const budgetBanner = useMemo(() => {
    const settings = allSettings[0];
    if (!settings || budgetOverlayEligible(contextSettings.facet, settings)) {
      return null;
    }
    return "Budgeted FTE is not available at school granularity — the budget (F-195) reports FTE only district-wide (by program, activity, duty root, and employment class). Select all schools and facet by something other than School to overlay it.";
  }, [contextSettings.facet, allSettings]);

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: (newAllSettings) =>
          serializeDatasetSettings(
            newAllSettings,
            SERIALIZE_STAFFING_SETTINGS_GENERATORS,
          ),
        serializeContext: (context) =>
          serializeOneSetting(
            context,
            SERIALIZE_STAFFING_CONTEXT_SETTINGS_GENERATORS,
          ),
      }}
      allSettings={allSettings}
      contextSettings={contextSettings}
      contextSettingsComponents={[
        makeFacetContents(FACET_OPTIONS),
        SortOrderContents,
        YScaleContents,
        SchoolGroupingContents,
        ChartsEnabledContents,
      ]}
      settingsContentsComponents={[
        DatasetSettingsContents,
        ActivityFilterContents,
        ProgramFilterContents,
        SchoolFilterContents,
        DutyRootFilterContents,
        EmploymentClassFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Staffing Dashboard
      </Typography>
      {budgetBanner && (
        <Typography
          variant="caption"
          component="p"
          sx={{
            px: 2,
            py: 0.5,
            color: "text.secondary",
            borderLeft: "3px solid",
            borderColor: "warning.main",
            backgroundColor: "action.hover",
          }}
        >
          {budgetBanner}
        </Typography>
      )}
      {config && <HcDashboard config={config} />}
    </SettingsLayout>
  );
}
