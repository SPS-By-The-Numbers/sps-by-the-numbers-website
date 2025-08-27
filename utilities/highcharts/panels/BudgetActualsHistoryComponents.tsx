import merge from 'lodash.merge';
import { BUDGET_ACTUALS_MODE } from 'utilities/highcharts/components/KeyStatsComponent';

import { baselineHighchartsCell } from "utilities/highcharts/defaults";

export type BudgetActualsHistoryComponentsOptions = {
  title : string;
  xAxisName : string;
  metricColumnRoot: string;
  connectorId : string;
  seriesLabel : string;
  yUnits : string;
  keyStatFormat: 'currency' | 'decimal' | 'passthru';
};

export default class BudgetActualsHistoryComponents {
  public keyStatsCell: object;
  public chartCell: object;

  constructor(options : BudgetActualsHistoryComponentsOptions) {
    this.keyStatsCell = this.makeKeyStats(options);
    this.chartCell = this.makeChartCell(options);
  }

  private makeKeyStats(options) {
    const budgetColumn = `${options.metricColumnRoot}_budget`;
    const actualsColumn = `${options.metricColumnRoot}_actuals`;
    return {
      type: 'KeyStats',
      mode: BUDGET_ACTUALS_MODE,
      title: options.title,
      keyStatFormat: options.keyStatFormat,

      budgetColumn,
      actualsColumn,
      xAxisName: options.xAxisName,

      connector: {
        id: options.connectorId,
      },
    };
  }

  private makeChartCell(options : BudgetActualsHistoryComponentsOptions) {
    const budgetColumn = `${options.metricColumnRoot}_budget`;
    const actualsColumn = `${options.metricColumnRoot}_actuals`;
    return merge(
      {},
      baselineHighchartsCell,
      {
        connector: {
          id: options.connectorId,
          columnAssignment: [
            {
              seriesId: 'budget',
              data: [options.xAxisName, budgetColumn],
            },
            {
              seriesId: 'actuals',
              data: [options.xAxisName, actualsColumn],
            },
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
              id: 'budget',
              name: `Budget ${options.seriesLabel ?? ''}`,
              colorIndex: 2,
            },
            {
              id: 'actuals',
              name: `Actual ${options.seriesLabel ?? ''}`,
              colorIndex: 1,
              pointPadding: 0.25,
            },
          ],
          legend: {
            layout: 'horizontal',
            verticalAlign: 'top',
            align: 'left',
            enabled: true,
          },
          plotOptions: {
            series: {
              grouping: false,
              shadow: false,
              borderWidth: 0,
            }
          },
          tooltip: {
            shared: true,
            ...options.tooltip
          }
        }
      }
    );
  }
}
