'use client'

import merge from 'lodash.merge';

import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import { useDanfo } from 'components/providers/DanfoProvider';
import { useEffect } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import BudgetActualsHistoryComponents from "utilities/highcharts/panels/BudgetActualsHistoryComponents";
import DistrictData from "utilities/DistrictData";
import MetricHistoryPanelFactory from "utilities/highcharts/panels/MetricHistoryPanelFactory";
import SingleMetricHistoryComponents from "utilities/highcharts/panels/SingleMetricHistoryComponents";

import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

import type { DataFrame } from "danfojs";

import "styles/district-dashboard.scss"

const enrollmentPanelFactory = new MetricHistoryPanelFactory(
  {
    metricName: 'enrollment',
  },
  new BudgetActualsHistoryComponents({
    title: 'Enrollment',
    metricColumnRoot: 'enrollment',
    keyStatFormat: 'decimal',
    xAxisName: 'class_of',
    connectorId: 'c-toplevel-metrics',
    yUnits: 'AFTE',
    tooltip: {
      valueDecimals: 2
    },
  })
);

const cashflowPanelFactory = new MetricHistoryPanelFactory(
  {
    metricName: 'cashflow',
  },
  new BudgetActualsHistoryComponents({
    title: 'Cashflow',
    metricColumnRoot: 'cashflow',
    keyStatFormat: 'currency',
    xAxisName: 'class_of',
    connectorId: 'c-toplevel-metrics',
    yUnits: '$',
    tooltip: {
      valuePrefix: "$",
      valueDecimals: 2
    },
  })
);

const staffingPanelFactory = new MetricHistoryPanelFactory(
  {
    metricName: 'staff_fte',
  },
  new BudgetActualsHistoryComponents({
    title: 'Staffing',
    metricColumnRoot: 'staff_fte',
    keyStatFormat: 'decimal',
    xAxisName: 'class_of',
    connectorId: 'c-toplevel-metrics',
    yUnits: 'FTE',
    tooltip: {
      valueDecimals: 2
    },
  })
);


// Converts a danfo dataframe into a set of rows for a Highcharts DataTable.
function danfoToJsonOptions(df: DataFrame) {
  return {
    firstRowAsNames: false,
    columnNames: df.columns,
    data: df.round(2).values
  };
}

function makeDashboardDatapool(districtData: DistrictData) {

  return {
    connectors: [
      {
        id: 'c-toplevel-metrics',
        type: 'JSON',
        options: danfoToJsonOptions(districtData.toplevel_metrics()),
      },
      {
        id: 'c-spend-type',
        type: 'JSON',
        options: {
          firstRowAsNames: false,
          columnNames: ["Spend Type", "Budget", "Actuals"],
          data: [
            ['Non-Compensation Spending', 175420766.00, 204390909.24],
            ['School-allocated Staffing', 634579723.00, 620153637.87],
            ['"District Office" Staffing', 362568512.00, 313743583.96],
          ],
        },
      },
    ],
  };
}

// Main question per district is how it has changed over time.
//
//   // How much should the district be taking up
//   Key inputs: Enrollment
//
//   // How does that translate to money.
//   Revenue vs Expenditures (with variance)
//
//   // What is District-Office overhead as % of expenditure over time.
//   GF Balance with (with variance)
//
//   // Per-pupil spend with breakout of District Office vs non and sub-breakout
//   // of purchased services vs compensation.
//   Per-pupil spend graph.
//
//   // Detailed expenditure examination of comp vs non-comp (% of expenditrue).
//   * Split to break down by activity, program, etc.
function makeDashboardGui() {
  return {
    layouts: [
      {
        rows: [
          enrollmentPanelFactory.makeLayout(),
          cashflowPanelFactory.makeLayout(),
          staffingPanelFactory.makeLayout(),
          {
            cells: [
              {
                id: 'cashflow',
              },
            ]
          },
          {
            cells: [
              {
                id: 'key-expenditures-amt',
              },
              {
                id: 'key-expenditures-pct',
              }
            ],
          },
          {
            cells: [
              {
                id: 'per-pupil-expenditure',
              },
            ]
          },
          {
            cells: [
              {
                id: 'expenditure-detail',
              },
            ]
          },
        ],
      },
    ],
  };
}

function pctFormater() {
  return (this.value * 100) + '%';
}

function makeExpenditureGraph(target_id, pct_or_amt) {
  const yAxis = {};
  const tooltip = {};
  if (pct_or_amt == 'pct_expenditure') {
    yAxis['min'] = 0;
    yAxis['max'] = 1;
    yAxis['title'] = {'text': "% of Expenditure"};
    yAxis['labels'] = {'formatter': pctFormater };
    tooltip['formatter'] = function() { return `${(this.y * 100).toFixed(1)}%` };
  } else {
    yAxis['title'] = {'text': "$"};
    tooltip['valuePrefix'] = '$';
  }

  return {
    connector: {
      id: 'c-toplevel-metrics',
      columnAssignment: [
        {
          seriesId: `teaching_related_comp_${pct_or_amt}_budget`,
          data: ['class_of', `teaching_related_comp_${pct_or_amt}_budget`],
        },
        {
          seriesId: `teaching_related_comp_${pct_or_amt}_actuals`,
          data: ['class_of', `teaching_related_comp_${pct_or_amt}_actuals`],
        },
      ]
    },
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    cell: target_id,
    type: 'Highcharts',
    chartOptions: merge({}, baselineClassOfChartOptions, {
      yAxis,
      title: {
        text: "Teaching Related",
      },
      series: [
        {
          id: `teaching_related_comp_${pct_or_amt}_budget`,
          name: 'Teaching Related Comp (Budget)',
        },
        {
          id: `teaching_related_comp_${pct_or_amt}_actuals`,
          name: 'Teaching Related Comp (Actuals)',
          pointPadding: 0.27,
        },
      ],
      plotOptions: {
        series: {
          grouping: false,
          shadow: false,
          borderWidth: 0,
        }
      },
      tooltip,
    }),
  };
}

function makeDashboardConfig(districtData : DistrictData) {
  return {
    editMode: {
      enabled: true,
      contextMenu: {
        enabled: true,
        items: ['editMode'],
      },
    },
    dataPool: makeDashboardDatapool(districtData),
    gui: makeDashboardGui(),
    components: [
      ...enrollmentPanelFactory.makeComponents(),
      ...cashflowPanelFactory.makeComponents(),
      ...staffingPanelFactory.makeComponents(),
      makeExpenditureGraph('key-expenditures-amt', 'amt'),
      makeExpenditureGraph('key-expenditures-pct', 'pct_expenditure'),
//      makeMockComponent('per-pupil-expenditure'),
//      makeMockComponent('expenditure-detail'),
    ],
  };
}

async function loadData(dfd, dashboards, ccddd) {
  const districtData = await DistrictData.loadFromGcs(dfd, ccddd);
  dashboards.board('dashboard-charts-container', makeDashboardConfig(districtData));
}

export default function DistrictDashboardCharts({ccddd}) {
  const { highchartsObjs } = useHighcharts();
  const { dfd } = useDanfo();
  useEffect(() => {
    if (dfd.hasOwnProperty('readCSV')) {
      loadData(dfd, highchartsObjs['dashboards'], ccddd);
    }
  },
  [ccddd, highchartsObjs, dfd]);
  return (<div id="dashboard-charts-container" />);
}

