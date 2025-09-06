import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import merge from 'lodash.merge';

import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';
import type DistrictData from "utilities/DistrictData";

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
      tooltip: {
        useHTML: true,
        formatter: function() {
          return `
          <h2 class="hc-tooltip-header">${this.point.name}</h2>
          <table>
          <tr><th>${yMetric}<th><td class="hc-tooltip-data">${this.point.x.toLocaleString()}<td></tr>
          <tr><th>${xMetric}<th><td class="hc-tooltip-data">${this.point.y.toLocaleString()}<td></tr>
          </table>
          `;
        }
      },
      plotOptions: {
        scatter: {
          opacity: 0.5,
          marker: {
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
            name: 'class_of',
            'marker.radius': 'marker_radius',
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
              format: '{point.name}',
              crop: false,
              overflow: 'allow',
              allowOverlap: true,
            }
          }
      );
    }
  }
  return result;
}

export default function makeEnrollmentConfig(districtData : DistrictData) {
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
                           'enrollment', 'other_fte', ['actuals'], ['actuals']),

    ],
  };
}
