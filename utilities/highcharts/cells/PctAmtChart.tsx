import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";

import type { BudgetActualsChartOptions, ValueFormat } from "utilities/highcharts/cells/BudgetActualsChart";

export type PctAmtChartOptions = BudgetActualsChartOptions;

export default function makePctAmtChart(options : PctAmtChartOptions) {
  return [
    makeBudgetActualsChart(
      {
        ...options,
        title: `${options.title} [% exp]`,
        renderTo: `${options.renderTo}-pct`,
        metricColumnRoot: 'pctexp',
        valueFormat: 'percentage' as ValueFormat,
        yUnits: '%',
      }),
    makeBudgetActualsChart(
      {
        ...options,
        renderTo: `${options.renderTo}-amt`,
        metricColumnRoot: 'amount',
        valueFormat: 'currency' as ValueFormat,
        yUnits: '$',
      }),
  ];
}
