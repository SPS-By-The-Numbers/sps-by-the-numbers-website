import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";

import type { BudgetActualsChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";

export type PctAmtChartOptions = BudgetActualsChartOptions;

export default function makePctAmtChart(options : PctAmtChartOptions) {
  return [
    makeBudgetActualsChart(
      {
        ...options,
        renderTo: `${options.renderTo}-amt`,
        metricSuffix: 'amt'
      }),
    makeBudgetActualsChart(
      {
        ...options,
        renderTo: `${options.renderTo}-pct`,
        metricSuffix: 'pct_expenditure',
      }),
  ];
}
