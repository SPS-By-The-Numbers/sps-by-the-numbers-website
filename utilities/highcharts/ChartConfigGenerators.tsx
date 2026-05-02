import { makeCurrencyFormatter } from "utilities/highcharts/utils";
import { op } from "arquero";
import * as aq from "arquero";
import merge from "lodash.merge";

import type Highcharts from "highcharts";
import type { ColumnTable } from "arquero";
import type {
  CurrencyNormalization,
  StaffingNormalization,
} from "utilities/normalizations";

export type ValueFormat =
  | "currency"
  | "decimal"
  | "year"
  | "pctexp"
  | "pctcomp"
  | "fte"
  | "pctfte";

export type BaseChartConfigOptions = {
  title: string;

  connectorId: string;
  renderTo: string;

  yValueFormat: ValueFormat;
  yValueShowNegative?: boolean;
  yLabel?: string;
  yTickAmount?: number;

  xValueFormat: ValueFormat;
  xValueShowNegative?: boolean;
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

export type CaptionType = "variance" | "stats" | "none";

export type BudgetActualsChartOptions = BaseChartConfigOptions & {
  metricColumn: string;
  facet?: string;
  captionType: CaptionType;

  xDataColumn: string;

  disableLegend?: boolean;
};

type SeriesDef = {
  name: string;
  columnSuffix: string;
  colorIndex: number;
};

export type CorrelationChartOptions = BaseChartConfigOptions & {
  yMetricColumn: string;
  xMetricColumn: string;
  dataLabelColumn: string;

  // Name of the series.
  seriesDefs: Array<SeriesDef>;
};

// Takes the data from highcharts matching the zoom window and turns
// it back into an arquero dataframe.
function getSeriesAsDf(series, name, xMin, xMax, noThrow = false) {
  for (const s of series) {
    if (s.userOptions.id === name) {
      let df = s.userOptions.data.length > 0 ? aq.fromJSON(s.userOptions.data) : aq.table({});

      if (df.numCols() < 2) {
        if (noThrow) {
          return aq.table({});
        }
        throw `missing ${name}`;
      }
      const columnNames = df.columnNames();
      let normalized = df;

      if (columnNames.includes("0")) {
        normalized = normalized
          .rename({ "0": "class_of", "1": name });
      } else {
        normalized = normalized.rename({ name: "class_of", y: name });
      }

      // Pull into the right zoom window and drop empty data. Length is one
      // beyond xMax because xMax is inclusive.
      return normalized.slice(xMin, xMax + 1);
    }
  }

  if (noThrow) {
    return aq.table({});
  }
  console.error(`No series named ${name} in `, series);
  throw `Missing series ${name}`;
}

// Generate a <td> labeled based on the stat value.
function generateColoredTd(value, valueFormatter) {
  const classes = new Array<string>();
  if (value > 0) {
    classes.push("ba-chartstats-good");
  } else if (value < 0) {
    classes.push("ba-chartstats-bad");
  }

  return `<td class="${classes.join(" ")}">${valueFormatter(value)}</td>`;
}

// To be used in the afterSetExtremes() call to generate a caption based on
// the new x zoom level.
function generateVarianceCaption(name, series, valueFormatter, minX, maxX) {
  const budget_df = getSeriesAsDf(series, "budget", minX, maxX);
  const actuals_df = getSeriesAsDf(series, "actuals", minX, maxX);

  const variances_df = budget_df
    .join(actuals_df)
    .derive({ variance: (d) => d.budget - d.actuals })
    .orderby("class_of");

  const xVal = variances_df.array("class_of").at(-1);
  const latest = variances_df.array("variance").at(-1);
  const stats = getStats(variances_df, 'variance');
  const median = stats.get("median", 0);
  const mean = stats.get("mean", 0);

  if ([xVal, latest, median, mean].some((v) => v === undefined)) {
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

// Rolls up the df into basic stats.
function getStats(df, columnName) {
  return (
    df
    .params({columnName})
    .rollup({
      min: (d, $) => op.min(d[$.columnName]),
      median: (d, $) => op.median(d[$.columnName]),
      mean: (d, $) => op.mean(d[$.columnName]),
      stdev: (d, $) => op.stdev(d[$.columnName]),
      max: (d, $) => op.max(d[$.columnName]),
    }
  ));
}

function generateStatsCaption(name, series, valueFormatter, minX, maxX) {
  const budget_df = getSeriesAsDf(series, "budget", minX, maxX, true);
  const actuals_df = getSeriesAsDf(series, "actuals", minX, maxX, true);

  const rows = new Array<[string, ColumnTable]>;
  if (budget_df.size > 0) {
    rows.push(["budget", budget_df]);
  }
  if (actuals_df.size > 0) {
    rows.push(["actuals", actuals_df]);
  }
  const tableRowsHtml = new Array<string>;
  for (const [rowName, df] of rows) {
    const stats = getStats(df, rowName);
    tableRowsHtml.push(
      `<tr>
        <td>${rowName}</td>
        ${generateColoredTd(stats.get("min", 0), valueFormatter)}
        ${generateColoredTd(stats.get("mean", 0), valueFormatter)}
        ${generateColoredTd(stats.get("stdev", 0), valueFormatter)}
        ${generateColoredTd(stats.get("median", 0), valueFormatter)}
        ${generateColoredTd(stats.get("max", 0), valueFormatter)}
      </tr>`);
  }

  return `
  <table class="ba-chartstats-table">
    ${tableRowsHtml.join('\n')}
    <tr>
      <th></th>
      <th>min</th>
      <th>mean</th>
      <th>stdev</th>
      <th>median</th>
      <th>max</th>
    </tr>
  </table>
  `;
}

// Sets the caption in response to an afterSetExtremes event.
function setCaptionFromType(
  chart: Highcharts.Chart,
  event: Highcharts.AxisSetExtremesEventObject,
  captionType: CaptionType,
  valueFormatter,
) : void {
  if (captionType === "variance") {
    chart.setCaption({
      text: generateVarianceCaption(
        "Variance",
        chart.series,
        valueFormatter,
        event.min,
        event.max,
      ),
    });
  } else if (captionType === "stats") {
    chart.setCaption({
      text: generateStatsCaption(
        "Stats",
        chart.series,
        valueFormatter,
        event.min,
        event.max,
      ),
    });
  } else if (captionType === "none") {
    // Do nothing.
  }
}

function inferLabel(valueFormat: ValueFormat) {
  switch (valueFormat) {
    case "currency":
      return "$";

    case "decimal":
      return undefined;

    case "fte":
      return "FTE";

    case "year":
      return "Fiscal Year End";

    case "pctexp":
      return "% of expenditures";

    case "pctcomp":
      return "% of compensation";

    case "pctfte":
      return "% of FTE";
  }

  throw `Cannot infer label for ${valueFormat}`;
}

function inferPrecision(valueFormat) {
  switch (valueFormat) {
    case "currency":
    case "decimal":
    case "pctexp":
    case "pctcomp":
      return 2;

    case "year":
      return 0;
  }

  return undefined;
}

function inferAxisType(valueFormat, allowNegative) {
  switch (valueFormat) {
    case "currency":
    case "decimal":
    case "fte":
      return "linear";

    case "pctexp":
    case "pctcomp":
      return "linear";
      return allowNegative ? "linear" : "logarithmic";

    case "year":
      return "category";
  }

  return "category";
}

function inferAxisOptions(valueFormat, allowNegative) {
  switch (valueFormat) {
    case "pctexp":
    case "pctcomp":
      if (allowNegative) {
        return { min: -99, max: 99 };
      } else {
        return { min: 5, max: 99 };
      }
  }

  return {};
}

// TODO: Move all this value formatting stuff out.
function percentFormatter(value, precision) {
  return `${value.toFixed(precision)}%`;
}

type ValueFormatter = (x) => string;
function getRawFormatter(format: ValueFormat, precision) : ValueFormatter {
  switch (format) {
    case "decimal":
    case "fte":
      return (d) => d.toFixed(precision);
    case "currency":
      return makeCurrencyFormatter(precision);
    case "pctexp":
    case "pctcomp":
    case "pctfte":
      return (d) => percentFormatter(d, precision);
    case "year":
      return (x) => x;
  }
  throw `Unknown format ${format}`;
}

function getFormatter(format: ValueFormat, precision) : ValueFormatter {
  const rawFormatter = getRawFormatter(format, precision);

  return (v) => {
    if (v === undefined) {
      return "";
    }

    return rawFormatter(v);
  };
}

// Convert a metricColumn to names for the budget and actuals of that column.
// TODO: Move the metricColumn + suffix out into the faceting code.
function getBAColumns(metricColumn, facet) {
  // Non-falsy check: facet codes can be the literal number 0 (e.g. an
  // unassigned ms_assignment bucket), which a `truthy` check would
  // collapse into an empty realFacet and break the column lookup.
  const realFacet = (facet != null && facet !== "") ? `_${facet}` : "";
  return {
    budgetColumn: `${metricColumn}${realFacet}_budget`,
    actualsColumn: `${metricColumn}${realFacet}_actuals`,
  };
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
// that handles default format/prescision inference, sync, legend, tooltip, fixedAxes. 
export function makeBaseChartConfig(options: BaseChartConfigOptions) {
  return {
    type: "Highcharts",
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
      exporting: {
        allowHtml: true,
        chartOptions: {
          chart: {
            style: {
              fontFamily: "monospace",
            },
          },
        },
      },
      chart: {
        animation: false,
        styledMode: true,

        zooming: {
          type: "x",
          resetButton: {
            position: {
              align: "left",
              verticalAlign: "top",
              x: 5,
              y: 5,
            },
            theme: {
              width: 70,
              height: 5,
            },
            relativeTo: "chart",
          },
        },
      },

      title: {
        text: options.title,
        useHTML: true,
      },

      yAxis: {
        crosshair: true,
        minorTickInterval: "auto",
        min: options.yMin,
        max: options.yMax,
        tickAmount: options.yTickAmount ?? 5,
        type:
          options.yAxisType ??
          inferAxisType(options.yValueFormat, options.yValueShowNegative),
        title: {
          text: options.yLabel ?? inferLabel(options.yValueFormat),
        },
        ...inferAxisOptions(options.yValueFormat, options.yValueShowNegative),
      },
      xAxis: {
        type:
          options.xAxisType ??
          inferAxisType(options.xValueFormat, options.xValueShowNegative),
        min: options.xMin,
        max: options.xMax,
        title: {
          text: options.xLabel ?? inferLabel(options.xValueFormat),
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
            useHTML: true,
          },
        },
      },
      legend: {
        layout: "vertical",
        verticalAlign: "bottom",
        floating: true,
        align: "left",
        enabled: true,
      },
      tooltip: {
        outside: true,
        shared: true,
        stickOnContact: true,
        valueDecimals:
          options.precision ?? inferPrecision(options.yValueFormat),
      },
    },
  };
}

// Generates one ChartConfiguration
export function makeBudgetActualsChartConfig(
  options: BudgetActualsChartOptions,
) {
  const { budgetColumn, actualsColumn } = getBAColumns(
    options.metricColumn,
    options.facet,
  );

  const baseChartConfig = makeBaseChartConfig(options);

  const valueFormat = options.yValueFormat;
  const precision = options.precision;
  const valueFormatter = getFormatter(valueFormat, precision);

  const dataLabelFormatter = (point) => {
    return valueFormatter(point.y);
  };

  const config = merge(baseChartConfig, {
    connector: {
      columnAssignment: [
        {
          seriesId: "budget",
          data: {
            name: options.xDataColumn,
            y: budgetColumn,
          },
        },
        {
          seriesId: "actuals",
          data: {
            name: options.xDataColumn,
            y: actualsColumn,
          },
        },
      ],
    },
    chartOptions: {
      chart: {
        shadow: false,
        type: "column",
      },
      xAxis: {
        events: {
          afterSetExtremes: function (event) {
            try {
              setCaptionFromType(this.chart, event, options.captionType, valueFormatter);
            } catch (e) {
              console.warn(
                `Failed calculating stats for ${options.metricColumn}, ${options.facet}:`,
                e,
              );
              this.chart.setCaption({
                text: `<table class="ba-chartstats-table"><tr><td>[${e}]</td></tr></table>`,
              });
            }
          },
        },
      },
      series: [
        {
          id: "budget",
          name: "Budget",
          useHTML: true,
          dataLabels: {
            useHTML: true,
            enabled: true,
            formatter: function () {
              return dataLabelFormatter(this);
            },
          },
          colorIndex: 2,
          pointPadding: 0,
        },
        {
          id: "actuals",
          name: "Actuals",
          useHTML: true,
          dataLabels: {
            useHTML: true,
            enabled: true,
            formatter: function () {
              return dataLabelFormatter(this);
            },
            y: 30,
          },
          colorIndex: 1,
          pointPadding: 0.26,
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
        },
      },
      caption: {
        useHTML: true,
        align: "right",
      },
    },
  });

  if (options.disableLegend) {
    config.chartOptions.legend.enabled = false;
  }

  return config;
}

export type SeriesCodeDef = {
  key: string;   // Composite code key used in column names (e.g., "1_3").
  name: string;  // Display name for the UI.
  colorIndex?: number;  // Optional stable color index. Falls back to position.
};

// Generates a line chart with one series per entry in seriesDefs.
// Each series maps to a column: {metricColumn}_{facet}_{key}_actuals.
// The name is used only for display labels.
export function makeMultiSeriesLineChartConfig(
  options: BudgetActualsChartOptions & {
    seriesDefs: Array<SeriesCodeDef>;
    // Opt-in: bind per-point marker shape/size to year via the
    // marker_radius/covid_shape columns populated in
    // dfToJSONConnectorOptions. Default is a uniform series-level marker.
    useCovidMarker?: boolean;
  },
) {
  const baseChartConfig = makeBaseChartConfig(options);
  // Non-falsy check: facet codes can be the literal number 0 (e.g. an
  // unassigned ms_assignment bucket), which a `truthy` check would
  // collapse into an empty realFacet and break the column lookup.
  const realFacet = (options.facet != null && options.facet !== "") ? `_${options.facet}` : "";

  const columnAssignment = options.seriesDefs.map((def) => ({
    seriesId: def.key,
    data: {
      name: options.xDataColumn,
      y: `${options.metricColumn}${realFacet}_${def.key}_actuals`,
      ...(options.useCovidMarker ? {
        "marker.radius": "marker_radius",
        "marker.symbol": "covid_shape",
      } : {}),
    },
  }));

  // Default Highcharts marker rotation; cycle off the same colorIndex
  // so two series sharing a wrapped colour are still distinguishable
  // by marker shape.
  const MARKER_SYMBOLS = ["circle", "square", "diamond", "triangle", "triangle-down"];
  const series = options.seriesDefs.map((def, i) => {
    const idx = def.colorIndex ?? i;
    return {
      id: def.key,
      name: def.name,
      colorIndex: idx,
      marker: {
        enabled: true,
        symbol: MARKER_SYMBOLS[idx % MARKER_SYMBOLS.length],
      },
    };
  });

  const showLegend =
    !options.disableLegend &&
    options.seriesDefs.length > 1 &&
    options.seriesDefs.length <= 8;

  const config = merge(baseChartConfig, {
    connector: { columnAssignment },
    chartOptions: {
      chart: { shadow: false, type: "line" },
      series,
      legend: {
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
        floating: false,
        enabled: showLegend,
      },
      caption: { useHTML: true, align: "right" },
    },
  });

  return config;
}

// Generates a line chart showing only the actuals series (no budget).
// Used for datasets like assessments that don't have a budget/actuals split.
export function makeActualsLineChartConfig(
  options: BudgetActualsChartOptions,
) {
  const { actualsColumn } = getBAColumns(
    options.metricColumn,
    options.facet,
  );

  const baseChartConfig = makeBaseChartConfig(options);

  const valueFormat = options.yValueFormat;
  const precision = options.precision;
  const valueFormatter = getFormatter(valueFormat, precision);

  const config = merge(baseChartConfig, {
    connector: {
      columnAssignment: [
        {
          seriesId: "actuals",
          data: {
            name: options.xDataColumn,
            y: actualsColumn,
            "marker.radius": "marker_radius",
            "marker.symbol": "covid_shape",
          },
        },
      ],
    },
    chartOptions: {
      chart: {
        shadow: false,
        type: "line",
      },
      xAxis: {
        events: {
          afterSetExtremes: function (event) {
            try {
              setCaptionFromType(this.chart, event, options.captionType, valueFormatter);
            } catch (e) {
              console.warn(
                `Failed calculating stats for ${options.metricColumn}, ${options.facet}:`,
                e,
              );
              this.chart.setCaption({
                text: `<table class="ba-chartstats-table"><tr><td>[${e}]</td></tr></table>`,
              });
            }
          },
        },
      },
      series: [
        {
          id: "actuals",
          name: "Actuals",
          colorIndex: 1,
          marker: {
            enabled: true,
          },
        },
      ],
      caption: {
        useHTML: true,
        align: "right",
      },
    },
  });

  if (options.disableLegend) {
    config.chartOptions.legend.enabled = false;
  }

  return config;
}

// Context charts have much smaller space so remove things like legends, etc.
export function makeBudgetActualsContextChartConfig(
  options: BudgetActualsChartOptions,
) {
  const config = makeBudgetActualsChartConfig({...options, disableLegend: true});

  config.chartOptions.title.text = makeTitle(
    `${options.title} (${options.yLabel ?? inferLabel(options.yValueFormat)})`,
  );
  config.chartOptions.yAxis.title.text = "";
  delete config.chartOptions.xAxis.title;
  delete config.chartOptions.xAxis.events.afterSetExtremes; // Remove variance
  config.chartOptions.plotOptions.series.label.enabled = false;
  for (const s of config.chartOptions.series) {
    delete s.dataLabels;
  }

  return config;
}

export function makeCorrelationChartConfig(options: CorrelationChartOptions) {
  const { yMetricColumn, xMetricColumn, dataLabelColumn, seriesDefs } = options;
  const columnAssignment = new Array<object>();
  const series = new Array<object>();

  // Create the column assignment and series.
  for (const def of seriesDefs) {
    columnAssignment.push({
      seriesId: def.columnSuffix,
      data: {
        x: `${xMetricColumn}_${def.columnSuffix}`,
        y: `${yMetricColumn}_${def.columnSuffix}`,
        name: dataLabelColumn,
        "marker.radius": "marker_radius",
        "marker.symbol": "covid_shape",
      },
    });

    series.push({
      id: def.columnSuffix,
      name: def.name,
      colorIndex: def.colorIndex,
      dataLabels: {
        enabled: true,
        format: "{point.name}",
        crop: false,
        overflow: "allow",
        allowOverlap: true,
      },
    });
  }

  const result = merge(makeBaseChartConfig(options), {
    connector: {
      columnAssignment,
    },

    chartOptions: {
      chart: {
        type: "scatter",
      },
      series,
      plotOptions: {
        scatter: {
          opacity: 0.5,
          marker: {
            states: {
              hover: {
                enabled: true,
                lineColor: "rgb(100,100,100)",
              },
            },
          },
        },
      },
    },
  });

  return result;
}

export function inferTitle(
  normalization: CurrencyNormalization | StaffingNormalization,
) {
  if (normalization === "amount") {
    return "amount";
  } else if (normalization === "pctexp") {
    return "% of expenditures";
  } else if (normalization === "pctcomp") {
    return "% of total compensation";
  } else if (normalization === "fte") {
    return "FTE";
  } else if (normalization === "pctfte") {
    return "% of total FTE";
  }

  throw `Unexpected normalization ${normalization}`;
}

export function makeTitle(title, subtitle?) {
  return `<div class='chart-title'>
    <h3>${title}</h3>
    ${subtitle ? `<h4>${subtitle}</h4>` : ""}
  </div>`;
}

export function formatForNormalization(normalization): ValueFormat {
  if (normalization === "amount") {
    return "currency" as const;
  } else if (
    normalization === "pctexp" ||
    normalization === "pctcomp" ||
    normalization === "pctfte" ||
    normalization === "fte"
  ) {
    return normalization as ValueFormat;
  }

  return "decimal" as const;
}

// TODO: Dedupe with vitals.
export function makeContextCell(
  renderTo,
  connectorId,
  metricColumn,
  title,
  yValueFormat,
  yBounds,
) {
  const cell = makeBudgetActualsContextChartConfig({
    renderTo,
    title,
    metricColumn,
    connectorId,
    xDataColumn: "class_of",
    xValueFormat: "year" as const,

    yValueFormat,

    // No caption cause it's short.
    captionType: "none",

    // Ensure 0 min unless negative.
    yMin: Math.min(0, yBounds?.min),
    yMax: yBounds?.max,
  });

  cell.sync.extremes = false;

  return cell;
}
