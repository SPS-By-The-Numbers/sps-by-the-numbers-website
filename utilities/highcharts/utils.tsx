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

// Returns the min/max value for columnRoot in a budget/actual name format. Used for setting
// yAxis bounds.
export function getDataBounds(data, columnRoot) {
  const a_name = `${columnRoot}_actuals`;
  const b_name = `${columnRoot}_budget`;

  const minMaxDf = data
    .params({
      a_name: `${columnRoot}_actuals`,
      b_name: `${columnRoot}_budget`,
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


function makeFacetYBounds(facetOrder, expandedAllSettings, data) {
  const bounds = {
    min: 0,
    max: 0,
  };
  for (const s of expandedAllSettings) {
    for (const f of facetOrder) {
      const columnRoot = makeFacetColumnRoot(
        s.id,
        s.currencyNormalization,
        "amount",
        f.code,
      );
      const facetBounds = getDataBounds(data, columnRoot);
      bounds.min = Math.min(bounds.min, facetBounds.min);
      bounds.max = Math.max(bounds.max, facetBounds.max);
    }
  }

  return bounds;
}

export function makeHighchartConfig(
  connectorId: string,
  contextSettings,
  allSettings,
  fullFacetOrder,
  componentsGenerator,
  augmentContextComponents,
  data,
) {
  const facetLimit = parseInt(contextSettings.facetLimit);
  // Trim the list for rendering speed.
  const facetOrder = fullFacetOrder.slice(
    0,
    facetLimit === 0 ? undefined : facetLimit,
  );

  const facetYBounds =
    contextSettings.yScale === "fixed"
      ? makeFacetYBounds(facetOrder, allSettings, data)
      : {};

  const result = makeDatasetFacetedDashboard(
    allSettings,
    s => componentsGenerator(facetOrder, contextSettings, s, facetYBounds),
  );

  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const { gui, components } = result;

  augmentContextComponents(gui, components, data);

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
