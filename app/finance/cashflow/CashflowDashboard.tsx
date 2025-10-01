'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeCorrelationChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeChartableVitals } from 'app/finance/vitals/ChartableVitals';
import { useDistrictData } from '../DistrictDataProvider';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import DistrictSelector from 'app/finance/DistrictSelector';
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import CurrencyNormalizationSelector from 'app/finance/CurrencyNormalizationSelector';
import SettingsLayout from 'app/finance/SettingsLayout';
import Typography from '@mui/material/Typography';
import VitalsSettingsContents from 'app/finance/vitals/VitalsSettingsContents';

import type { BudgetActualsChartOptions, CorrelationChartOptions } from "utilities/highcharts/ChartConfigGenerators";
import type { CurrencyNormalization } from 'utilities/ChartableMetrics';
import type { VitalsSettings } from 'app/finance/vitals/VitalsSettingsContents';

const CONNECTOR_ID = 'vitals-connector';

function makeEnrollmentCashflowConfig(idPrefix, ccddd, name, columnSuffix, currencyNormalization, colorIndex) {
  return {
    renderTo: `${idPrefix}-enrollment-cashflow-${columnSuffix}`,
    title: `Enrollment-Cashflow Correlation (${name})`,
    connectorId: CONNECTOR_ID,
    xMetricColumn: `${ccddd}_amount_enrollment`,
    xLabel: `${name} Enrollment AFTE`,
    xValueFormat: 'decimal' as const,

    yMetricColumn: `${ccddd}_${currencyNormalization}_cashflow`,
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
    xMetricColumn: `${ccddd}_${metricColumn}`,
    xValueFormat: 'pctcomp' as const,

    yMetricColumn: `${ccddd}_amount_cashflow`,
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
    xMetricColumn: `${ccddd}_${metricColumn}`,
    xLabel: 'FTE',
    xValueFormat: 'decimal' as const,

    yMetricColumn: `${ccddd}_amount_cashflow`,
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

function makeCorrelationChartOptions(idPrefix, ccddd, currencyNormalization, staffingNormalizaiton) : Array<CorrelationChartOptions> {
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

    makeFteCashflowConfig(idPrefix, ccddd, 'Teaching Fte', `${staffingNormalizaiton}_teachingFte`, 'actuals', 1),
    makeFteCashflowConfig(idPrefix, ccddd, 'Student Support Fte', `${staffingNormalizaiton}_studentSupportFte`, 'actuals', 1),
    makeFteCashflowConfig(idPrefix, ccddd, 'Building Support Fte', `${staffingNormalizaiton}_buildingSupportFte`, 'actuals', 1),
    makeFteCashflowConfig(idPrefix, ccddd, 'Other Fte', `${staffingNormalizaiton}_otherFte`, 'actuals', 1),
  ];

  return retval;
}

function componentsGenerator(vitalsSettings : VitalsSettings) {
  const correlationChartOptions = makeCorrelationChartOptions(
    vitalsSettings.id,
    vitalsSettings.ccddd,
    vitalsSettings.currencyNormalization,
    'amount' as const);

  return correlationChartOptions.map(c => makeCorrelationChartConfig(c));
}

export default function CashflowDashboard() {
  const {districtDataMap, loadCcddd} = useDistrictData();
  const searchParams = useSearchParams();
  const [allVitalsSettings, setAllVitalsSettings] = useState<Array<VitalsSettings>>([
    {
      name: 'SPS',
      id: 'foo',
      ccddd: 17001,
      currencyNormalization: 'amount' as const,
    },
    {
      name: 'SPS',
      id: 'foo2',
      ccddd: 17001,
      currencyNormalization: 'pctexp' as const,
    },
  ]);

  // TODO: Pull this into a component.
  useEffect(
    () => { 
      for (const settings of allVitalsSettings) {
        loadCcddd(settings.ccddd);
      }
    },
    [allVitalsSettings, loadCcddd]);

  for (const vitalsSettings of allVitalsSettings) {
    if (!(vitalsSettings.ccddd in districtDataMap)) {
      return <Loading text="Loading dataset..." />
    }
  }

  const result = makeDatasetFacetedDashboard(allVitalsSettings, componentsGenerator);
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const {components, gui} = result;

  const data = makeChartableVitals(districtDataMap, allVitalsSettings);
  console.log(data);
  console.log(components);
    
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
        allDatasetSettings={allVitalsSettings}
        setAllDatasetSettings={setAllVitalsSettings}
        SettingsRenderComponent={VitalsSettingsContents}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Cashflow Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
