'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeBudgetActualsChartConfig, makeCorrelationChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { makeChartableVitals } from 'utilities/ChartableMetrics';
import { useDistrictData } from '../DistrictDataProvider';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import MetricVariantSelector from 'components/finance/MetricVariantSelector';

import type { BudgetActualsChartOptions, CorrelationChartOptions } from "utilities/highcharts/ChartConfigGenerators";
import type { MetricVariant } from 'components/finance/MetricVariantSelector';

const CONNECTOR_ID = 'vitals-connector';

function makeEnrollmentCashflowConfig(ccddd, name, columnSuffix, colorIndex) {
  return {
    renderTo: `enrollment-cashflow-${columnSuffix}`,
    title: `Enrollment-Cashflow Correlation (${name})`,
    connectorId: CONNECTOR_ID,
    xMetricColumn: `${ccddd}_enrollment`,
    xLabel: `${name} Enrollment AFTE`,
    xValueFormat: 'decimal' as const,

    yMetricColumn: `${ccddd}_cashflow`,
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

function makeCompCashflowConfig(ccddd, name, metricColumn, columnSuffix, colorIndex) {
  return {
    renderTo: `${metricColumn}-cashflow-${columnSuffix}`,
    title: `${name}-Cashflow Correlation (${columnSuffix})`,
    connectorId: CONNECTOR_ID,
    xMetricColumn: `${ccddd}_${metricColumn}`,
    xValueFormat: 'pctcomp' as const,

    yMetricColumn: `${ccddd}_cashflow`,
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

function makeFteCashflowConfig(ccddd, name, metricColumn, columnSuffix, colorIndex) {
  return {
    renderTo: `${metricColumn}-cashflow-${columnSuffix}`,
    title: `${name}-Cashflow Correlation (${columnSuffix})`,
    connectorId: CONNECTOR_ID,
    xMetricColumn: `${ccddd}_${metricColumn}`,
    xLabel: 'FTE',
    xValueFormat: 'decimal' as const,

    yMetricColumn: `${ccddd}_cashflow`,
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

function makeCorrelationChartOptions(ccddd) : Array<CorrelationChartOptions> {
  return [
    makeEnrollmentCashflowConfig(ccddd, 'Budget', 'budget', 2),
    makeEnrollmentCashflowConfig(ccddd, 'Actuals', 'actuals', 1),

    makeCompCashflowConfig(ccddd, 'Teaching Comp', 'teachingComp', 'actuals', 1),
    makeCompCashflowConfig(ccddd, 'Teaching Comp', 'teachingComp', 'budget', 2),
    makeCompCashflowConfig(ccddd, 'Student Support Comp', 'studentSupportComp', 'actuals', 1),
    makeCompCashflowConfig(ccddd, 'Student Support Comp', 'studentSupportComp', 'budget', 2),
    makeCompCashflowConfig(ccddd, 'Building Support Comp', 'buildingSupportComp', 'actuals', 1),
    makeCompCashflowConfig(ccddd, 'Building Support Comp', 'buildingSupportComp', 'budget', 2),
    makeCompCashflowConfig(ccddd, 'Other Comp', 'otherComp', 'actuals', 1),
    makeCompCashflowConfig(ccddd, 'Other Comp', 'otherComp', 'budget', 2),

    makeFteCashflowConfig(ccddd, 'Teaching Fte', 'amount_teaching_fte', 'actuals', 1),
    makeFteCashflowConfig(ccddd, 'Student Support Fte', 'amount_student_support_fte', 'actuals', 1),
    makeFteCashflowConfig(ccddd, 'Building Support Fte', 'amount_building_support_fte', 'actuals', 1),
    makeFteCashflowConfig(ccddd, 'Other Fte', 'amount_other_fte', 'actuals', 1),
  ];
}

export default function CashflowDashboard() {
  const { districtDataMap, loadCcddd } = useDistrictData();
  const searchParams = useSearchParams();
  const ccddd = parseInt(searchParams.get('ccddd') ?? '17001');
  const [metricVariant, setMetricVariant] = useState<MetricVariant>('pctcomp' as const);

  const correlationChartOptions = makeCorrelationChartOptions(ccddd);
  const components = [
    ...correlationChartOptions.map(c => makeCorrelationChartConfig(c)),
  ];
  const gui = { layouts: [{rows: [
    { cells: [{id: 'enrollment-cashflow-actuals'}, {id: 'enrollment-cashflow-budget'}]},

    { cells: [{id: 'teachingComp-cashflow-actuals'}, {id: 'teachingComp-cashflow-budget'}]},
    { cells: [{id: 'amount_teaching_fte-cashflow-actuals'}]},

    { cells: [{id: 'studentSupportComp-cashflow-actuals'}, {id: 'studentSupportComp-cashflow-budget'}]},
    { cells: [{id: 'amount_student_support_fte-cashflow-actuals'}]},

    { cells: [{id: 'buildingSupportComp-cashflow-actuals'}, {id: 'buildingSupportComp-cashflow-budget'}]},
    { cells: [{id: 'amount_building_support_fte-cashflow-actuals'}]},

    { cells: [{id: 'otherComp-cashflow-actuals'}, {id: 'otherComp-cashflow-budget'}]},
    { cells: [{id: 'amount_other_fte-cashflow-actuals'}]},

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
    <HcDashboard config={config} />
  );
}
