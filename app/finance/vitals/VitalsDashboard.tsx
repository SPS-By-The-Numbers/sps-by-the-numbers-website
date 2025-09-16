'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeChartableVitals } from 'utilities/ChartableMetrics';
import { makeBudgetActualsChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { useDistrictData } from '../DistrictDataProvider';
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import MetricVariantSelector from 'components/finance/MetricVariantSelector';
import Stack from '@mui/material/Stack';

import type { BudgetActualsChartOptions } from "utilities/highcharts/ChartConfigGenerators";
import type { MetricVariant } from 'components/finance/MetricVariantSelector';

const CONNECTOR_ID = 'vitals-connector';

function makeCell(renderTo, ccddd, metricColumnRoot, title, yValueFormat, yLabel ?: string) {
    return {
      renderTo,
      title,
      metricColumn: `${ccddd}_${metricColumnRoot}`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',
      xValueFormat: 'year' as const,

      yValueFormat,
      yLabel,
    };
}

function makeBudgetActualsChartOptions(ccddd, metricVariant) : Array<BudgetActualsChartOptions> {
  let compFormat = 'currency'

  if (metricVariant === 'pctcomp') {
    compFormat = 'pctcomp'
  }
  return [
    makeCell('enrollment-chart', ccddd, 'enrollment', 'Enrollment', 'decimal', 'AFTE'),
    makeCell('staffing-chart', ccddd, 'amount_staff_fte', 'Staffing FTE', 'decimal', 'FTE'),
    makeCell('cashflow-chart', ccddd, 'cashflow', 'Cashflow', 'currency', '$'),
    makeCell('beginning-balance-chart', ccddd, 'beginning_balance', 'Beginning Balance', 'currency'),
    makeCell('teaching-related-comp', ccddd, 'teachingComp', 'Teaching Related Comp', compFormat),
    makeCell('student-support-comp', ccddd, 'studentSupportComp', 'Student Support Comp', compFormat),
    makeCell('building-support-comp', ccddd, 'buildingSupportComp', 'Buildling Support Comp', compFormat),
    makeCell('other-comp', ccddd, 'otherComp', 'Other Comp', compFormat),
  ];
}

export default function VitalsDashboard() {
  const { districtDataMap, loadCcddd } = useDistrictData();
  const searchParams = useSearchParams();
  const ccddd = parseInt(searchParams.get('ccddd') ?? '17001');
  const [metricVariant, setMetricVariant] = useState<MetricVariant>('pctcomp' as const);

  const budgetActualsChartOptions = makeBudgetActualsChartOptions(ccddd, metricVariant);
  const components = budgetActualsChartOptions.map(c => makeBudgetActualsChartConfig(c));
  const gui = { layouts: [{rows: [
    { cells: [{id: 'enrollment-chart'}, {id: 'staffing-chart'}]},
    { cells: [{id: 'cashflow-chart'}, {id: 'beginning-balance-chart'}]},
    { cells: [{id: 'teaching-related-comp'}, {id: 'student-support-comp'}]},
    { cells: [{id: 'building-support-comp'}, {id: 'other-comp'}]},
    ]}]};


  // TODO: Pull this into a component.
  useEffect(
    () => { loadCcddd(ccddd); },
    [ccddd, loadCcddd]);

  if (!(ccddd in districtDataMap)) {
    return <Loading text="Loading dataset..." />
  }

  const districtData = districtDataMap[ccddd];
  const data = makeChartableVitals(
    ccddd,
    districtData.enrollmentSummary(),
    districtData.staffingSummary(),
    districtData.balances(),
    districtData.compensation(metricVariant),
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
    <Stack>
      <MetricVariantSelector
        label={`Key Expenditure Unit`}
        variant={metricVariant}
        onChange={newValue => setMetricVariant(newValue)}
      />
      <HcDashboard config={config} />
    </Stack>
  );
}
