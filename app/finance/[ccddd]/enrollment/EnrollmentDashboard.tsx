'use client'

import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import { useDanfo } from 'components/providers/DanfoProvider';
import { useEffect } from 'react';
import { useFinanceNavState } from 'components/providers/FinanceNavStateProvider';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import DistrictData from "utilities/DistrictData";
import merge from 'lodash.merge';

import type { DataFrame } from "danfojs";
import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

import "styles/hc-correlation.scss"


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
        cellClassName: `correlation-cell enrollment-correlation-cell`,
        rowClassName: `correlation-row enrollment-correlation-row`,
        rows: [
          {
            cells: [
              {
                id: 'enrollment-teaching-fte-correlation',
              },
              {
                id: 'enrollment-student-support-fte-correlation',
              },
              {
                id: 'enrollment-building-support-fte-correlation',
              },
              {
                id: 'enrollment-other-fte-correlation',
              },
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
        title: { text: 'Student AFTE'},
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
    dataPool: districtData.toplevel_metrics_datapool(),
    gui: makeDashboardGui(),
    components: [
      makeCorrelationGraph('enrollment-teaching-fte-correlation', 'Enrollment-Teaching FTE Correlation',
                           'enrollment', 'teaching_fte', ['actuals'], ['actuals']),

      makeCorrelationGraph('enrollment-student-support-fte-correlation', 'Enrollment-Student Support FTE Correlation',
                           'enrollment', 'student_support_fte', ['actuals'], ['actuals']),
      makeCorrelationGraph('enrollment-building-support-fte-correlation', 'Enrollment-Building Support FTE Correlation',
                           'enrollment', 'building_support_fte', ['actuals'], ['actuals']),
      makeCorrelationGraph('enrollment-other-fte-correlation', 'Enrollment-Other Staff FTE Correlation',
                           'enrollment', 'non_teaching_fte', ['actuals'], ['actuals']),

    ],
  };
}

async function loadData(dfd, dashboards, ccddd) {
  const districtData = await DistrictData.loadFromGcs(dfd, ccddd);
  dashboards.board('dashboard-charts-container', makeDashboardConfig(districtData));
}

export default function EnrollmentDashboard() {
  const { ccddd } = useFinanceNavState();
  const { highchartsObjs } = useHighcharts();
  const { dfd } = useDanfo();
  useEffect(() => {
    if (dfd.hasOwnProperty('readCSV') && highchartsObjs['dashboards']) {
      loadData(dfd, highchartsObjs['dashboards'], ccddd);
    }
  },
  [ccddd, highchartsObjs, dfd]);
  return (<div id="dashboard-charts-container" />);
}


