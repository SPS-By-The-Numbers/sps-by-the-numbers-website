import merge from 'lodash.merge';
import { BUDGET_ACTUALS_MODE } from 'utilities/highcharts/components/KeyStatsComponent';

import { baselineHighchartsCell } from "utilities/highcharts/defaults";

export type BudgetActualsHistoryComponentsOptions = {
  xAxisName : string;
  metricName: string;
  connectorId : string;
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
              data: ['school_starting_year', budgetColumn],
            },
            {
              seriesId: 'actuals',
              data: ['school_starting_year', actualsColumn],
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
              name: `${options.seriesLabel} (Budget)`,
              colorIndex: 0,
            },
            {
              id: 'actuals',
              name: `${options.seriesLabel} (Actual)`,
              colorIndex: 2,
              pointPadding: 0.25,
            },
          ],
          legend: {
            enabled: false,
          },
          plotOptions: {
            series: {
              grouping: false,
              shadow: false,
              borderWidth: 0,
            }
          },
          tooltip: {
            valuePrefix: "$",
          },
        }
      }
    );
  }
}
