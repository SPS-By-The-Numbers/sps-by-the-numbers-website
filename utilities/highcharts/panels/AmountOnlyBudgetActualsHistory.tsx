import ReactDOMServer from 'react-dom/server';
import { baselineHighchartsCell } from "utilities/highcharts/defaults";
import { g_dfd } from 'components/providers/DanfoProvider';
import merge from 'lodash.merge';
import { currencyFormatter } from 'utilities/highcharts/utils';

export type BudgetActualsHistoryComponentsOptions = {
  title : string;
  xAxisName : string;
  metricColumnRoot: string;
  connectorId : string;
  yUnits : string;
  keyStatFormat: 'currency' | 'decimal' | 'passthru';
  seriesLabel?: string;
  tooltip?: object;
};

function getSeriesAsDf(series, name, xMin, xMax) {
  for (const s of series) {
    if (s.userOptions.id === name) {
      const df = new g_dfd.DataFrame(s.userOptions.data).rename(
        {
          0: "x",
          1: name,
        },
        { axis:1 }
      );

      return df.query(df['x'].ge(xMin).and(df['x'].le(xMax)));
    }
  }

  console.error(`No series named ${name} in `, series);
  throw `Missing series ${name}`;
}

function generateColoredTd(value) {
  const classes = [];
  if (value > 0) {
    classes.push('ba-chartstats-good');
  } else if (value < 0) {
    classes.push('ba-chartstats-bad');
  }

  return `<td class="${classes.join(' ')}">${value.toFixed(1)}</td>`;
}

// To be used in the afterSetExtremes() call to generate a caption based on
// the new x zoom level.
function generateVarianceCaption(name, series, minX, maxX) {
  const budget_df = getSeriesAsDf(series, 'budget', minX, maxX);
  const actuals_df = getSeriesAsDf(series, 'actuals', minX, maxX);
  const variances_df = g_dfd.merge(
    {
      left: budget_df,
      right: actuals_df,
      on: ["x"],
      how: "inner"
    });
  variances_df.addColumn(
    'variance',
    variances_df['budget'].sub(variances_df['actuals']),
    { inplace: true }
  );
  const latest = variances_df['variance'].values.at(-1);
  const median = variances_df['variance'].median();
  const mean = variances_df['variance'].mean();

  return `
  <table class="ba-chartstats-table">
    <tr>
      <td>${name}</td>
      ${generateColoredTd(latest)}
      ${generateColoredTd(median)}
      ${generateColoredTd(mean)}
    </tr>
    <tr>
      <th></th>
      <th>latest</th>
      <th>median</th>
      <th>mean</th>
    </tr>
  </table>
  `;
}

export default class BudgetActualsHistoryComponents {
  public keyStatsCell: object;
  public chartCell: object;

  constructor(options : BudgetActualsHistoryComponentsOptions) {
    this.chartCell = this.makeChartCell(options);
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
          title: {
            text: options.title
          },
          xAxis: {
            events: {
              afterSetExtremes: function(event) {
                try {
                  this.chart.setCaption({
                    text: generateVarianceCaption('variance',
                                          this.chart.series,
                                          event.min,
                                          event.max)
                  });
                } catch(e) {
                  this.chart.setCaption({
                    text: '[Stat error]'
                  });
                }
              },
            }
          },
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
            verticalAlign: 'bottom',
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
          },
          caption: {
            useHTML: true,
            align: 'right', // or 'center', 'right'
          }
        }
      },
    );
  }
}
