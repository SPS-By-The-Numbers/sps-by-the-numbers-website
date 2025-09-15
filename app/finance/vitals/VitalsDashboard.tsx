'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeChartableVitals } from 'utilities/ChartableMetrics';
import { makeBudgetActualsChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { useDistrictData } from '../DistrictDataProvider';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation'
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import type { BudgetActualsChartOptions } from "utilities/highcharts/ChartConfigGenerators";


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
    {
      renderTo: 'staffing-chart',

      title: 'Staffing FTE',
      metricColumn: `${ccddd}_amount_staff_fte`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',
      xValueFormat: 'year',

      yValueFormat: 'decimal',
      yLabel: 'FTE',
    },
    {
      renderTo: 'cashflow-chart',

      title: 'Cashflow',
      metricColumn: `${ccddd}_cashflow`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',
      xValueFormat: 'year',

      yValueFormat: 'currency',

      tooltip: {
        valuePrefix: "$",
      },
    },
    {
      renderTo: 'beginning-balance-chart',

      title: 'Beginning Balance',
      metricColumn: `${ccddd}_beginning_balance`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',
      xValueFormat: 'year',

      yValueFormat: 'currency',
    },
  ];
}

export default function VitalsDashboard() {
  const { districtDataMap, loadCcddd } = useDistrictData();
  const searchParams = useSearchParams();
  const ccddd = parseInt(searchParams.get('ccddd') ?? '17001');

  const budgetActualsChartOptions = makeBudgetActualsChartOptions(ccddd);
  const components = budgetActualsChartOptions.map(c => makeBudgetActualsChartConfig(c));
  const gui = { layouts: [{rows: [
    { cells: [{id: 'enrollment-chart'}, {id: 'staffing-chart'}]},
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
