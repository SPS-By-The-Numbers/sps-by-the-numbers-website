"use client";

import {
  ActivityFilterContents,
  ProgramFilterContents,
  SchoolFilterContents,
  DutyRootFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import { makeHighchartConfig, getDataBounds } from "utilities/highcharts/utils";
import { useMemo } from "react";
import {
  extractRawS275Staffing,
  toChartableDataset,
  getDataColumnNames,
} from "utilities/ChartableMetrics";
import {
  makeContextCell,
} from "utilities/highcharts/ChartConfigGenerators";
import {
  extractFacets,
} from "utilities/ChartableVitals";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import YScaleContents from "app/finance/_widgets/YScaleContents";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
import { op } from "arquero";
import { SERIALIZE_STAFFING_SETTINGS_GENERATORS, SERIALIZE_STAFFING_CONTEXT_SETTINGS_GENERATORS } from "./StaffingPage";
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
    max: Math.max(...[
      getDataBounds(data, "context_fte_studentSupportFte_actuals").max,
      getDataBounds(data, "context_fte_buildingSupportFte_actuals").max,
      getDataBounds(data, "context_fte_otherFte_actuals").max,
    ])
  }
  const cashflowBounds = getDataBounds(data, "context_amount_cashflow");
  gui.layouts.unshift({
    rowClassName: "context-row",
    cellClassName: "context-cell context-smaller",

    rows: [
      {
        cells: [
          { id: "context-fundedEnrollment" },
          { id: "context-teachingFte" },
        ]
      }, {
        cells: [
          { id: "context-studentSupportFte" },
          { id: "context-buildingSupportFte" },
          { id: "context-otherFte" },
        ],
      },
    ],
  });

  // Add Context cells.
  components.push(
    makeContextCell(
      `context-fundedEnrollment`,
      CONNECTOR_ID,
      `context_amount_fundedEnrollment`,
      "Funded Enrollment",
      "fte" as const,
      fundedEnrollmentBounds,
    ),
    makeContextCell(
      `context-teachingFte`,
      CONNECTOR_ID,
      `context_fte_teachingFte`,
      "Teaching",
      "fte" as const,
      teachingBounds,
    ),
    makeContextCell(
      `context-studentSupportFte`,
      CONNECTOR_ID,
      `context_fte_studentSupportFte`,
      "Student Support",
      "fte" as const,
      fteBounds,
    ),
    makeContextCell(
      `context-buildingSupportFte`,
      CONNECTOR_ID,
      'context_fte_buildingSupportFte',
      "Building Support",
      "fte" as const,
      fteBounds,
    ),
    makeContextCell(
      `context-otherFte`,
      CONNECTOR_ID,
      `context_fte_otherFte`,
      "Other FTE",
      "fte" as const,
      fteBounds,
    ),
  );
}

function componentsGenerator(facetOrder,
                             contextSettings: StaffingContextSettings,
                             settings: StaffingSettings,
                             yBounds) {
  const components = makeFacetComponents({
    idPrefix: settings.id.toString(),
    xColumn: "class_of",
    xLabel: "Fiscal Year End",
    yColumnRoot: METRIC_NAME,
    facetOrder,
    connectorId: CONNECTOR_ID,
    normalizations: [settings.staffingNormalization],
    captionType: "stats",
    yBounds,
    disableLegend: true,
  });

  return components;
}

function makeFacetedStaffingForDistrict(
  districtData,
  filteredS275Summary,
  facet,
  staffingSettings,
) {
  const rawData = extractRawS275Staffing(filteredS275Summary);

  const formatedData = rawData
    .params({ name: METRIC_NAME })
    .groupby("class_of")
    .pivot(["duty_root_code"], {
      finalSalary: (d) => op.sum(d.finalSalary),
      fte: (d, $) => op.sum(d[$.name]),
    })
    .select(aq.not("_pivot_name_hack_"))
    .derive({ data_type: (d) => "actuals" });

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

    return makeHighchartConfig(
      {
        connectorId: CONNECTOR_ID,
        metricName: METRIC_NAME,
        contextSettings,
        allSettings,
        fullFacetOrder,
        componentsGenerator,
        augmentContextComponents,
        data,
      }
    );
  }, [contextSettings, districtDataMap, allSettings]);

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: newAllSettings => serializeDatasetSettings(newAllSettings, SERIALIZE_STAFFING_SETTINGS_GENERATORS),
          serializeContext: context => serializeOneSetting(context, SERIALIZE_STAFFING_CONTEXT_SETTINGS_GENERATORS),
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
        ActivityFilterContents,
        ProgramFilterContents,
        SchoolFilterContents,
        DutyRootFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Staffing Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
