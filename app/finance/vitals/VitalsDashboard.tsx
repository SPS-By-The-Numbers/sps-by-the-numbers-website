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
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";

import type { BudgetActualsChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";


const CONNECTOR_ID = 'vitals-connector';

function makeRowCellConfigs(ccddd) : Array<BudgetActualsChartOptions> {
  return [
    {
      renderTo: 'enrollment-chart',

      title: 'Enrollment',
      metricColumnRoot: `${ccddd}_enrollment`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',

      valueFormat: 'decimal',
      yLabel: 'AFTE',
    },
    {
      renderTo: 'staffing-chart',

      title: 'Staffing FTE',
      metricColumnRoot: `${ccddd}_amount_staff_fte`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',

      valueFormat: 'decimal',
      yLabel: 'FTE',
    },
    {
      renderTo: 'cashflow-chart',

      title: 'Cashflow',
      metricColumnRoot: `${ccddd}_cashflow`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',

      valueFormat: 'currency',

      tooltip: {
        valuePrefix: "$",
      },
    },
    {
      renderTo: 'beginning-balance-chart',

      title: 'Beginning Balance',
      metricColumnRoot: `${ccddd}_beginning_balance`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',

      valueFormat: 'currency',
    },
  ];
}

export default function VitalsDashboard() {
  const { districtDataMap, loadCcddd } = useDistrictData();
  const searchParams = useSearchParams();
  const ccddd = parseInt(searchParams.get('ccddd') ?? '17001');

  const rowCellConfigs = makeRowCellConfigs(ccddd);
  const components = rowCellConfigs.map(c => makeBudgetActualsChart(c));
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
