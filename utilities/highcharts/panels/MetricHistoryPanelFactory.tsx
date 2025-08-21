import merge from 'lodash.merge';

import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";

type MetricHistoryPanelFactoryOptions = {
  metricName : string;
  title : string;
  xAxisName : string;
  columnName : string;
  connectorId : string;
};

export default class MetricHistoryPanelFactory {
  constructor(options : MetricHistoryPanelFactoryOptions) {
    this.options = options;
  }

  // Produces a composite entry for a highchart dashboard layout cell.
  makeLayout() {
    return {
      cells: [{
        id: `${this.options.metricName}-panel`,
        layout: {
          cellClassName: `metric-history-cell ${this.options.metricName}-metric-history-cell`,
          rowClassName: `metric-history-row ${this.options.metricName}-metric-history-row`,
          rows: [
            {
              cells: [{ id: `${this.options.metricName}-metric-history-header` }]
            },
            {
              cells: [
                { id: `${this.options.metricName}-metric-history-key-stats`, style: { maxWidth: '15em' } },
                { id: `${this.options.metricName}-metric-history-chart`, },
              ]
            },
          ],
        },
      }],
    };
  }

  makeComponents() {
    return [
        {
          cell: `${this.options.metricName}-metric-history-header`,
          type: 'HTML',
          className: 'metric-history-header',
          elements: [{
            tagName: 'h1',
            textContent: this.options.title,
            attributes: {
              id: `${this.options.metricName}-metric-history-title`,
            }
          }]
        },
        {
          cell: `${this.options.metricName}-metric-history-key-stats`,
          type: 'KeyStats',
          columnName: this.options.columnName,
          connector: {
              id: this.options.connectorId,
          },
        },
        {
          cell: `${this.options.metricName}-metric-history-chart`,
          type: 'Highcharts',
          sync: {
            visibility: true,
            highlight: true,
            extremes: true,
          },
          connector: {
            id: this.options.connectorId,
            columnAssignment: [
              {
                seriesId: this.options.columnName,
                data: [this.options.xAxisName, this.options.columnName],
              }
            ],
          },
          chartOptions: merge({}, baselineClassOfChartOptions, this.makeDefaultChartOptions()),
        }
    ];
  }

  private makeDefaultChartOptions() : Object {
    return {
      title: null,
      yAxis: {
        title: {
          text: this.options.yUnits
        },
      },
      series: [
        {
          id: this.options.columnName,
          name: this.options.seriesName,
          colorIndex: 1,
        }
      ],
      legend: {
        enabled: false,
      },
    };
  }

}
