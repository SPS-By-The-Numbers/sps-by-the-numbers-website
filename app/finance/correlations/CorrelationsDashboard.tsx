"use client";

import { dfToJSONConnectorOptions } from "utilities/highcharts/utils";
import { makeCorrelationChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeChartableVitals } from "utilities/ChartableVitals";
import { useSearchParams } from "next/navigation";
import HcDashboard from "components/HcDashboard";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";
import MetricSettingsContents from "app/finance/_widgets/MetricSettingsContents";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { CorrelationChartOptions } from "utilities/highcharts/ChartConfigGenerators";
import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { MetricSettings } from "app/finance/_settings/metric_settings";

const CONNECTOR_ID = "cashflow-connector";

export interface CorrelationsSettings extends MetricSettings {
  // TODO: Change x-axis.
}

function makeFundedEnrollmentCashflowConfig(
  idPrefix,
  ccddd,
  name,
  columnSuffix,
  currencyNormalization,
  colorIndex,
) {
  return {
    renderTo: `c-${idPrefix}-fundedEnrollment-cashflow-${columnSuffix}`,
    title: `Funded Enrollment-Cashflow Correlation (${name})`,
    connectorId: CONNECTOR_ID,
    yMetricColumn: `${idPrefix}_amount_fundedEnrollment`,
    yLabel: `${name} Funded Enrollment AAFTE`,
    yValueFormat: "decimal" as const,

    xMetricColumn: `${idPrefix}_${currencyNormalization}_cashflow`,
    xLabel: `${name} Cashflow $`,
    xValueFormat: "currency" as const,

    dataLabelColumn: "class_of",
    seriesDefs: [
      {
        name,
        columnSuffix,
        colorIndex,
      },
    ],
  };
}

function makeCompCashflowConfig(
  idPrefix,
  ccddd,
  name,
  metricColumn,
  columnSuffix,
  colorIndex,
) {
  return {
    renderTo: `c-${idPrefix}-${metricColumn}-cashflow-${columnSuffix}`,
    title: `${name}-Cashflow Correlation (${columnSuffix})`,
    connectorId: CONNECTOR_ID,
    yMetricColumn: `${idPrefix}_${metricColumn}`,
    yValueFormat: "currency" as const,

    xMetricColumn: `${idPrefix}_amount_cashflow`,
    xLabel: `Cashflow $`,
    xValueFormat: "currency" as const,

    dataLabelColumn: "class_of",
    seriesDefs: [
      {
        name,
        columnSuffix,
        colorIndex,
      },
    ],
  };
}

function makeFteEnrollmentConfig(
  idPrefix,
  ccddd,
  name,
  metricColumn,
  columnSuffix,
  colorIndex,
) {
  return {
    renderTo: `c-${idPrefix}-${metricColumn}-cashflow-${columnSuffix}`,
    title: `${name}-Enrollment Correlation (${columnSuffix})`,
    connectorId: CONNECTOR_ID,
    yMetricColumn: `${idPrefix}_${metricColumn}`,
    yLabel: "FTE",
    yValueFormat: "decimal" as const,

    xMetricColumn: `${idPrefix}_amount_fundedEnrollment`,
    xLabel: `${name} Funded Enrollment AFTE`,
    xValueFormat: "decimal" as const,

    dataLabelColumn: "class_of",
    seriesDefs: [
      {
        name,
        columnSuffix,
        colorIndex,
      },
    ],
  };
}

function makeCorrelationChartOptions(
  idPrefix,
  ccddd,
  currencyNormalization,
  staffingNormalization,
): Array<CorrelationChartOptions> {
  const retval = [
    makeFteEnrollmentConfig(
      idPrefix,
      ccddd,
      "Teaching Fte",
      `${staffingNormalization}_teachingFte`,
      "actuals",
      1,
    ),
    makeFteEnrollmentConfig(
      idPrefix,
      ccddd,
      "Student Support Fte",
      `${staffingNormalization}_studentSupportFte`,
      "actuals",
      1,
    ),
    makeFteEnrollmentConfig(
      idPrefix,
      ccddd,
      "Building Support Fte",
      `${staffingNormalization}_buildingSupportFte`,
      "actuals",
      1,
    ),
    makeFteEnrollmentConfig(
      idPrefix,
      ccddd,
      "Other Fte",
      `${staffingNormalization}_otherFte`,
      "actuals",
      1,
    ),

    makeFundedEnrollmentCashflowConfig(
      idPrefix,
      ccddd,
      "Budget",
      "budget",
      currencyNormalization,
      2,
    ),
    makeFundedEnrollmentCashflowConfig(
      idPrefix,
      ccddd,
      "Actuals",
      "actuals",
      currencyNormalization,
      1,
    ),
  ];

  return retval;
}

function componentsGenerator(correlationsSettings: CorrelationsSettings) {
  const correlationChartOptions = makeCorrelationChartOptions(
    correlationsSettings.id,
    correlationsSettings.ccddd,
    correlationsSettings.currencyNormalization,
    correlationsSettings.staffingNormalization,
  );

  return correlationChartOptions.map((c) => makeCorrelationChartConfig(c));
}

export default function CorrelationsDashboard({
  districtDataMap,
  allSettings,
  sharedSettings,
}: DistrictDataContentProps<CorrelationsSettings, BaseSettings>) {
  const searchParams = useSearchParams();

  const result = makeDatasetFacetedDashboard(allSettings, componentsGenerator);
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const { components, gui } = result;

  const data = makeChartableVitals(districtDataMap, allSettings);

  const config = {
    gui,
    components,
    dataPool: {
      connectors: [
        {
          id: CONNECTOR_ID,
          type: "JSON",
          options: dfToJSONConnectorOptions(data),
        },
      ],
    },
  };

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: x => [],
        serializeShared: x => "",
      }}
      allSettings={allSettings}
      sharedSettings={sharedSettings}
      settingsContentsComponents={[MetricSettingsContents]}
      sharedSettingsComponents={[]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Cashflow Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
