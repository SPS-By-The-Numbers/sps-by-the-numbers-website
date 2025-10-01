'use client';

//
// The FacetedBudgetActualCharts renders a set of metrics on a pair of facet columns.
//
// It is responsible for drawing the entire chart dashboard.
//
// Faceting will assume that a facet named 'foo' will have a corrsponding alphanumeric
// column 'foo_code' that identifies the facet. This value will be used interally for
// creating html identifiers etc.

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeBudgetActualsChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import HcDashboard from 'components/HcDashboard';

import type { ColumnTable } from 'arquero';
import type { FacetInfo, CurrencyNormalization } from 'utilities/ChartableMetrics';
import type { ValueFormat } from 'utilities/highcharts/ChartConfigGenerators';

export type MetricDef ={
  ccddd: number;
  currencyNormalization: CurrencyNormalization;
  yUnit?: string;
};

type Params = {
  idPrefix: string;
  data: ColumnTable;
  xColumn: string;
  xLabel: string;
  facetOrder: Array<FacetInfo>;
  metricList: Array<MetricDef>;
};

function makeCellId(idPrefix, metricOrdinal, facetInfo) {
  return `chart-${idPrefix}-${facetInfo.code}-${metricOrdinal}`;
}

function formatForVariant(normalization) : ValueFormat {
  if (normalization === 'amount' ||
      normalization === 'finalSalary') {
    return 'currency' as const;
  } else if (normalization === 'pctexp') {
    return 'pctexp' as const;
  } else if (normalization === 'pctcomp') {
    return 'pctcomp' as const;
  }

  return 'decimal' as const;
}

function inferTitle(metricDef : MetricDef) {
  if (metricDef.currencyNormalization === 'amount') {
    if (metricDef.yUnit) {
      return metricDef.yUnit;
    }
    return 'amount';
  } else if (metricDef.currencyNormalization === 'pctexp') {
    return '% of expenditures';
  } else if (metricDef.currencyNormalization === 'pctcomp') {
    return '% of total compensation';
  }

  throw `Unexpected normalization ${metricDef.currencyNormalization}`;
}

function makeTitle(facetInfo, metricDef) {
  return `<div class='chart-title'>
    <h3>${facetInfo.title}</h3>
    <h4>${inferTitle(metricDef)} - ${metricDef.ccddd}</h4>
  </div>`;
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
// metricList - the metrics to generate for each facet.
export function makeFacetComponents(idPrefix, xColumn, xLabel, facets,
                                    connectorId, metricList) {
  const r = metricList.flatMap(
    (metricDef, metricOrdinal) => facets.map(
      facetInfo => (
        makeBudgetActualsChartConfig(
          {
            title: makeTitle(facetInfo, metricDef),
            renderTo: makeCellId(idPrefix, metricOrdinal, facetInfo),
            metricSuffix: facetInfo.code,
            metricColumn: [metricDef.ccddd, metricDef.currencyNormalization].join('_'),
            connectorId,
            xDataColumn: xColumn,
            yValueFormat: formatForVariant(metricDef.currencyNormalization),
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
                                  metricList: Array<MetricDef>) {
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

export default function FacetedBudgetActualCharts({idPrefix, data, xColumn, xLabel,
                                                  facetOrder, metricList} : Params) {
  const connectorId = `${idPrefix}-data-connector`;
  const gui = makeComparisonGui(idPrefix, facetOrder, metricList);
  const components = makeFacetComponents(idPrefix, xColumn, xLabel,
                                         facetOrder, connectorId, metricList);

  const config = ({
    gui,
    components,
    dataPool: {
      connectors: [
        {
          id: connectorId,
          type: 'JSON',
          options: dfToJSONConnectorOptions(data),
        },
      ],
    },
  });

  return (
    <HcDashboard config={config} />
  );
}
