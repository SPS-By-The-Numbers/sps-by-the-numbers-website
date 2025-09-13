import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";

import type { BudgetActualsChartOptions, ValueFormat } from "utilities/highcharts/cells/BudgetActualsChart";

export type PctAmtChartOptions = {
  title : string;
  connectorId : string;
  xDataColumn : string;
  metricSuffix?: string;
  renderTo: string;

  seriesLabel?: string;

  tooltip?: object;
}

export default function makePctAmtChart(options : PctAmtChartOptions) {
  return [
    makeBudgetActualsChart(
      {
        ...options,
        title: `${options.title} [% exp]`,
        renderTo: `${options.renderTo}-pct`,
        metricColumnRoot: 'pctexp',
        valueFormat: 'percentage' as ValueFormat,
      }),
    makeBudgetActualsChart(
      {
        ...options,
        renderTo: `${options.renderTo}-amt`,
        metricColumnRoot: 'amount',
        valueFormat: 'currency' as ValueFormat,
      }),
  ];
}
