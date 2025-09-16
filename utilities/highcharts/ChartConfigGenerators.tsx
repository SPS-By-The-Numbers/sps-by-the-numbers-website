import type Highcharts from 'highcharts';
import { makeCurrencyFormatter } from "utilities/highcharts/utils";
import merge from 'lodash.merge';
import * as aq from 'arquero';
import { op } from 'arquero';

export type ValueFormat =  'currency' | 'decimal' | 'year' | 'pctexp' | 'pctcomp';

export type BaseChartConfigOptions = {
  title: string;

  connectorId : string;
  renderTo: string;

  yValueFormat: ValueFormat;
  yLabel?: string;

  xValueFormat: ValueFormat;
  xLabel?: string;

  xAxisType?: Highcharts.AxisTypeValue;
  yAxisType?: Highcharts.AxisTypeValue;

  // TODO: Infer precision.
  precision?: number;

  // Scale constraints.
  yMin?: number;
  yMax?: number;
  xMin?: number;
  xMax?: number;
};

export type BudgetActualsChartOptions = BaseChartConfigOptions & {
  metricColumn: string;
  metricSuffix?: string;

  xDataColumn : string;
};

type SeriesDef = {
  name: string;
  columnSuffix: string;
  colorIndex: number;
}

export type CorrelationChartOptions = BaseChartConfigOptions & {
  yMetricColumn: string;
  xMetricColumn: string;
  dataLabelColumn: string;

  // Name of the series.
  seriesDefs: Array<SeriesDef>;
};

