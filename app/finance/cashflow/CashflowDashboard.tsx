'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeCorrelationChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeChartableVitals } from 'app/finance/vitals/ChartableVitals';
import { useSearchParams } from 'next/navigation'
import HcDashboard from 'components/HcDashboard';
import SettingsLayout from 'app/finance/_widgets/SettingsLayout';
import Typography from '@mui/material/Typography';
import MetricSettingsContents from 'app/finance/_widgets/MetricSettingsContents';

import type { CorrelationChartOptions } from "utilities/highcharts/ChartConfigGenerators";
import type { DistrictDataContentProps } from 'app/finance/_providers/DistrictDataProvider';
import type { MetricSettings } from 'app/finance/_widgets/MetricSettingsContents';

const CONNECTOR_ID = 'cashflow-connector';

export interface CashflowSettings extends MetricSettings {
};

function makeEnrollmentCashflowConfig(idPrefix, ccddd, name, columnSuffix, currencyNormalization, colorIndex) {
  return {
    renderTo: `${idPrefix}-enrollment-cashflow-${columnSuffix}`,
    title: `Enrollment-Cashflow Correlation (${name})`,
    connectorId: CONNECTOR_ID,
    xMetricColumn: `${idPrefix}_amount_enrollment`,
    xLabel: `${name} Enrollment AFTE`,
    xValueFormat: 'decimal' as const,

    yMetricColumn: `${idPrefix}_${currencyNormalization}_cashflow`,
    yLabel: `${name} Cashflow $`,
    yValueFormat: 'currency' as const,

    dataLabelColumn: 'class_of',
    seriesDefs: [
      {
        name,
        columnSuffix,
        colorIndex,
      },
    ]
  };
}

function makeCompCashflowConfig(idPrefix, ccddd, name, metricColumn, columnSuffix, colorIndex) {
  return {
    renderTo: `${idPrefix}-${metricColumn}-cashflow-${columnSuffix}`,
    title: `${name}-Cashflow Correlation (${columnSuffix})`,
    connectorId: CONNECTOR_ID,
    xMetricColumn: `${idPrefix}_${metricColumn}`,
    xValueFormat: 'pctcomp' as const,

    yMetricColumn: `${idPrefix}_amount_cashflow`,
    yLabel: `Cashflow $`,
    yValueFormat: 'currency' as const,

    dataLabelColumn: 'class_of',
    seriesDefs: [
      {
        name,
        columnSuffix,
        colorIndex,
      },
    ]
  };
}

function makeFteCashflowConfig(idPrefix, ccddd, name, metricColumn, columnSuffix, colorIndex) {
  return {
    renderTo: `${idPrefix}-${metricColumn}-cashflow-${columnSuffix}`,
    title: `${name}-Cashflow Correlation (${columnSuffix})`,
    connectorId: CONNECTOR_ID,
    xMetricColumn: `${idPrefix}_${metricColumn}`,
    xLabel: 'FTE',
    xValueFormat: 'decimal' as const,

    yMetricColumn: `${idPrefix}_amount_cashflow`,
    yLabel: `${columnSuffix} Cashflow $`,
    yValueFormat: 'currency' as const,

    dataLabelColumn: 'class_of',
    seriesDefs: [
      {
        name,
        columnSuffix,
        colorIndex,
      },
    ]
  };
}

function makeCorrelationChartOptions(idPrefix, ccddd, currencyNormalization, staffingNormalization) : Array<CorrelationChartOptions> {
  const retval = [
    makeEnrollmentCashflowConfig(idPrefix, ccddd, 'Budget', 'budget', currencyNormalization, 2),
    makeEnrollmentCashflowConfig(idPrefix, ccddd, 'Actuals', 'actuals', currencyNormalization, 1),

    makeCompCashflowConfig(idPrefix, ccddd, 'Teaching Comp', `${currencyNormalization}_teachingComp`, 'actuals', 1),
    makeCompCashflowConfig(idPrefix, ccddd, 'Teaching Comp', `${currencyNormalization}_teachingComp`, 'budget', 2),
    makeCompCashflowConfig(idPrefix, ccddd, 'Student Support Comp', `${currencyNormalization}_studentSupportComp`, 'actuals', 1),
    makeCompCashflowConfig(idPrefix, ccddd, 'Student Support Comp', `${currencyNormalization}_studentSupportComp`, 'budget', 2),
    makeCompCashflowConfig(idPrefix, ccddd, 'Building Support Comp', `${currencyNormalization}_buildingSupportComp`, 'actuals', 1),
    makeCompCashflowConfig(idPrefix, ccddd, 'Building Support Comp', `${currencyNormalization}_buildingSupportComp`, 'budget', 2),
    makeCompCashflowConfig(idPrefix, ccddd, 'Other Comp', `${currencyNormalization}_otherComp`, 'actuals', 1),
    makeCompCashflowConfig(idPrefix, ccddd, 'Other Comp', `${currencyNormalization}_otherComp`, 'budget', 2),

    makeFteCashflowConfig(idPrefix, ccddd, 'Teaching Fte', `${staffingNormalization}_teachingFte`, 'actuals', 1),
    makeFteCashflowConfig(idPrefix, ccddd, 'Student Support Fte', `${staffingNormalization}_studentSupportFte`, 'actuals', 1),
    makeFteCashflowConfig(idPrefix, ccddd, 'Building Support Fte', `${staffingNormalization}_buildingSupportFte`, 'actuals', 1),
    makeFteCashflowConfig(idPrefix, ccddd, 'Other Fte', `${staffingNormalization}_otherFte`, 'actuals', 1),
  ];

  return retval;
}

function componentsGenerator(cashflowSettings : CashflowSettings) {
  const correlationChartOptions = makeCorrelationChartOptions(
    cashflowSettings.id,
    cashflowSettings.ccddd,
    cashflowSettings.currencyNormalization,
    cashflowSettings.staffingNormalization);

  return correlationChartOptions.map(c => makeCorrelationChartConfig(c));
}

export default function CashflowDashboard({districtDataMap, allSettings, setAllSettings} : DistrictDataContentProps<CashflowSettings>) {
  const searchParams = useSearchParams();

  const result = makeDatasetFacetedDashboard(allSettings, componentsGenerator);
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const {components, gui} = result;

  const data = makeChartableVitals(districtDataMap, allSettings);
    
  const config = ({
    gui,
    components,
    dataPool: {
      connectors: [
        {
          id: CONNECTOR_ID,
          type: 'JSON',
          options: dfToJSONConnectorOptions(data),
        },
      ],
    },
  });


  return (
    <SettingsLayout
        allDatasetSettings={allSettings}
        setAllDatasetSettings={setAllSettings}
        settingsContentsComponents={[MetricSettingsContents]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Cashflow Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
