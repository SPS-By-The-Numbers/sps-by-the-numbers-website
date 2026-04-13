import * as aq from "arquero";
import { op } from "arquero";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";

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

function get1ValueDataBounds(df, name) {
  const minMaxDf = df
    .params({ name })
    .rollup({
      min: (d, $) => op.min(d[$.name]),
      max: (d, $) => op.max(d[$.name]),
    });

  return {
    min: minMaxDf.get("min", 0),
    max: minMaxDf.get("max", 0),
  };
}

function get2ValueDataBounds(df, a_name, b_name) {
  const minMaxDf = df
    .params({
      a_name,
      b_name,
    })
    .rollup({
      min_a: (d, $) => op.min(d[$.a_name]),
      max_a: (d, $) => op.max(d[$.a_name]),
      min_b: (d, $) => op.min(d[$.b_name]),
      max_b: (d, $) => op.max(d[$.b_name]),
    })
    .derive(
      {
        min: (d) => Math.min(d.min_b, d.min_a),
        max: (d) => Math.max(d.max_b, d.max_a),
      },
      {
        drop: true,
      },
    );

  return {
    min: minMaxDf.get("min", 0),
    max: minMaxDf.get("max", 0),
  };
}

// Returns the min/max value for columnRoot in a budget/actual name format. Used for setting
// yAxis bounds.
export function getDataBounds(df, columnRoot) {
  const a_name = `${columnRoot}_actuals`;
  const b_name = `${columnRoot}_budget`;

  if (df.column(a_name) && df.column(b_name)) {
    // Budget Actuals case.
    return get2ValueDataBounds(df, a_name, b_name);
  } else if (df.column(a_name)) {
    // Actuals only case.
    return get1ValueDataBounds(df, a_name);
  } else if (df.column(b_name)) {
    // Budget only case.
    return get1ValueDataBounds(df, b_name);
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
  for (const s of expandedAllSettings) {
    for (const f of facetOrder) {
      const columnRoot = makeFacetColumnRoot(
        s.id,
        s.currencyNormalization,
        metricName,
        f.code,
      );
      const facetBounds = getDataBounds(data, columnRoot);
      bounds.min = Math.min(bounds.min, facetBounds.min);
      bounds.max = Math.max(bounds.max, facetBounds.max);
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
