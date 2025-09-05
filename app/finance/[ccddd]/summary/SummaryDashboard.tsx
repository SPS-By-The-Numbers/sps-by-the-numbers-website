'use client'

import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import { useEffect } from 'react';
import { useFinanceNavState } from 'components/providers/FinanceNavStateProvider';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";
import makePctAmtChart from "utilities/highcharts/cells/PctAmtChart";
import DistrictData from "utilities/DistrictData";
import merge from 'lodash.merge';

import type { BudgetActualsChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";
import type { PctAmtChartOptions } from "utilities/highcharts/cells/PctAmtChart";
import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

import "styles/hc-ba-history.scss"

// TODO: This needs dedupping with DistrictData.
const DEFAULT_PRECISION = 2;

const rowCellConfigs : Array<BudgetActualsChartOptions> = [
  {
    title: 'Enrollment',
    renderTo: 'enrollment-ba-history-chart',
    metricColumnRoot: 'enrollment',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    precision: DEFAULT_PRECISION,
    valueFormat: 'decimal',
    yUnits: 'AFTE',
  },
  {
    title: 'Cashflow',
    renderTo: 'cashflow-ba-history-chart',
    metricColumnRoot: 'cashflow',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'currency',
    precision: DEFAULT_PRECISION,
    yUnits: '$',

    tooltip: {
      valuePrefix: "$",
    },
  },
  {
    title: 'Staffing',
    renderTo: 'staffing-ba-history-chart',
    metricColumnRoot: 'staff_fte',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'decimal',
    precision: DEFAULT_PRECISION,
    yUnits: 'FTE',
  },
];

const pctAmtRowCellConfigs : Array<PctAmtChartOptions> = [
  {
    title: 'Teaching Related Comp',
    renderTo: 'teaching-related-ba-history-chart',
    metricColumnRoot: 'teaching_related_comp',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'percentage',
  },
];

// Main question per district is how it has changed over time.
//
//   // How much should the district be taking up
//   Key inputs: Enrollment
//
//   // How does that translate to money.
//   Revenue vs Expenditures (with variance)
//
//   // What is District-Office overhead as % of expenditure over time.
//   GF Balance with (with variance)
//
//   // Per-pupil spend with breakout of District Office vs non and sub-breakout
//   // of purchased services vs compensation.
//   Per-pupil spend graph.
//
//   // Detailed expenditure examination of comp vs non-comp (% of expenditrue).
//   * Split to break down by activity, program, etc.
function makeDashboardGui() {
  return {
    layouts: [
      {
        rows: [
          ...rowCellConfigs.map(c => ({cells:[{id:c.renderTo}]})),
          ...pctAmtRowCellConfigs.map(c => (
            {
              cells:[
                {id: `${c.renderTo}-pct`},
                {id: `${c.renderTo}-amt`},
              ]
            })),
        ],
      },
    ],
  };
}

function pctFormater() {
  return (this.value * 100) + '%';
}

function makeDashboardConfig(districtData : DistrictData) {
  return {
    editMode: {
      enabled: true,
      contextMenu: {
        enabled: true,
        items: ['editMode'],
      },
    },
    dataPool: districtData.toplevel_metrics_datapool(),
    gui: makeDashboardGui(),
    components: [
      ...rowCellConfigs.map(c => makeBudgetActualsChart(c)),
      ...pctAmtRowCellConfigs.flatMap(c => makePctAmtChart(c)),
    ],
  };
}

async function loadData(dashboards, ccddd) {
  const districtData = await DistrictData.loadFromGcs(ccddd);
  dashboards.board('dashboard-charts-container', makeDashboardConfig(districtData));
  window.districtData = districtData;
  window.dashboards = dashboards;
}

export default function SummaryDashboard() {
  const { ccddd } = useFinanceNavState();
  const { highchartsObjs } = useHighcharts();
  useEffect(() => {
    if (highchartsObjs['dashboards']) {
      loadData(highchartsObjs['dashboards'], ccddd);
    }
  },
  [ccddd, highchartsObjs]);
  return (<div id="dashboard-charts-container" />);
}

/*
 * -  const yAxis = {};
-  const tooltip = {};
-  if (pct_or_amt == 'pct_expenditure') {
-    yAxis['min'] = 0;
-    yAxis['max'] = 1;
-    yAxis['title'] = {'text': "% of Expenditure"};
-    yAxis['labels'] = {'formatter': pctFormater };
-    tooltip['formatter'] = function() { return `${(this.y * 100).toFixed(1)}%` };
-  } else {
-    yAxis['title'] = {'text': "$"};
-    tooltip['valuePrefix'] = '$';
-  }
*/
