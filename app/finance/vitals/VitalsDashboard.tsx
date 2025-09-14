'use client';

import { makeChartableExpenditures } from 'utilities/ChartableMetrics';
import { useDistrictData } from '../DistrictDataProvider';
import { useState, useEffect } from 'react';
import DistrictSelector from 'components/finance/DistrictSelector';
import ExpenditureFilter, { ALL_PROGRAM_ITEMS, ALL_ACTIVITY_ITEMS, ALL_OBJECT_ITEMS } from 'app/finance/ExpenditureFilter';
import FacetedBudgetActualCharts from './FacetedBudgetActualCharts';
import Loading from 'components/Loading';
import MetricVariantSelector from 'components/finance/MetricVariantSelector';

import type { DistrictDataMap } from 'app/finance/DistrictDataProvider';
import type { MetricDef } from './ComparisonDashboard';
import Stack from '@mui/material/Stack';

import { makeDashboardGui } from './SummaryConfig';

import type { BudgetActualsChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";

const rowCellConfigs : Array<BudgetActualsChartOptions> = [
  {
    title: 'Enrollment',
    renderTo: 'enrollment-ba-history-chart',
    metricColumnRoot: 'enrollment',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'decimal',
    yLabel: 'AFTE',
  },
  {
    title: 'Staffing FTE',
    renderTo: 'staffing-ba-history-chart',
    metricColumnRoot: 'amount_staff_fte',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'decimal',
    yLabel: 'FTE',
  },
  {
    title: 'Cashflow',
    renderTo: 'cashflow-ba-history-chart',
    metricColumnRoot: 'cashflow',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'currency',

    tooltip: {
      valuePrefix: "$",
    },
  },
  {
    title: 'Beginning Balance',
    renderTo: 'beginning-balance-chart',
    metricColumnRoot: 'beginning_balance',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'currency',
  },
];

function makeCorrelationGraph(target_id, title, yMetric, xMetric,
                              ySeriesIds=['budget', 'actuals'],
                              xSeriesIds=['budget', 'actuals'],
                              colorIndexMap={
                                actuals: 1,
                                budget: 2,
                              }) {
  const result = {
    connector: {
      id: 'c-toplevel-metrics',
      columnAssignment: [] as Array<object>,
    },
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    cell: target_id,
    type: 'Highcharts',
    chartOptions: merge({}, baselineClassOfChartOptions, {
      chart: {
        type:'scatter',
      },
      yAxis: {
        title: { text: 'Student AFTE'},
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true,
      },
      xAxis: {
        type: 'linear',
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true,
      },
      title: {
        text: title,
      },
      series: [] as Array<object>,
      tooltip: {
        useHTML: true,
        formatter: function() {
          return `
          <h2 class="hc-tooltip-header">${this.point.name}</h2>
          <table>
          <tr><th>${yMetric}<th><td class="hc-tooltip-data">${this.point.x.toLocaleString()}<td></tr>
          <tr><th>${xMetric}<th><td class="hc-tooltip-data">${this.point.y.toLocaleString()}<td></tr>
          </table>
          `;
        }
      },
      plotOptions: {
        scatter: {
          opacity: 0.5,
          marker: {
            states: {
              hover: {
                enabled: true,
                lineColor: "rgb(100,100,100)"
              }
            }
          },
        },
      },
    }),
  };

  for (const yKind of ySeriesIds) {
    for (const xKind of xSeriesIds) {
      result.connector.columnAssignment.push(
        {
          seriesId: yKind,
          data: {
            x: `${xMetric}_${xKind}`,
            y: `${yMetric}_${yKind}`,
            name: 'class_of',
            'marker.radius': 'marker_radius',
            'marker.symbol': 'covid_shape',
          },
        }
      );
      result.chartOptions.series.push(
          {
            id: yKind,
            name: yKind,
            colorIndex: colorIndexMap[yKind],
            dataLabels: {
              enabled: true,
              format: '{point.name}',
              crop: false,
              overflow: 'allow',
              allowOverlap: true,
            }
          }
      );
    }
  }
  return result;
}

function renderHighchartDashboard(dashboardDiv,
                                  dashboards : Dashboards,
                                  xColumn: string,
                                  xLabel: string,
                                  idPrefix: string,
                                  data : ColumnTable) {
  const connectorId = 'c-toplevel-metrics';  //`${idPrefix}-data-connector`;
  const gui = makeDashboardGui();
  const components = rowCellConfigs.map(c => makeBudgetActualsChart(c));

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

export default function VitalsDashboard({idPrefix, ccddd, data, xColumn, xLabel } : Params) {
  const { districtDataMap, loadCcddd } = useDistrictData();
  const { highchartsObjs } = useHighcharts();
  const dashboardDiv = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      // Move this loading into the lower compoonent.
      loadCcddd(ccddd);
    },
    [ccddd]);


  useEffect(
    () => {
      if (!highchartsObjs.dashboards || dashboardDiv.current === null) {
        return;
      }

      const dashboards = highchartsObjs.dashboards;
      const board = renderHighchartDashboard(dashboardDiv, dashboards, xColumn, xLabel,
                                             idPrefix, data);

      return () => {
        // Clean up all the Highcharts event handlers, etc, on unmount or
        // this will just accumulate cruft and everything will go slow.
        if (board !== undefined) {
          board.destroy();
        }
      };
    },
    [dashboardDiv, districtDataMap, highchartsObjs, data, xLabel, idPrefix, xColumn]
  );
  return (
    <Paper>
      <div ref={dashboardDiv}>
        <Loading text="Loading..." />
      </div>
    </Paper>
  );
}
