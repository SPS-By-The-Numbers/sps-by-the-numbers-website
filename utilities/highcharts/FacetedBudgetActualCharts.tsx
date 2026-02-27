"use client";

//
// The FacetedBudgetActualCharts renders a set of metrics on a pair of facet columns.
//
// It is responsible for drawing the entire chart dashboard.
//
// Faceting will assume that a facet named 'foo' will have a corrsponding alphanumeric
// column 'foo_code' that identifies the facet. This value will be used interally for
// creating html identifiers etc.

import {
  makeBudgetActualsChartConfig,
  makeTitle,
  formatForNormalization,
} from "utilities/highcharts/ChartConfigGenerators";

import type { CaptionType, ValueFormat } from "utilities/highcharts/ChartConfigGenerators";
import type { ColumnTable } from "arquero";
import type { CurrencyNormalization, StaffingNormalization } from "utilities/normalizations";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { FacetInfo } from "utilities/ChartableMetrics";

type AxisBounds = {
  min: number;
  max: number;
};

type FacetComponentParams = {
  idPrefix: string;  // The id of the setting used for generating unique identifiers.
  xColumn: string;  // Name of data column for x-Axis
  xLabel: string;  // Label to use on x-axis of graph.
  yColumnRoot: string;  // Root of y-axis columns. Will be combined with facetOrder to generate column name.
  facetOrder: Array<FacetInfo>;  // Whcih facets to show.
  connectorId: string;  // Highcharts connector id.
  normalizations: Array<CurrencyNormalization | StaffingNormalization>;  // Normalizations to apply.
  captionType: CaptionType;  // What kind of summary to do over zoomed data.
  subtitle?: string;  // Optional chart subtitle.
  yBounds?: AxisBounds;  // Optional chart bounds.
  yValueFormatOverride?: ValueFormat;  // Overrides the default format inferred from normalizations

};

// Makes the cell-id for a specific facet and normalization.
function makeCellId(idPrefix, metricOrdinal, facetInfo) {
  return `chart-${idPrefix}-${facetInfo.code}-${metricOrdinal}`;
}

// Append the facet code to a title skipping synthetic codes as those
// should have the facet code already hardcoded into the title.
function makeFacetCodeText(facetInfo) {
  // Synthetic codes do not get a value.
  //
  // TODO: Move this logic into the data layer.
  if (facetInfo.code > 9000) {
    return "";
  }

  return ` (${facetInfo.code})`;
}

// Produces all "component" which is basically a chart in the cell. This of
// this as the constructor for all the charts. The total number of elements will be
// number of facets times metricList.
//
// The metric list may have semantic repeats as they represent columns.
export function makeFacetComponents(params : FacetComponentParams) {
  const {
    idPrefix,
    xColumn,
    xLabel,
    yColumnRoot,
    captionType,
    facetOrder,
    connectorId,
    normalizations,
    subtitle,
    yBounds,
    yValueFormatOverride,
  } = params;
  const r = normalizations.flatMap((normalization, normalizationOrdinal) =>
    facetOrder.map((facetInfo) =>
      makeBudgetActualsChartConfig({
        title: makeTitle(`${facetInfo.title}${makeFacetCodeText(facetInfo)}`, subtitle),
        renderTo: makeCellId(idPrefix, normalizationOrdinal, facetInfo),
        facet: facetInfo.code,
        metricColumn: [idPrefix, normalization, yColumnRoot].join("_"),
        connectorId,
        xDataColumn: xColumn,
        yValueFormat: yValueFormatOverride ? yValueFormatOverride : formatForNormalization(normalization),
        xValueFormat: "year",
        xLabel,
        captionType,
        yMin: yBounds?.min,
        yMax: yBounds?.max,
      }),
    ),
  );

  return r;
}

// Takes a set of ordered facets and set of metrics per facet and produces
// a highcharts Dashboard GUI config object with each facet as a row and each
// metric as a column in the row.
//
// idPrefix is used to prefix each cell ID to avoid collisions if doing multiple
// graphs in one document.
export function makeComparisonGui(
  idPrefix,
  facetOrder: Array<FacetInfo>,
  metricList: Array<DatasetSettings>,
) {
  const r = {
    layouts: [
      {
        rows: facetOrder.map((facetInfo) => ({
          cells: metricList.map((_, metricOrdinal) => ({
            id: makeCellId(idPrefix, metricOrdinal, facetInfo),
          })),
        })),
      },
    ],
  };

  return r;
}
