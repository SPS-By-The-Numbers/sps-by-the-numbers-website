'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeChartableVitals } from 'utilities/ChartableMetrics';
import { useDistrictData } from '../DistrictDataProvider';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation'
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import makeBudgetActualsChartConfig from "utilities/highcharts/ChartConfigGenerators";

import type { BudgetActualsChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";


const CONNECTOR_ID = 'vitals-connector';

function makeBudgetActualsChartOptions(ccddd) : Array<BudgetActualsChartOptions> {
  return [
    {
      renderTo: 'enrollment-chart',

      title: 'Enrollment',
      metricColumn: `${ccddd}_enrollment`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',
      xValueFormat: 'year',

      yValueFormat: 'decimal',
      yLabel: 'AFTE',
    },
  ];
}

function makeCorrelationChartOptions(ccddd) : Array<BudgetActualsChartOptions> {
  return [
    /*
    {
      renderTo: 'enrollment-cashflow',

      title: 'Enrollment-Cashflow Correlation',
      metricColumn: `${ccddd}_enrollment`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',
      xValueFormat: 'year',

      valueFormat: 'decimal',
      yLabel: 'AFTE',
    },
    */
  ];
}

export default function VitalsDashboard() {
  const { districtDataMap, loadCcddd } = useDistrictData();
  const searchParams = useSearchParams();
  const ccddd = parseInt(searchParams.get('ccddd') ?? '17001');

  const budgetActualsChartOptions = makeBudgetActualsChartOptions(ccddd);
  const correlationChartOptions = makeCorrelationChartOptions(ccddd);
  const components = [
    ...budgetActualsChartOptions.map(c => makeBudgetActualsChartConfig(c)),
    ...correlationChartOptions.map(c => makeBudgetActualsChartConfig(c)),
  ];
  const gui = { layouts: [{rows: [
    { cells: [{id: 'enrollment-chart'}, {id: 'enrollment-cashflow'}]},
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

