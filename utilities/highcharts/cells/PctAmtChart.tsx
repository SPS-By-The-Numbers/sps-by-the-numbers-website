import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";

import type { BudgetActualsHistoryOptions } from "utilities/highcharts/cells/BudgetActualsChart";

type PctAmtOptions = BudgetActualsHistoryOptions;

export default function makePctAmtChart(options : PctAmtOptions) {
  return [
    makeBudgetActualsChart(
      {
        ...options,
        cellId: `${options.cellId}-amt`,
        metricSuffix: 'amt'
      }),
    makeBudgetActualsChart(
      {
        ...options,
        cellId: `${options.cellId}-pct`,
        metricSuffix: 'pct_expenditure'
      }),
  ];
}
