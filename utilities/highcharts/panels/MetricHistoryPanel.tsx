import merge from 'lodash.merge';

import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";

// Produces a composite entry for a highchart dashboard layout cell.
export function makeGui(metricName) {
  return {
    cells: [{
      id: `${metricName}-panel`,
      layout: {
        cellClassName: `metric-history-cell ${metricName}-metric-history-cell`,
        rowClassName: `metric-history-row ${metricName}-metric-history-row`,
        rows: [
          {
            cells: [{ id: `${metricName}-metric-history-header` }]
          },
          {
            cells: [
              { id: `${metricName}-metric-history-key-stats`, style: { maxWidth: '15em' } },
              { id: `${metricName}-metric-history-chart`, },
            ]
          },
        ],
      },
    }],
  };
}

export function makeComponents(metricName, title, columnName, connectorId) {
  return [
      {
        cell: `${metricName}-metric-history-header`,
        type: 'HTML',
        className: 'metric-history-header',
        elements: [{
          tagName: 'h1',
          textContent: title,
          attributes: {
            id: `${metricName}-metric-history-title`,
          }
        }]
      },
      {
        cell: `${metricName}-metric-history-key-stats`,
        type: 'KeyStats',
        columnName,
        connector: {
            id: connectorId,
        },
      },
      {
        cell: `${metricName}-metric-history-chart`,
        type: 'Highcharts',
        sync: {
          visibility: true,
          highlight: true,
          extremes: true,
        },
        connector: {
          id: connectorId,
          columnAssignment: [
            {
              seriesId: columnName,
              data: ['school_starting_year', columnName],
            }
          ],
        },
        chartOptions: merge({}, baselineClassOfChartOptions, {
          title: null,
          yAxis: {
            title: {
              text: 'AFTE',
            },
          },
          series: [
            {
              id: columnName,
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
      }
  ];
}
