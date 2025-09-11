import { dfToJSONConnectorOptions, DEFAULT_PRECISION } from 'utilities/highcharts/utils';
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";
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

import type { ChartableMetrics, FilterSelection } from 'utilities/ChartableMetrics';

type FullMetric ={
  ccddd: number;
  name: string;
  quantifier: string;
  facetColumn: string;
};

type Params = {
  data: ColumnTable;
  facetOrder: Array<number>;
  metricList: Array<FullMetric>;
};

export function makeChartCells(facetOrder, connectorId, metricVaraint, scaleLock) {
  const results = new Array<PctAmtChartOptions>;
  for (const facetCode of facetOrder) {
    const options = {
      title: `Code ${facetCode}`,
      renderTo: `act-${facetCode}-chart`,
      metricSuffix: facetCode,
      metricColumnRoot: metricVaraint,
      connectorId,
      xDataColumn: 'class_of',
      precision: DEFAULT_PRECISION,
      valueFormat: 'currency' as const,
      yUnits: '$',
    };
    results.push(makeBudgetActualsChart(options));
  }
  return results;
}

export function makeSortedGui(prefix, facetCodesSorted : Array<number>) {
  const r = {
    layouts: [
      {
        rows: [
          {
            cells: [
              ...facetCodesSorted.map(code => (
                {id: `${prefix}-${code}-chart`}
              )),
            ]
          }
        ],
      },
    ],
  };

  return r;
}

function renderHighchartDashboard(dashboardDiv: HTMLDivElement,
                                  dashboards : Dashboards,
                                  data : ColumnTable,
                                  facetOrder : Array<number>,
                                  metricList : Array<FullMetric>) {
  const gui = makeSortedGui("act", facetOrder);

  const connectorId = 'c-connector';

  const board = dashboards.board(
    dashboardDiv.current,
    {
      gui,
      components: [
        ...makeChartCells(facetOrder, connectorId, "amount", "yFree"),
      ],
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
}

export default function ComparisonDashboard({data, facetOrder, metricList} : Params) {
  const { highchartsObjs } = useHighcharts();
  const dashboardDiv = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (!highchartsObjs.dashboards || dashboardDiv.current === null) {
        return;
      }

      const dashboards = highchartsObjs.dashboards;
      const board = renderHighchartDashboard(dashboardDiv, dashboards, data, facetOrder, metricList);

      return () => {
        // Clean up all the Highcharts event handlers, etc, on unmount or
        // this will just accumulate cruft and everything will go slow.
        if (board !== undefined) {
          board.destroy();
        }
      };
    },
    [dashboardDiv, highchartsObjs, data, facetOrder, metricList]
  );
  return (
    <div ref={dashboardDiv}>
      <Loading />
    </div>
  );
}
