import merge from 'lodash.merge';

import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";

export type SingleMetricHistoryComponentsOptions = {
  xAxisName : string;
  columnName : string;
  connectorId : string;
};

export default class SingleMetricHistoryComponents {
  public keyStatsCell: object;
  public chartCell: object;

  constructor(options : SingleMetricHistoryComponentsOptions) {
    this.keyStatsCell = this.makeKeyStats(options);
    this.chartCell = this.makeChartCell(options);
  }

  private makeKeyStats(options) {
    return {
      type: 'KeyStats',
      columnName: options.columnName,
      connector: {
        id: options.connectorId,
      },
    };
  }

  private makeChartCell(options : MetricHistoryPanelFactoryOptions) {
    return {
      type: 'Highcharts',
      sync: {
        visibility: true,
        highlight: true,
        extremes: true,
      },
      connector: {
        id: options.connectorId,
        columnAssignment: [
          {
            seriesId: options.columnName,
            data: [options.xAxisName, options.columnName],
          }
        ],
      },
      chartOptions: merge({},
                          baselineClassOfChartOptions,
                          this.makeChartOptions(options)),
    }
  }

  private makeChartOptions(options : MetricHistoryPanelFactoryOptions) {
    return {
      title: null,
      yAxis: {
        title: {
          text: options.yUnits
        },
      },
      series: [
        {
          id: options.columnName,
          name: options.seriesName,
          colorIndex: 1,
        }
      ],
      legend: {
        enabled: false,
      },
    };
  }
}
