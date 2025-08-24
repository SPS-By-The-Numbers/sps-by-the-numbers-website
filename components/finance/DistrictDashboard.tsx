'use client'

import merge from 'lodash.merge';

import '@highcharts/dashboards/es-modules/masters/modules/layout.src.js';
import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import { useEffect } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import * as dfd from "danfojs";
import BudgetActualsHistoryComponents from "utilities/highcharts/panels/BudgetActualsHistoryComponents";
import DistrictData from "utilities/DistrictData";
import MetricHistoryPanelFactory from "utilities/highcharts/panels/MetricHistoryPanelFactory";
import SingleMetricHistoryComponents from "utilities/highcharts/panels/SingleMetricHistoryComponents";

import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

import "styles/district-dashboard.scss"

const enrollmentPanelFactory = new MetricHistoryPanelFactory(
  {
    metricName: 'enrollment',
  },
  new SingleMetricHistoryComponents({
    title: 'Enrollment',
    columnName: 'total_enrollment',
    xAxisName: 'class_of',
    connectorId: 'c-toplevel-metrics',
    seriesLabel: 'Total Enrollment (AFTE)',
    yUnits: 'Annual Full-Time Enrolled (AFTE)',
  })
);

const cashflowPanelFactory = new MetricHistoryPanelFactory(
  {
    metricName: 'cashflow',
  },
  new BudgetActualsHistoryComponents({
    title: 'Cashflow',
    seriesLabel: 'Cashflow',
    metricColumnRoot: 'cashflow',
    xAxisName: 'class_of',
    connectorId: 'c-toplevel-metrics',
  })
);


// Converts a danfo dataframe into a set of rows for a Highcharts DataTable.
function danfoToJsonOptions(df: dfd.DataFrame) {
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

function makeMockComponent(target_id) {
  return {
    connector: {
      id: 'c-spend-type',
    },
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    cell: target_id,
    type: 'Highcharts',
    chartOptions: {
      xAxis: {
        type: 'category',
        accessibility: {
          description: 'Spending Type',
        },
      },
      yAxis: {
        title: {
          text: 'Amount ($)',
        },
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          marker: {
            radius: 8,
          },
        },
      },
      legend: {
        enabled: true,
        verticalAlign: 'top',
      },
      chart: {
        animation: false,
        styledMode: true,
        type: 'bar',
        spacing: [30, 30, 30, 20],
      },
      title: {
        text: 'Spending Allocation',
      },
      tooltip: {
        valuePrefix: '$',
        stickOnContact: true,
      },
    },
  };
}

function makeEnrollmentGraph(target_id) {
  return {
    cell: target_id,
    type: 'Highcharts',
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    connector: {
      id: 'c-toplevel-metrics',
      columnAssignment: [
        {
          seriesId: 'total_enrollment',
          data: ['class_of', 'total_enrollment'],
        }
      ],
    },
    chartOptions: merge({}, baselineClassOfChartOptions, {
      yAxis: {
        title: {
          text: 'AFTE',
        },
      },
      title: {
        text: "Historical Enrollment",
      },
      series: [
        {
          id: 'total_enrollment',
          name: 'Total Enrollment in AAFTE',
          colorIndex: 1,
        }
      ],
      tooltip: {
        valueSuffix: ' AFTE',
      },
      legend: {
        enabled: false,
      },
    }),
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
        text: "Expenditures by Big categories",
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
      makeExpenditureGraph('key-expenditures-amt', 'amt'),
      makeExpenditureGraph('key-expenditures-pct', 'pct_expenditure'),
//      makeMockComponent('per-pupil-expenditure'),
//      makeMockComponent('expenditure-detail'),
    ],
  };
}

async function loadData(dashboards) {
  const districtData = await DistrictData.loadFromGcs(dfd, 17001);
  dashboards.board('container', makeDashboardConfig(districtData));
}

export default function DistrictDashboard() {
  const { highchartsObjs } = useHighcharts();
  useEffect(() => {
    loadData(highchartsObjs['dashboards'])
  },
  []);
  return (<div id="container" />);
}

