'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeChartableVitals } from 'utilities/ChartableMetrics';
import { makeDashboardGui } from './SummaryConfig';
import { useDistrictData } from '../DistrictDataProvider';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation'
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";

import type { BudgetActualsChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";


const CONNECTOR_ID = 'vitals-connector';

function makeRowCellConfigs(ccddd) : Array<BudgetActualsChartOptions> {
  return [
    {
      renderTo: 'enrollment-ba-history-chart',

      title: 'Enrollment',
      metricColumnRoot: `${ccddd}_enrollment`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',

      valueFormat: 'decimal',
      yLabel: 'AFTE',
    },
    {
      title: 'Staffing FTE',
      renderTo: 'staffing-ba-history-chart',
      metricColumnRoot: `${ccddd}_amount_staff_fte`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',

      valueFormat: 'decimal',
      yLabel: 'FTE',
    },
    {
      renderTo: 'cashflow-ba-history-chart',
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
      title: 'Beginning Balance',
      renderTo: 'beginning-balance-chart',
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

  const gui = makeDashboardGui();
  const components = makeRowCellConfigs(ccddd).map(c => makeBudgetActualsChart(c));

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
