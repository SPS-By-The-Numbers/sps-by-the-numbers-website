'use client';

//
// The FacetedBudgetActualCharts renders a set of metrics on a pair of facet columns.
//
// It is responsible for drawing the entire chart dashboard.
//
// Faceting will assume that a facet named 'foo' will have a corrsponding alphanumeric
// column 'foo_code' that identifies the facet. This value will be used interally for
// creating html identifiers etc.

import { makeBudgetActualsChartConfig, makeTitle, formatForNormalization } from "utilities/highcharts/ChartConfigGenerators";

import type { ColumnTable } from 'arquero';
import type { FacetInfo } from 'utilities/ChartableMetrics';
import type { MetricSettings } from 'app/finance/_widgets/MetricSettingsContents';

type Params = {
  idPrefix: string;
  data: ColumnTable;
  xColumn: string;
  xLabel: string;
  yColumnRoot: string;
  facetOrder: Array<FacetInfo>;
  metricList: Array<MetricSettings>;
};

function makeCellId(idPrefix, metricOrdinal, facetInfo) {
  return `chart-${idPrefix}-${facetInfo.code}-${metricOrdinal}`;
}

// Produces all "component" which is basically a chart in the cell. This of
// this as the constructor for all the charts. The total number of elements will be
// number of facets times metricList.
//
// The metric list may have semantic repeats as they represent columns.
//
// idPrefix - prefix to the id. Must match with the GUI.
// xColumn - what column from the data connector to use for "x".
// xLabel - Label for the x axis.
// facets - an array of facets to render.  The ordering does not matter as that is defined by the gui.
// connectorId - the ID of the data pool to conect to.
// normalizations - the normalizations to generate for each facet.
export function makeFacetComponents(idPrefix, xColumn, xLabel, yColumnRoot, facets,
                                    connectorId, normalizations) {
  const r = normalizations.flatMap(
    (normalization, normalizationOrdinal) => facets.map(
      facetInfo => (
        makeBudgetActualsChartConfig(
          {
            title: makeTitle(facetInfo, normalization),
            renderTo: makeCellId(idPrefix, normalizationOrdinal, facetInfo),
            metricSuffix: facetInfo.code,
            metricColumn: [idPrefix, normalization, yColumnRoot].join('_'),
            connectorId,
            xDataColumn: xColumn,
            yValueFormat: formatForNormalization(normalization),
            xValueFormat: 'year',
            xLabel,
          }
        )
      )
    )
  );

  return r;
}

// Takes a set of ordered facets and set of metrics per facet and produces
// a highcharts Dashboard GUI config object with each facet as a row and each
// metric as a column in the row.
//
// idPrefix is used to prefix each cell ID to avoid collisions if doing multiple
// graphs in one document.
export function makeComparisonGui(idPrefix, facetOrder: Array<FacetInfo>,
                                  metricList: Array<MetricSettings>) {
  const r = {
    layouts: [
      {
        rows: facetOrder.map(facetInfo => (
          {
            cells: metricList.map((_, metricOrdinal) => (
              {
                id: makeCellId(idPrefix, metricOrdinal, facetInfo)
              }
            ))
          }
        ))
      },
    ],
  };

  return r;
}
