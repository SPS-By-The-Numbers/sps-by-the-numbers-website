import { dfToJSONConnectorOptions, DEFAULT_PRECISION } from 'utilities/highcharts/utils';
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { ColumnTable } from 'arquero';
import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

//
// The ComparisonDashboard renders a set of metrics, possibly faceted based on a pair of facet columns.
//
// It is responsible for drawing the entire chart dashboard. All data is retrieved
// from the chartableMetrics dashboard which is reponsible for providing a consistent
// X-axis for all data and providing all charatble values in columns in a "wide" table
// shape.
//
// faceting will assume that a facet named 'foo' will have a corrsponding alphanumeric
// column 'foo_code' that identifies the facet. This value will be used interally for
// creating html identifiers etc.
//
// If rendered with just one item in the metricList, charts are rendered in one long
// flex-box row.
//
// If more than 1 item is in the list, then each corresponding facet in the
// list will be rendered in a single row with one facet per row.
//
// TODO: implement a "context" mode where each comparator is rendered in a smaller
// right-column so the primary metric is larger.

import { useEffect, useRef } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import Loading from 'components/Loading';

import type { MetricVariant } from 'components/finance/MetricVariantSelector';
import type { ValueFormat } from 'utilities/highcharts/cells/BudgetActualsChart';
import type { FacetInfo } from 'utilities/ChartableMetrics';

export type MetricDef ={
  ccddd: number;
  metricVariant: MetricVariant;

  valueFormat?: ValueFormat;
  yLabel?: string;
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
  }

  return 'passthru' as const;
}

export function makeFacetComponents(idPrefix, xColumn, xLabel, facetOrder,
                                    connectorId, metricList) {
  const r = metricList.flatMap(
    (metricDef, metricOrdinal) => facetOrder.map(
      facetInfo => (
        makeBudgetActualsChart(
          {
            title: facetInfo.title,
            renderTo: makeCellId(idPrefix, metricOrdinal, facetInfo),
            metricSuffix: facetInfo.code,
            metricColumnRoot: [metricDef.ccddd, metricDef.metricVaraint].join('_'),
            connectorId,
            xDataColumn: xColumn,
            valueFormat: formatForVariant(metricDef.metricVaraint),
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

function renderHighchartDashboard(dashboardDiv,
                                  dashboards : Dashboards,
                                  xColumn: string,
                                  xLabel: string,
                                  idPrefix: string,
                                  data : ColumnTable,
                                  facetOrder : Array<FacetInfo>,
                                  metricList : Array<MetricDef>) {
  const connectorId = `${idPrefix}-data-connector`;
  const gui = makeSortedGui(idPrefix, facetOrder, metricList);
  const components = makeFacetComponents(idPrefix, xColumn, xLabel,
                                         facetOrder, connectorId, metricList);

  const board = dashboards.board(
    dashboardDiv.current,
    {
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
    }
  );

  return board;
}

export default function ComparisonDashboard({idPrefix, data, xColumn, xLabel,
                                            facetOrder, metricList} : Params) {
  const { highchartsObjs } = useHighcharts();
  const dashboardDiv = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (!highchartsObjs.dashboards || dashboardDiv.current === null) {
        return;
      }

      const dashboards = highchartsObjs.dashboards;
      const board = renderHighchartDashboard(dashboardDiv, dashboards, xColumn, xLabel,
                                             idPrefix, data, facetOrder, metricList);

      return () => {
        // Clean up all the Highcharts event handlers, etc, on unmount or
        // this will just accumulate cruft and everything will go slow.
        if (board !== undefined) {
          board.destroy();
        }
      };
    },
    [dashboardDiv, highchartsObjs, data, facetOrder, metricList, xLabel, idPrefix, xColumn]
  );
  return (
    <Paper>
      <div ref={dashboardDiv}>
        <Loading text="Loading..." />
      </div>
    </Paper>
  );
}
