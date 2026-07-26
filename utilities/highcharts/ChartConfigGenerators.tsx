import { makeCurrencyFormatter } from "utilities/highcharts/utils";
import {
  ACTUALS_SERIES,
  BUDGET_ACTUALS_SERIES,
  filterSpecsWithData,
  seriesColumnName,
  seriesDataLabelOffset,
  seriesPointPadding,
} from "utilities/highcharts/SeriesSpecs";
import { op } from "arquero";
import * as aq from "arquero";
import merge from "lodash.merge";

import type Highcharts from "highcharts";
import type { ColumnTable } from "arquero";
import type { SeriesSpec } from "utilities/highcharts/SeriesSpecs";
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
  xAxisReversed?: boolean;

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
  // Facet codes can be the literal number 0 (e.g. an unassigned
  // ms_assignment bucket), so both types are accepted.
  facet?: string | number;
  captionType: CaptionType;

  xDataColumn: string;

  disableLegend?: boolean;

  // Ordered back-to-front series list. Defaults to the classic
  // budget/actuals pair.
  seriesSpecs?: Array<SeriesSpec>;
  // Chartable (pivoted) frame backing the chart. When provided, declared
  // series whose column is absent or entirely non-finite are dropped, so
  // e.g. Revised Budget silently disappears on metrics it can't cover.
  data?: ColumnTable;
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

// Merge each spec's series into plain per-x rows keyed by role:
// [{x, budget?, revised?, actuals?}, ...] sorted by x. Roles beyond the
// classic pair are optional on a chart, so they never throw when missing.
function getSeriesRows(series, specs: Array<SeriesSpec>, minX, maxX) {
  const byX = new Map();
  for (const spec of specs) {
    const noThrow = spec.role === "revised";
    const df = getSeriesAsDf(series, spec.id, minX, maxX, noThrow);
    if (df.numCols() === 0) {
      continue;
    }
    for (const row of df.objects() as Array<Record<string, unknown>>) {
      const entry = byX.get(row.class_of) ?? { x: row.class_of };
      entry[spec.role] = row[spec.id];
      byX.set(row.class_of, entry);
    }
  }
  return [...byX.values()].sort((a, b) => a.x - b.x);
}

function pureMean(values: Array<number>) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function pureMedian(values: Array<number>) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export type VarianceStatsRow = {
  label: string;
  // Whether the good/bad green/red coloring applies. The mid-year
  // Amendment delta is directionally neutral, so it renders uncolored.
  colored: boolean;
  xVal: string | number;
  latest: number;
  median: number;
  mean: number;
};

// Pure (arquero-free, so unit-testable) variance math over merged series
// rows. When a revised series is present the caption shows the mid-year
// amendment (revised - original) and the execution delta (revised -
// actuals); otherwise the classic single budget - actuals variance,
// labeled with defaultLabel.
export function computeVarianceStats(
  rows: Array<{ x; budget?; revised?; actuals? }>,
  defaultLabel: string,
): Array<VarianceStatsRow> {
  const hasRevised = rows.some((r) => Number.isFinite(r.revised));
  const deltas = hasRevised
    ? [
        {
          label: "Amendment",
          colored: false,
          value: (r) => r.revised - r.budget,
        },
        {
          label: "Execution",
          colored: true,
          value: (r) => r.revised - r.actuals,
        },
      ]
    : [
        {
          label: defaultLabel,
          colored: true,
          value: (r) => r.budget - r.actuals,
        },
      ];

  const result = new Array<VarianceStatsRow>();
  for (const { label, colored, value } of deltas) {
    const points = rows
      .map((r) => ({ x: r.x, v: value(r) }))
      .filter((p) => Number.isFinite(p.v));
    if (points.length === 0) {
      continue;
    }
    const values = points.map((p) => p.v);
    result.push({
      label,
      colored,
      xVal: points[points.length - 1].x,
      latest: values[values.length - 1],
      median: pureMedian(values),
      mean: pureMean(values),
    });
  }
  return result;
}

