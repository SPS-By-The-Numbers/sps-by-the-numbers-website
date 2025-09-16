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
import type { FacetInfo } from 'utilities/ChartableMetrics';
import type { MetricVariant } from 'components/finance/MetricVariantSelector';
import type { ValueFormat } from 'utilities/highcharts/ChartConfigGenerators';

export type MetricDef ={
  ccddd: number;
  metricVariant: MetricVariant;
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

function formatForVariant(variant) : ValueFormat {
  if (variant === 'amount') {
    return 'currency' as const;
  } else if (variant === 'pctexp') {
    return 'pctexp' as const;
  } else if (variant === 'pctcomp') {
    return 'pctcomp' as const;
  }

  return 'decimal' as const;
}

function metricVariantToTitle(variant: MetricVariant) {
  if (variant === 'amount') {
    return 'amount';
  } else if (variant === 'pctexp') {
    return '% of expenditures';
  }

  throw `Unexpected variant ${variant}`;
}

function makeTitle(facetInfo, metricDef) {
  return `<div class='chart-title'>
    <h3>${facetInfo.title}</h3>
    <h4>${metricVariantToTitle(metricDef.metricVariant)} - ${metricDef.ccddd}</h4>
  </div>`;
}

export function makeFacetComponents(idPrefix, xColumn, xLabel, facetOrder,
                                    connectorId, metricList) {
  const r = metricList.flatMap(
    (metricDef, metricOrdinal) => facetOrder.map(
      facetInfo => (
        makeBudgetActualsChartConfig(
          {
            title: makeTitle(facetInfo, metricDef),
            renderTo: makeCellId(idPrefix, metricOrdinal, facetInfo),
            metricSuffix: facetInfo.code,
            metricColumn: [metricDef.ccddd, metricDef.metricVariant].join('_'),
            connectorId,
            xDataColumn: xColumn,
            yValueFormat: formatForVariant(metricDef.metricVariant),
            xValueFormat: 'year',
            xLabel,
          }
        )
      )
    )
  );

  return r;
}

export function makeSortedGui(idPrefix, facetOrder : Array<FacetInfo>,
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
  const gui = makeSortedGui(idPrefix, facetOrder, metricList);
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
