import { baselineHighchartsCell } from "utilities/highcharts/defaults";
import { makeCurrencyFormatter } from "utilities/highcharts/utils";
import * as aq from 'arquero';
import { op } from 'arquero';
import merge from 'lodash.merge';
import ReactDOMServer from 'react-dom/server';

export type ValueFormat =  'currency' | 'decimal' | 'passthru' | 'percentage';

export type BudgetActualsChartOptions = {
  title : string;
  metricColumnRoot: string;
  connectorId : string;
  xDataColumn : string;
  metricSuffix?: string;
  renderTo: string;

  precision: number;
  valueFormat: ValueFormat;
  yUnits : string;
  seriesLabel?: string;

  tooltip?: object;
};

function getSeriesAsDf(series, name, xMin, xMax) {
  for (const s of series) {
    if (s.userOptions.id === name) {
      let df = aq.fromJSON(s.userOptions.data);

      if (df.numCols() <  2) {
        throw `missing ${name}`;
      }

      // First column is x.
      const result = df
          .rename({0:'x', 1: name})
          .filter(aq.escape(d =>
                            d['x'] >= xMin &&
                            d['x'] <= xMax &&
                            op.compact(d[name])))
      return result;
    }
  }

  console.error(`No series named ${name} in `, series);
  throw `Missing series ${name}`;
}

// Generate a <td> labeled based on the stat value.
function generateColoredTd(value, valueFormatter) {
  const classes = new Array<string>;
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

  const variances_df = budget_df.join(actuals_df)
    .derive({variance: d => d.budget - d.actuals})
    .orderby('x');
  
  const xVal = variances_df.array('x').at(-1);
  const latest = variances_df.array('variance').at(-1);
  const stats = variances_df.rollup({
    median: d => op.median(d.variance),
    mean: d => op.mean(d.variance),
  });
  const median = stats.get('median', 0);
  const mean = stats.get('mean', 0);

  if ([xVal, latest, median, mean].some(v => v === undefined)) {
    throw "incomplete data";
  }

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
      <th>${xVal}</th>
      <th>median</th>
      <th>mean</th>
    </tr>
  </table>
  `;
}

function getFormatter(format : ValueFormat, precision) {
  switch(format) {
    case 'decimal':
      return d => d.toFixed(precision);
    case 'currency':
      return makeCurrencyFormatter(precision);
    case 'percentage':
      return d => `${d.toFixed(precision)}%`;
    case 'passthru':
      return x => x;
  }
}

function getColumnName(metricColumnRoot, suffix) {
  const real_suffix = suffix ? `_${suffix}` : '';
  return {
    budgetColumn: `${metricColumnRoot}${real_suffix}_budget`,
    actualsColumn: `${metricColumnRoot}${real_suffix}_actuals`,
  }
}

function inferUnits(valueFormat : ValueFormat) {
  switch (valueFormat) {
    case 'currency':
      return '$';

    case 'decimal':
      return undefined;

    case 'passthru':
      return undefined;

    case 'percentage':
      return '%';
  }
}

// Create the a chart cell definition graphic budgets vs actuals.
export default function makeBudgetActualsChart(options : BudgetActualsChartOptions) {
  const {budgetColumn, actualsColumn} = getColumnName(options.metricColumnRoot, options.metricSuffix);

  const rawFomatter = getFormatter(options.valueFormat, options.precision);
  const valueFormatter = (v) => {
    if (v === undefined) {
      return '';
    }

    return rawFomatter(v);
  };

  const yAxis = {
    title: {
      text: options.yUnits ?? inferUnits(options.valueFormat)
    },
  } as any;

  const tooltip = {
    shared: true,
    valueDecimals: options.precision,
    ...options.tooltip
  };

  if (options.valueFormat === 'percentage') {
    // Fix the y-axis
    yAxis.min = 0;
    yAxis.max = 10;
    yAxis.tickInterval = 1;
  }

  return merge(
    {},
    baselineHighchartsCell,
    {
      renderTo: options.renderTo,
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
                console.warn(
                  `Failed calculating stats for ${options.metricColumnRoot}, ${options.metricSuffix}:`,
                  e);
                this.chart.setCaption({
                  text: `<table class="ba-chartstats-table"><tr><td>[${e}]</td></tr></table>`
                });
              }
            },
          }
        },
        yAxis,
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
            pointPadding: 0.27,
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
        tooltip,
        caption: {
          useHTML: true,
          align: 'right',
        }
      }
    },
  );
}
