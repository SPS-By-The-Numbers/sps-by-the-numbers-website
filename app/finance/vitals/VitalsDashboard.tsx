"use client";

import { dfToJSONConnectorOptions } from "utilities/highcharts/utils";
import { SERIALIZE_VITALS_SETTINGS_GENERATORS } from "./VitalsPage";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { SERIALIZE_VITALS_CONTEXT_SETTINGS_GENERATORS } from "./VitalsPage";
import { makeBudgetActualsChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { BUDGET_REVISED_ACTUALS_SERIES } from "utilities/highcharts/SeriesSpecs";
import { makeChartableVitals } from "utilities/ChartableVitals";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { useSearchParams } from "next/navigation";
import ChartsEnabledContents from "app/finance/_widgets/ChartsEnabledContents";
import HcDashboard from "components/HcDashboard";
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";

import type { CommonContextSettings } from "app/finance/_settings/common_context_settings";

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

function componentsGenerator(vitalsSettings: VitalsSettings, data) {
  const budgetActualsChartOptions = makeBudgetActualsChartOptions(
    vitalsSettings.id,
    vitalsSettings.currencyNormalization,
    vitalsSettings.staffingNormalization,
  );
  // Declare all three series on every cell; filterSpecsWithData drops
  // Revised Budget from the cells whose metric it can't cover (staffing,
  // enrollment, comp breakouts).
  return budgetActualsChartOptions.map((c) =>
    makeBudgetActualsChartConfig({
      ...c,
      seriesSpecs: BUDGET_REVISED_ACTUALS_SERIES,
      data,
    }),
  );
}

export default function VitalsDashboard({
  districtDataMap,
  allSettings,
  contextSettings,
}: DistrictDataContentProps<VitalsSettings, CommonContextSettings>) {
  const searchParams = useSearchParams();

  const config = (() => {
    if (contextSettings.chartsEnabled === false) return null;
    // Build the dataframe first: the chart configs inspect it to decide
    // which declared series actually have data.
    const data = makeChartableVitals(districtDataMap, allSettings);
    const result = makeDatasetFacetedDashboard(allSettings, (s) =>
      componentsGenerator(s, data),
    );
    if (result === undefined) return null;
    const { components, gui } = result;

    const connectorOptions = data ? dfToJSONConnectorOptions(data) : {};

    return {
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
  })();

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: newAllSettings => serializeDatasetSettings(newAllSettings, SERIALIZE_VITALS_SETTINGS_GENERATORS),
        serializeContext: context => serializeOneSetting(context, SERIALIZE_VITALS_CONTEXT_SETTINGS_GENERATORS),
      }}
      allSettings={allSettings}
      contextSettings={contextSettings}
      settingsContentsComponents={[DatasetSettingsContents]}
      contextSettingsComponents={[ChartsEnabledContents]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Vitals Dashboard
      </Typography>
      {config && <HcDashboard config={config} />}
    </SettingsLayout>
  );
}
