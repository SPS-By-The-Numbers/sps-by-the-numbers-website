import ReactDOMServer from 'react-dom/server';
import { baselineHighchartsCell } from "utilities/highcharts/defaults";
import { makeCurrencyFormatter } from "utilities/highcharts/utils";
import { g_dfd } from 'components/providers/DanfoProvider';
import merge from 'lodash.merge';

type ValueFormat =  'currency' | 'decimal' | 'passthru';

export type AmountOnlyBudgetActualsHistoryOptions = {
  title : string;
  metricColumnRoot: string;
  connectorId : string;
  xDataColumn : string;


  precision: number;
  valueFormat: ValueFormat;
  yUnits : string;
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

// Generate a <td> labeled based on the stat value.
function generateColoredTd(value, valueFormatter) {
  const classes = [];
  if (value > 0) {
    classes.push('ba-chartstats-good');
  } else if (value < 0) {
    classes.push('ba-chartstats-bad');
  }

  return `<td class="${classes.join(' ')}">${valueFormatter(value)}</td>`;
}

// To be used in the afterSetExtremes() call to generate a caption based on
// the new x zoom level.
function generateVarianceCaption(name, series, valueFormatter, minX, maxX) {
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
      ${generateColoredTd(latest, valueFormatter)}
      ${generateColoredTd(median, valueFormatter)}
      ${generateColoredTd(mean, valueFormatter)}
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

function getFormatter(format : ValueFormat, precision) {
  switch(format) {
    case 'decimal':
      return d => Math.round(d, precision);
    case 'currency':
      return makeCurrencyFormatter(precision);
    case 'passthru':
      return x => x;
  }
}

// Create the a chart cell definition graphic budgets vs actuals.
export default function makeBudgetActualsChart(options : AmountOnlyBudgetActualsHistoryOptions) {
  const budgetColumn = `${options.metricColumnRoot}_budget`;
  const actualsColumn = `${options.metricColumnRoot}_actuals`;

  const valueFormatter = getFormatter(options.valueFormat, options.precision);

  return merge(
    {},
    baselineHighchartsCell,
    {
      renderTo: options.cellId,
      connector: {
        id: options.connectorId,
        columnAssignment: [
          {
            seriesId: 'budget',
            data: [options.xDataColumn, budgetColumn],
          },
          {
            seriesId: 'actuals',
            data: [options.xDataColumn, actualsColumn],
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
                                        valueFormatter,
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
            name: `Budget${options.seriesLabel ?? ''}`,
            colorIndex: 2,
          },
          {
            id: 'actuals',
            name: `Actuals${options.seriesLabel ?? ''}`,
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
          valueDecimals: options.precision,
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
