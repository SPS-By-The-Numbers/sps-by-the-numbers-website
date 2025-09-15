'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeBudgetActualsChartConfig, makeCorrelationChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { makeChartableVitals } from 'utilities/ChartableMetrics';
import { useDistrictData } from '../DistrictDataProvider';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation'
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import type { BudgetActualsChartOptions, CorrelationChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";


const CONNECTOR_ID = 'vitals-connector';

function makeEnrollmentCashflowConfig(ccddd, name, columnSuffix, colorIndex) {
  return {
    renderTo: `enrollment-cashflow-${columnSuffix}`,
    title: `Enrollment-Cashflow Correlation (${name})`,
    connectorId: CONNECTOR_ID,
    xMetricColumn: `${ccddd}_enrollment`,
    xLabel: `${name} Enrollment AFTE`,
    xValueFormat: 'decimal',

    yMetricColumn: `${ccddd}_cashflow`,
    yLabel: `${name} Cashflow $`,

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

function makeCorrelationChartOptions(ccddd) : Array<CorrelationChartOptions> {
  return [
    makeEnrollmentCashflowConfig(ccddd, 'Budget', 'budget', 2),
    makeEnrollmentCashflowConfig(ccddd, 'Actuals', 'actuals', 1),
  ];
}

export default function VitalsDashboard() {
  const { districtDataMap, loadCcddd } = useDistrictData();
  const searchParams = useSearchParams();
  const ccddd = parseInt(searchParams.get('ccddd') ?? '17001');

  const correlationChartOptions = makeCorrelationChartOptions(ccddd);
  const components = [
    ...correlationChartOptions.map(c => makeCorrelationChartConfig(c)),
  ];
  const gui = { layouts: [{rows: [
    { cells: [{id: 'enrollment-cashflow-actuals'}, {id: 'enrollment-cashflow-budget'}]},
    { cells: [{id: 'cashflow-chart'}, {id: 'beginning-balance-chart'}]},
    ]}]};


  // TODO: Pull this into a component.
  useEffect(
    () => { loadCcddd(ccddd); },
    [ccddd]);

  if (!(ccddd in districtDataMap)) {
    return <Loading text="Loading dataset..." />
  }

  const districtData = districtDataMap[ccddd];
  const data = makeChartableVitals(
    ccddd,
    districtData.enrollment(),
    districtData.staffing(),
    districtData.balances()
  );

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
    <HcDashboard config={config} />
  );
}

