import * as aq from "arquero";
import { op } from "arquero";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { SERIES_COLUMN_SUFFIXES } from "utilities/highcharts/SeriesSpecs";

import type { ColumnTable } from "arquero";

export const DEFAULT_PRECISION = 2;

export function makeCurrencyFormatter(precision: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: precision,
  }).format;
}

export function dfToJSONConnectorOptions(
  df: ColumnTable,
  precision = DEFAULT_PRECISION,
) {
  const newDf = df
    .derive({
      covid_shape: (d) => {
        if (d.class_of < 2020) {
          return "triangle-down";
        } else if (d.class_of < 2022) {
          return "square";
        } else {
          return "triangle";
        }
      },
    })
    .derive({
      marker_radius: (d) => {
        if (d.class_of < 2020) {
          return 4;
        } else if (d.class_of < 2022) {
          return 2;
        } else {
          return 6;
        }
      },
    });

  const undefinedToNull = newDf.columnNames().reduce((acc, col) => {
    acc[col] = aq.escape((d) => (d[col] === undefined ? null : d[col]));
    return acc;
  }, {});

  // TODO: Do we want to round here too?
  const roundNumbers = newDf.columnNames().reduce((acc, col) => {
    acc[col] = aq.escape((d) =>
      typeof d[col] === "number"
        ? op.round(d[col] * 10 ** precision) / 10 ** precision
        : d[col],
    );
    return acc;
  }, {});

  const data = newDf.derive(undefinedToNull).derive(roundNumbers).objects();
  return {
    firstRowAsNames: false,
    data,
  };
}

// Build the column name format for a facet.
function makeFacetColumnRoot(
  idPrefix,
  normalization,
  metricName,
  facet,
) {
  return [idPrefix, normalization, metricName, facet].join("_");
}

// op.min / op.max over a column that is entirely null (which now happens for a
// facet that has an actuals value but no matching budget value -- e.g. a Staffing
// duty root present in the S-275 actuals but absent from the F-195 budget)
// return `undefined`, and Math.min/Math.max with `undefined` yield NaN. A single
// NaN then poisons the running Math.max in makeFacetYBounds and blanks the whole
// locked-scale chart. These helpers drop non-finite values before reducing.
function finiteMin(values: Array<unknown>): number {
  const nums = values.filter((v): v is number => Number.isFinite(v as number));
  return nums.length ? Math.min(...nums) : 0;
}

function finiteMax(values: Array<unknown>): number {
  const nums = values.filter((v): v is number => Number.isFinite(v as number));
  return nums.length ? Math.max(...nums) : 0;
}

function get1ValueDataBounds(df, name) {
  const minMaxDf = df
    .params({ name })
    .rollup({
      min: (d, $) => op.min(d[$.name]),
      max: (d, $) => op.max(d[$.name]),
    });

  return {
    min: finiteMin([minMaxDf.get("min", 0)]),
    max: finiteMax([minMaxDf.get("max", 0)]),
  };
}

// Union of per-column bounds across every named column.
function getNValueDataBounds(df, names: Array<string>) {
  const bounds = names.map((name) => get1ValueDataBounds(df, name));
  return {
    min: finiteMin(bounds.map((b) => b.min)),
    max: finiteMax(bounds.map((b) => b.max)),
  };
}

// Returns the min/max value for columnRoot across every series-suffixed
// column present (`<root>_actuals` / `_budget` / `_revised`). Used for
// setting yAxis bounds.
export function getDataBounds(df, columnRoot) {
  const seriesColumns = SERIES_COLUMN_SUFFIXES.map(
    (suffix) => `${columnRoot}_${suffix}`,
  ).filter((name) => df.column(name));

  if (seriesColumns.length > 0) {
    return getNValueDataBounds(df, seriesColumns);
  }

  if (df.column(columnRoot)) {
    // Raw value case.
    return get1ValueDataBounds(df, columnRoot);
  }

  // Column not found — return neutral bounds.
  return { min: 0, max: 0 };
}

function makeFacetYBounds(facetOrder, metricName, expandedAllSettings, data) {
  const bounds = {
    min: 0,
    max: 0,
  };
  const allColumns = data.columnNames();
  for (const s of expandedAllSettings) {
    for (const f of facetOrder) {
      const columnRoot = makeFacetColumnRoot(
        s.id,
        s.currencyNormalization,
        metricName,
        f.code,
      );
      const suffixes = SERIES_COLUMN_SUFFIXES.map((s) => `_${s}`);
      const hasDirect = suffixes.some((suffix) =>
        data.column(`${columnRoot}${suffix}`),
      );
      if (hasDirect) {
        // Single-line chart — bounds come straight from the
        // <columnRoot>_<series> columns.
        const facetBounds = getDataBounds(data, columnRoot);
        bounds.min = Math.min(bounds.min, facetBounds.min);
        bounds.max = Math.max(bounds.max, facetBounds.max);
      } else {
        // Multi-series chart — scan every column starting with
        // <columnRoot>_ and ending with a series suffix so each
        // (facet, series) pair contributes to the y-axis range.
        const prefix = `${columnRoot}_`;
        for (const col of allColumns) {
          if (!col.startsWith(prefix)) continue;
          const suffix = suffixes.find((s) => col.endsWith(s));
          if (suffix) {
            const seriesRoot = col.slice(0, -suffix.length);
            const seriesBounds = getDataBounds(data, seriesRoot);
            bounds.min = Math.min(bounds.min, seriesBounds.min);
            bounds.max = Math.max(bounds.max, seriesBounds.max);
          }
        }
      }
    }
  }

  return bounds;
}

export function makeHighchartConfig(options) {
  const {
    connectorId,
    metricName,
    contextSettings,
    allSettings,
    fullFacetOrder,
    componentsGenerator,
    augmentContextComponents,
    data
  } = options;

  const facetLimit = parseInt(contextSettings.facetLimit);
  // Trim the list for rendering speed.
  const facetOrder = fullFacetOrder.slice(
    0,
    facetLimit === 0 ? undefined : facetLimit,
  );

  const facetYBounds =
    contextSettings.yScale === "fixed"
      ? makeFacetYBounds(facetOrder, metricName, allSettings, data)
      : {};

  const result = makeDatasetFacetedDashboard(
    allSettings,
    s => componentsGenerator(facetOrder, contextSettings, s, facetYBounds),
  );

  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const { gui, components } = result;

  if (augmentContextComponents) {
    augmentContextComponents(gui, components, data);
  }

  const config = {
    gui,
    components,
    dataPool: {
      connectors: [
        {
          id: connectorId,
          type: "JSON",
          ...dfToJSONConnectorOptions(data),
        },
      ],
    },
  };

  return config;
}