// To be used in the afterSetExtremes() call to generate a caption based on
// the new x zoom level.
function generateVarianceCaption(
  name,
  series,
  valueFormatter,
  minX,
  maxX,
  specs: Array<SeriesSpec>,
) {
  const rows = getSeriesRows(series, specs, minX, maxX);
  const statsRows = computeVarianceStats(rows, name);

  if (statsRows.length === 0) {
    throw "incomplete data";
  }

  const td = (statRow, value) =>
    statRow.colored
      ? generateColoredTd(value, valueFormatter)
      : `<td>${valueFormatter(value)}</td>`;

  const bodyRows = statsRows.map(
    (statRow) => `<tr>
      <td>${statRow.label}</td>
      ${td(statRow, statRow.latest)}
      ${td(statRow, statRow.median)}
      ${td(statRow, statRow.mean)}
    </tr>`,
  );
  const headerXVal = statsRows[statsRows.length - 1].xVal;

  return `
  <table class="ba-chartstats-table">
    ${bodyRows.join("\n")}
    <tr>
      <th></th>
      <th>${headerXVal}</th>
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

function generateStatsCaption(
  name,
  series,
  valueFormatter,
  minX,
  maxX,
  specs: Array<SeriesSpec>,
) {
  const rows = new Array<[string, ColumnTable]>;
  for (const spec of specs) {
    const df = getSeriesAsDf(series, spec.id, minX, maxX, true);
    if (df.size > 0) {
      rows.push([spec.id, df]);
    }
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
  specs: Array<SeriesSpec>,
) : void {
  if (captionType === "variance") {
    chart.setCaption({
      text: generateVarianceCaption(
        "Variance",
        chart.series,
        valueFormatter,
        event.min,
        event.max,
        specs,
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
        specs,
      ),
    });
  } else if (captionType === "none") {
    // Do nothing.
  }
}

// One shared afterSetExtremes handler for every caption-bearing chart type.
// Closes over the chart's rendered spec list so captions know which series
// exist.
function makeAfterSetExtremesHandler(
  options: BudgetActualsChartOptions,
  valueFormatter,
  specs: Array<SeriesSpec>,
) {
  return function (this: { chart: Highcharts.Chart }, event) {
    try {
      setCaptionFromType(this.chart, event, options.captionType, valueFormatter, specs);
    } catch (e) {
      console.warn(
        `Failed calculating stats for ${options.metricColumn}, ${options.facet}:`,
        e,
      );
      this.chart.setCaption({
        text: `<table class="ba-chartstats-table"><tr><td>[${e}]</td></tr></table>`,
      });
    }
  };
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
        reversed: options.xAxisReversed,
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

// Generates one ChartConfiguration: an N-series nested-overlay column chart
// (widest bar in back, narrowest in front) driven by options.seriesSpecs.
export function makeBudgetActualsChartConfig(
  options: BudgetActualsChartOptions,
) {
  const specs = filterSpecsWithData(
    options.data,
    options.metricColumn,
    options.facet,
    options.seriesSpecs ?? BUDGET_ACTUALS_SERIES,
  );

  const baseChartConfig = makeBaseChartConfig(options);

  const valueFormat = options.yValueFormat;
  const precision = options.precision;
  const valueFormatter = getFormatter(valueFormat, precision);

  const dataLabelFormatter = (point) => {
    return valueFormatter(point.y);
  };

  const columnAssignment = specs.map((spec) => ({
    seriesId: spec.id,
    data: {
      name: options.xDataColumn,
      y: seriesColumnName(options.metricColumn, options.facet, spec.columnSuffix),
    },
  }));

  const series = specs.map((spec, i) => ({
    id: spec.id,
    name: spec.label,
    useHTML: true,
    dataLabels: {
      useHTML: true,
      enabled: true,
      formatter: function () {
        return dataLabelFormatter(this);
      },
      // Tier 0 (back bar) keeps the Highcharts default label position.
      ...(i > 0 ? { y: seriesDataLabelOffset(i) } : {}),
    },
    colorIndex: spec.colorIndex,
    pointPadding: seriesPointPadding(i, specs.length),
  }));

  const config = merge(baseChartConfig, {
    connector: {
      columnAssignment,
    },
    chartOptions: {
      chart: {
        shadow: false,
        type: "column",
      },
      xAxis: {
        events: {
          afterSetExtremes: makeAfterSetExtremesHandler(
            options,
            valueFormatter,
            specs,
          ),
        },
      },
      series,
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

  const columnAssignment = options.seriesDefs.map((def) => ({
    seriesId: def.key,
    data: {
      name: options.xDataColumn,
      y: seriesColumnName(
        options.metricColumn,
        options.facet,
        `${def.key}_actuals`,
      ),
      ...(options.useCovidMarker ? {
        "marker.radius": "marker_radius",
        "marker.symbol": "covid_shape",
      } : {}),
    },
  }));

  // Cap distinct colours at the Highcharts default styled palette of
  // 10. Series beyond the tenth recycle through the same indices,
  // letting the marker rotation below disambiguate them.
  const PALETTE_SIZE = 10;
  const MARKER_SYMBOLS = ["circle", "square", "diamond", "triangle", "triangle-down"];
  const series = options.seriesDefs.map((def, i) => {
    const idx = (def.colorIndex ?? i) % PALETTE_SIZE;
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

  const showLegend = !options.disableLegend && options.seriesDefs.length > 1;

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
        // Cap the legend height so a many-series chart -- e.g. Cohort Lines
        // on, which fans each grade cohort into one line per diploma year
        // (60+ series) -- PAGINATES (▲/▼ nav) instead of ballooning into a
        // dozen rows that crush the plot into a sliver. Few-series charts are
        // well under this and render as a single un-paginated row as before.
        maxHeight: 90,
        padding: 6,
        // Tighter inter-item spacing so each page holds more without the
        // items reading as cramped.
        itemDistance: 14,
        itemMarginTop: 1,
        itemMarginBottom: 1,
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
  const specs = [ACTUALS_SERIES];
  const baseChartConfig = makeBaseChartConfig(options);

  const valueFormat = options.yValueFormat;
  const precision = options.precision;
  const valueFormatter = getFormatter(valueFormat, precision);

  const config = merge(baseChartConfig, {
    connector: {
      columnAssignment: specs.map((spec) => ({
        seriesId: spec.id,
        data: {
          name: options.xDataColumn,
          y: seriesColumnName(
            options.metricColumn,
            options.facet,
            spec.columnSuffix,
          ),
          "marker.radius": "marker_radius",
          "marker.symbol": "covid_shape",
        },
      })),
    },
    chartOptions: {
      chart: {
        shadow: false,
        type: "line",
      },
      xAxis: {
        events: {
          afterSetExtremes: makeAfterSetExtremesHandler(
            options,
            valueFormatter,
            specs,
          ),
        },
      },
      series: specs.map((spec) => ({
        id: spec.id,
        name: spec.label,
        colorIndex: spec.colorIndex,
        marker: {
          enabled: true,
        },
      })),
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
  yLabel?: string,
  seriesOptions?: Pick<BudgetActualsChartOptions, "seriesSpecs" | "data">,
) {
  const cell = makeBudgetActualsContextChartConfig({
    renderTo,
    title,
    metricColumn,
    connectorId,
    xDataColumn: "class_of",
    xValueFormat: "year" as const,

    yValueFormat,
    yLabel,

    // No caption cause it's short.
    captionType: "none",

    // Ensure 0 min unless negative.
    yMin: Math.min(0, yBounds?.min),
    yMax: yBounds?.max,

    ...(seriesOptions ?? {}),
  });

  cell.sync.extremes = false;

  return cell;
}
