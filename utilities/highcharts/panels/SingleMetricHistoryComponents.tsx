import merge from 'lodash.merge';

import { baselineHighchartsCell } from "utilities/highcharts/defaults";

export type SingleMetricHistoryComponentsOptions = {
  title : string;
  xAxisName : string;
  columnName : string;
  connectorId : string;
  seriesLabel : string;
  yUnits : string;
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
      title: options.title,
      columnName: options.columnName,
      xAxisName: options.xAxisName,
      connector: {
        id: options.connectorId,
      },
    };
  }

  private makeChartCell(options : SingleMetricHistoryComponentsOptions) {
    return merge(
      {},
      baselineHighchartsCell,
      {
        connector: {
          id: options.connectorId,
          columnAssignment: [
            {
              seriesId: options.columnName,
              data: [options.xAxisName, options.columnName],
            }
          ],
        },
        chartOptions: {
          title: null,
          yAxis: {
            title: {
              text: options.yUnits
            },
          },
          series: [
            {
              id: options.columnName,
              name: options.seriesLabel,
              colorIndex: 1,
            }
          ],
          legend: {
            enabled: false,
          },
        }
      }
    );
  }
}