function getSeriesAsDf(series, name, xMin, xMax) {
  for (const s of series) {
    if (s.userOptions.id === name) {
      let df = aq.fromJSON(s.userOptions.data);

      if (df.numCols() <  2) {
        throw `missing ${name}`;
      }
      const columnNames = df.columnNames();
      let normalized = df;

      if (columnNames.includes('0')) {
        normalized = normalized
          .rename({'0':'class_of', '1': name})
          .derive({'x': op.row_number()});
      } else {
        normalized = normalized.rename({'name':'class_of', 'y': name});
      }

      // Pull into the right zoom window and drop empty data.
      const dataDropped = normalized.filter(aq.escape(d =>
                            d['x'] >= xMin &&
                            d['x'] <= xMax &&
                            Number.isFinite(d[name])));

      // Only return the interested columns so later joins aren't messy.
      return dataDropped.select('class_of', name);
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
    .orderby('class_of');
  
  const xVal = variances_df.array('class_of').at(-1);
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

function inferLabel(valueFormat : ValueFormat) {
  switch (valueFormat) {
    case 'currency':
      return '$';

    case 'decimal':
      return undefined;

    case 'year':
      return 'Class of';

    case 'pctexp':
      return '% of expenditures';

    case 'pctcomp':
      return '% of compensation';
  }

  throw `Cannot infer label for ${valueFormat}`;
}

function inferPrecision(valueFormat) {
  switch (valueFormat) {
    case 'currency':
    case 'decimal':
    case 'pctexp':
    case 'pctcomp':
      return 2;

    case 'year':
      return 0;
  }

  return undefined;
}

function inferAxisType(valueFormat) {
  switch (valueFormat) {
    case 'currency':
    case 'decimal':
      return 'linear';

    case 'pctexp':
    case 'pctcomp':
      return 'logarithmic';

    case 'year':
      return 'category';
  }

  return 'category';
}

function inferAxisOptions(valueFormat) {
  switch (valueFormat) {
    case 'pctexp':
    case 'pctcomp':
      return ({min:5, max:99});
  }

  return {};
}

// TODO: Move all this value formatting stuff out.
function percentFormatter(value, precision) {
  return `${value.toFixed(precision)}%`;
}

function getRawFormatter(format : ValueFormat, precision) {
  switch(format) {
    case 'decimal':
      return d => d.toFixed(precision);
    case 'currency':
      return makeCurrencyFormatter(precision);
    case 'pctexp':
    case 'pctcomp':
      return d => percentFormatter(d, precision);
    case 'year':
      return x => x;
  }
  throw `Unkonwn format ${format}`;
}

function getFormatter(format : ValueFormat, precision) {
  const rawFormatter = getRawFormatter(format, precision);

  return (v) => {
    if (v === undefined) {
      return '';
    }

    return rawFormatter(v);
  };
}

// Convert a metricColumn to names for the budget and actuals of that column.
// TODO: Move the metricColumn + suffix out into the faceting code.
function getBAColumns(metricColumn, facet) {
  const realFacet = facet ? `_${facet}` : '';
  return {
    budgetColumn: `${metricColumn}${realFacet}_budget`,
    actualsColumn: `${metricColumn}${realFacet}_actuals`,
  }
}

// Create the basic chart configuration which specifies defaults for
//   animation
//   axis labels, units, precision
//   legend
//   styling
//   synchronization
//   tooltips
//   title
//   zooming
//   
// that handles defauul format/prescision inferrence, sync, legend, tooltip, fixedAxes.  makeBudgetActualsChart()
export function makeBaseChartConfig(options : BaseChartConfigOptions) {
  return  {
    type: 'Highcharts',
    renderTo: options.renderTo,
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    connector: {
      id: options.connectorId,
    },
    chartOptions: {
      chart: {
        animation: false,
        styledMode: true,

        zooming: {
          type: 'x',
          resetButton: {
            position: {
              align: 'left',
              verticalAlign: 'top',
              x: 5,
              y: 5,
            },
            theme: {
              width: 70,
              height: 5
            },
            relativeTo: 'chart'
          }
        },
      },

      title: {
        text: options.title,
        useHTML: true,
      },

      yAxis: {
        crosshair: true,
        minorTickInterval: "auto",
        type: options.yAxisType ?? inferAxisType(options.yValueFormat),
        title: {
          text: options.yLabel ?? inferLabel(options.yValueFormat)
        },
        ...inferAxisOptions(options.yValueFormat)
      },
      xAxis: {
        type: options.xAxisType ?? inferAxisType(options.xValueFormat),
        title: {
          text: options.xLabel ?? inferLabel(options.xValueFormat)
        },
        // TODO: Do better with xaxis scales.
        // ...inferAxisOptions(options.xValueFormat)
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          label: {
            enabled: true,
            useHTML: true
          }
        }
      },
      legend: {
        layout: 'vertical',
        verticalAlign: 'bottom',
        floating: true,
        align: 'left',
        enabled: true,
      },
      tooltip: {
        outside: true,
        shared: true,
        stickOnContact: true,
        valueDecimals: options.precision ?? inferPrecision(options.yValueFormat),
      },
    }
  };
}

export function makeBudgetActualsChartConfig(options : BudgetActualsChartOptions) {
  const {budgetColumn, actualsColumn} = getBAColumns(options.metricColumn, options.metricSuffix);

  const baseChartConfig = makeBaseChartConfig(options);

  const valueFormat = options.yValueFormat;
  const precision = options.precision;
  const valueFormatter = getFormatter(valueFormat, precision);

  return merge(
    baseChartConfig,
    {
      connector: {
        columnAssignment: [
          {
            seriesId: 'budget',
            data: {
              name: options.xDataColumn,
              y: budgetColumn
            },
          },
          {
            seriesId: 'actuals',
            data: {
              name: options.xDataColumn,
              y: actualsColumn,
            }
          },
        ],
      },
      chartOptions: {
        chart: {
          type: "column",
        },
        xAxis: {
          // TODO: This is  in a weird spot.
          reversed: true,
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
                  `Failed calculating stats for ${options.metricColumn}, ${options.metricSuffix}:`,
                  e);
                this.chart.setCaption({
                  text: `<table class="ba-chartstats-table"><tr><td>[${e}]</td></tr></table>`
                });
              }
            },
          }
        },
        series: [
          {
            id: 'budget',
            name: 'Budget',
            dataSorting: {
              enabled: true,
              sortKey: 'name',
            },
            colorIndex: 2,
            pointPadding: 0,
          },
          {
            id: 'actuals',
            name: 'Actuals',
            colorIndex: 1,
            pointPadding: 0.27,
          },
        ],
        plotOptions: {
          column: {
            groupPadding: 0.09,
          },
          series: {
            grouping: false,
            shadow: false,
            borderWidth: 0,
          }
        },
        caption: {
          useHTML: true,
          align: 'right',
        },
      }
    },
  );
}

export function makeCorrelationChartConfig(options : CorrelationChartOptions ) {
  const {yMetricColumn, xMetricColumn, dataLabelColumn, seriesDefs} = options;
  const columnAssignment = new Array<object>;
  const series = new Array<object>;

  // Create the column assignment and series.
  for (const def of seriesDefs) {
    columnAssignment.push(
      {
        seriesId: def.columnSuffix,
        data: {
          x: `${xMetricColumn}_${def.columnSuffix}`,
          y: `${yMetricColumn}_${def.columnSuffix}`,
          name: dataLabelColumn,
          'marker.radius': 'marker_radius',
          'marker.symbol': 'covid_shape',
        },
      }
    );

    series.push(
      {
        id: def.columnSuffix,
        name: def.name,
        colorIndex: def.colorIndex,
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          crop: false,
          overflow: 'allow',
          allowOverlap: true,
        }
      }
    );
  }

  const result = merge(
    makeBaseChartConfig(options),
    {
      connector: {
        columnAssignment,
      },

      chartOptions: {
        chart: {
          type:'scatter',
        },
        series,
        plotOptions: {
          scatter: {
            opacity: 0.5,
            marker: {
              states: {
                hover: {
                  enabled: true,
                  lineColor: "rgb(100,100,100)"
                }
              }
            },
          },
        },
      }
    }
  );

  return result;
}
