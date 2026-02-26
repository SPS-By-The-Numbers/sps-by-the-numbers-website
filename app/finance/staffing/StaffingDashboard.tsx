"use client";

import {
  ActivityFilterContents,
  ProgramFilterContents,
  SchoolFilterContents,
  DutyRootFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import { dfToJSONConnectorOptions } from "utilities/highcharts/utils";
import {
  extractRawS275Staffing,
  toChartableDataset,
  getDataColumnNames,
} from "utilities/ChartableMetrics";
import {
  extractFacets,
} from "utilities/ChartableVitals";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
import { op } from "arquero";
import { SERIALIZE_STAFFING_SETTINGS_GENERATORS, SERIALIZE_STAFFING_CONTEXT_SETTINGS_GENERATORS } from "./StaffingPage";
import { serializeSettings } from "app/finance/_settings/base_settings";
import * as aq from "arquero";
import HcDashboard from "components/HcDashboard";
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import DistrictData from "utilities/DistrictData";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";

import type { ColumnTable } from "arquero";
import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { StaffingSettings, StaffingContextSettings } from "./StaffingPage";

const CONNECTOR_ID = "settings-connector";

function componentsGenerator(staffingSettings: StaffingSettings, facetOrder) {
  const components = makeFacetComponents({
    idPrefix: staffingSettings.id.toString(),
    xColumn: "class_of",
    xLabel: "Fiscal Year End",
    yColumnRoot: "fte",
    facetOrder,
    connectorId: CONNECTOR_ID,
    normalizations: [staffingSettings.staffingNormalization],
    captionType: "stats",
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
    .groupby("class_of")
    .pivot(["duty_root_code"], {
      finalSalary: (d) => op.sum(d.finalSalary),
      fte: (d) => op.sum(d.fte),
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
  const {data, fullFacetOrder} = extractFacets(
    districtDataMap,
    allSettings,
    "duty_root" as const,
    contextSettings.sortType,
    contextSettings.sortOrder,
    DistrictData.prototype.filteredS275Summary,
    makeFacetedStaffingForDistrict,
    "fte_in_assignment",
  );

  const result = makeDatasetFacetedDashboard(allSettings, (s) =>
    componentsGenerator(s, fullFacetOrder),
  );
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const { components, gui } = result;

  const config = {
    gui,
    components,
    dataPool: {
      connectors: [
        {
          id: CONNECTOR_ID,
          type: "JSON",
          ...dfToJSONConnectorOptions(data),
        },
      ],
    },
  };

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: newAllSettings => serializeDatasetSettings(newAllSettings, SERIALIZE_STAFFING_SETTINGS_GENERATORS),
          serializeContext: context => serializeOneSetting(context, SERIALIZE_STAFFING_CONTEXT_SETTINGS_GENERATORS),
      }}
      allSettings={allSettings}
      contextSettings={contextSettings}
      contextSettingsComponents={[]}
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
