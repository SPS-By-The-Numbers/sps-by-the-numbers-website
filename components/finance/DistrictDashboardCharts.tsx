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
  const new_df = df.round(2);
  new_df.addColumn(
    'covid_shape',
    new_df["class_of"].apply((year) => {
      if (year < 2020) {
        return 'triangle-down';
      } else if (year < 2022) {
        return 'square';
      } else {
        return 'triangle';
      }
    }),
    { inplace: true }
  );

  return {
    firstRowAsNames: false,
    columnNames: new_df.columns,
    data: new_df.values,
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
                id: 'deficit-enrollment-correlation',
              },
              {
                id: 'deficit-teaching-fte-correlation',
              },
            ],
          },
          {
            cells: [
              {
                id: 'deficit-student-support-fte-correlation',
              },
              {
                id: 'deficit-building-support-fte-correlation',
              },
            ]
          },
          {
            cells: [
              {
                id: 'deficit-other-fte-correlation',
              },
            ],
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

function makeCorrelationGraph(target_id, title, yMetric, xMetric,
                              ySeriesIds=['budget', 'actuals'],
                              xSeriesIds=['budget', 'actuals'],
                              colorIndexMap={
                                actuals: 1,
                                budget: 2,
                              }) {
  const result = {
    connector: {
      id: 'c-toplevel-metrics',
      columnAssignment: [] as Array<object>,
    },
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    cell: target_id,
    type: 'Highcharts',
    chartOptions: merge({}, baselineClassOfChartOptions, {
      chart: {
        type:'scatter',
      },
      yAxis: {
        title: { text: '# students Headcount maybe?'},
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true,
      },
      xAxis: {
        type: 'linear',
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true,
      },
      title: {
        text: title,
      },
      series: [] as Array<object>,
      legend: {
        floating: false,
      },
      plotOptions: {
        scatter: {
          opacity: 0.5,
          marker: {
            radius: 2.5,
            symbol: "circle",
            states: {
              hover: {
                enabled: true,
                lineColor: "rgb(100,100,100)"
              }
            }
          },
        },
      },
    }),
  };

  for (const yKind of ySeriesIds) {
    for (const xKind of xSeriesIds) {
      result.connector.columnAssignment.push(
        {
          seriesId: yKind,
          data: {
            x: `${xMetric}_${xKind}`,
            y: `${yMetric}_${yKind}`,
            class_of: 'class_of',
            'marker.radius': 'covid_type',
            'marker.symbol': 'covid_shape',
          },
        }
      );
      result.chartOptions.series.push(
          {
            id: yKind,
            name: yKind,
            colorIndex: colorIndexMap[yKind],
            dataLabels: {
              enabled: true,
              format: '{point.class_of}'
            }
          }
      );
    }
  }
  return result;
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
      makeCorrelationGraph('deficit-enrollment-correlation', 'Deficit-Enrollment Correlation',
                           'cashflow', 'enrollment'),
      makeCorrelationGraph('deficit-teaching-fte-correlation', 'Deficit-Teaching FTE Correlation',
                           'enrollment', 'teaching_fte', ['actuals'], ['actuals']),

      makeCorrelationGraph('deficit-student-support-fte-correlation', 'Deficit-Student Support FTE Correlation',
                           'enrollment', 'student_support_fte', ['actuals'], ['actuals']),
      makeCorrelationGraph('deficit-building-support-fte-correlation', 'Deficit-Building Support FTE Correlation',
                           'enrollment', 'building_support_fte', ['actuals'], ['actuals']),
      makeCorrelationGraph('deficit-other-fte-correlation', 'Deficit-Other Staff FTE Correlation',
                           'enrollment', 'non_teaching_fte', ['actuals'], ['actuals']),

      makeExpenditureGraph('key-expenditures-amt', 'amt'),
      makeExpenditureGraph('key-expenditures-pct', 'pct_expenditure'),
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

