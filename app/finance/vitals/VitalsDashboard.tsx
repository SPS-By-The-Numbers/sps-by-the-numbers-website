"use client";

import { dfToJSONConnectorOptions } from "utilities/highcharts/utils";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import { SERIALIZE_VITALS_SETTINGS_GENERATORS } from "./VitalsPage";
import { serializeDatasetSettings } from "app/finance/_settings/common_settings";
import { makeBudgetActualsChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { makeChartableVitals } from "utilities/ChartableVitals";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { useSearchParams } from "next/navigation";
import HcDashboard from "components/HcDashboard";
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";

import type {
  BudgetActualsChartOptions,
  ValueFormat,
} from "utilities/highcharts/ChartConfigGenerators";
import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

export interface VitalsSettings extends DatasetSettings {}

const CONNECTOR_ID = "vitals-connector";

function makeCell(
  renderTo,
  metricColumn,
  title,
  yValueFormat,
  yLabel?: string,
) {
  return {
    renderTo: `c-${renderTo}`,
    title,
    metricColumn,
    connectorId: CONNECTOR_ID,
    xDataColumn: "class_of",
    xValueFormat: "year" as const,

    yValueFormat,
    yLabel,
    captionType: "none" as const,
  };
}

function makeBudgetActualsChartOptions(
  idPrefix,
  currencyNormalization,
  staffingNormalization,
): Array<BudgetActualsChartOptions> {
  const currencyFormat: ValueFormat =
    currencyNormalization === "amount"
      ? ("currency" as const)
      : currencyNormalization;

  return [
    makeCell(
      `${idPrefix}-fundedEnrollment-chart`,
      `${idPrefix}_amount_fundedEnrollment`,
      "Funded Enrollment",
      "fte" as const,
      "AAFTE",
    ),
    makeCell(
      `${idPrefix}-staffing-chart`,
      `${idPrefix}_${staffingNormalization}_staffFte`,
      "Staffing FTE",
      staffingNormalization,
    ),
    {
      ...makeCell(
        `${idPrefix}-cashflow-chart`,
        `${idPrefix}_${currencyNormalization}_cashflow`,
        "Cashflow",
        currencyFormat,
      ),
      yValueShowNegative: true,
    },
    makeCell(
      `${idPrefix}-beginning-balance-chart`,
      `${idPrefix}_${currencyNormalization}_beginningBalance`,
      "Beginning Balance",
      currencyFormat,
    ),
    makeCell(
      `${idPrefix}-teaching-related-comp`,
      `${idPrefix}_${currencyNormalization}_teachingComp`,
      "Teaching Related Comp",
      currencyFormat,
    ),
    makeCell(
      `${idPrefix}-student-support-comp`,
      `${idPrefix}_${currencyNormalization}_studentSupportComp`,
      "Student Support Comp",
      currencyFormat,
    ),
    makeCell(
      `${idPrefix}-building-support-comp`,
      `${idPrefix}_${currencyNormalization}_buildingSupportComp`,
      "Buildling Support Comp",
      currencyFormat,
    ),
    makeCell(
      `${idPrefix}-other-comp`,
      `${idPrefix}_${currencyNormalization}_otherComp`,
      "Other Comp",
      currencyFormat,
    ),
    makeCell(
      `${idPrefix}-teaching-related-fte`,
      `${idPrefix}_${staffingNormalization}_teachingFte`,
      "Teaching Related Fte",
      staffingNormalization,
    ),
    makeCell(
      `${idPrefix}-student-support-fte`,
      `${idPrefix}_${staffingNormalization}_studentSupportFte`,
      "Student Support Fte",
      staffingNormalization,
    ),
    makeCell(
      `${idPrefix}-building-support-fte`,
      `${idPrefix}_${staffingNormalization}_buildingSupportFte`,
      "Buildling Support Fte",
      staffingNormalization,
    ),
    makeCell(
      `${idPrefix}-other-fte`,
      `${idPrefix}_${staffingNormalization}_otherFte`,
      "Other Fte",
      staffingNormalization,
    ),
  ];
}

function componentsGenerator(vitalsSettings: VitalsSettings) {
  const budgetActualsChartOptions = makeBudgetActualsChartOptions(
    vitalsSettings.id,
    vitalsSettings.currencyNormalization,
    vitalsSettings.staffingNormalization,
  );
  return budgetActualsChartOptions.map((c) => makeBudgetActualsChartConfig(c));
}

export default function VitalsDashboard({
  districtDataMap,
  allSettings,
}: DistrictDataContentProps<VitalsSettings>) {
  const searchParams = useSearchParams();

  const result = makeDatasetFacetedDashboard(allSettings, componentsGenerator);
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const { components, gui } = result;

  const data = makeChartableVitals(districtDataMap, allSettings);
  const connectorOptions = data ? dfToJSONConnectorOptions(data) : {};

  const config = {
    gui,
    components,
    dataPool: {
      connectors: [
        {
          id: CONNECTOR_ID,
          type: "JSON",
          ...connectorOptions,
        },
      ],
    },
  };

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: newAllSettings => serializeDatasetSettings(newAllSettings, SERIALIZE_VITALS_SETTINGS_GENERATORS),
        serializeContext: x => "",
      }}
      allSettings={allSettings}
      contextSettings={DUMMY_BASE_SETTINGS}
      settingsContentsComponents={[DatasetSettingsContents]}
      contextSettingsComponents={[]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Vitals Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
