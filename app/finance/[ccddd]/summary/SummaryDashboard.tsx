'use client'

import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import { useDanfo } from 'components/providers/DanfoProvider';
import { useEffect } from 'react';
import { useFinanceNavState } from 'components/providers/FinanceNavStateProvider';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";
import makePctAmtChart from "utilities/highcharts/cells/PctAmtChart";
import DistrictData from "utilities/DistrictData";
import merge from 'lodash.merge';

import type { DataFrame } from "danfojs";
import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

import "styles/hc-ba-history.scss"

const DEFAULT_PRECISION = 2;

const rowCellConfigs = [
  {
    title: 'Enrollment',
    cellId: 'enrollment-ba-history-chart',
    metricColumnRoot: 'enrollment',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    precision: DEFAULT_PRECISION,
    valueFormat: 'decimal',
    yUnits: 'AFTE',
  },
  {
    title: 'Cashflow',
    cellId: 'cashflow-ba-history-chart',
    metricColumnRoot: 'cashflow',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'currency',
    yUnits: '$',

    tooltip: {
      valuePrefix: "$",
    },
  },
  {
    title: 'Staffing',
    cellId: 'staffing-ba-history-chart',
    metricColumnRoot: 'staff_fte',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'decimal',
    yUnits: 'FTE',
  },
];

const pctAmtRowCellConfigs = [
  {
    title: 'Teaching Related Comp',
    cellId: 'teaching-related-ba-history-chart',
    metricColumnRoot: 'teaching_related_comp',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'percentage',
    yUnits: 'FTE',
  },
];

// Converts a danfo dataframe into a set of rows for a Highcharts DataTable.
function danfoToJsonOptions(df: DataFrame) {
  const new_df = df.round(2);
  new_df.addColumn(
    'covid_shape',
    new_df["class_of"].apply((year) => {
      if (year < 2020) {
        return 'triangle-down';
      } else if (year < 2022) {
        return 'square';
      } else {
        return 'triangle';
      }
    }),
    { inplace: true }
  );

  return {
    firstRowAsNames: false,
    columnNames: new_df.columns,
    data: new_df.values,
  };
}

function makeDashboardDatapool(districtData: DistrictData) {
  return {
    connectors: [
      {
        id: 'c-toplevel-metrics',
        type: 'JSON',
        options: danfoToJsonOptions(districtData.toplevel_metrics(), DEFAULT_PRECISION),
      },
    ],
  };
}

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
          ...rowCellConfigs.map(c => ({cells:[{id:c.cellId}]})),
          ...pctAmtRowCellConfigs.map(c => (
            {
              cells:[
                {id: `${c.cellId}-pct`},
                {id: `${c.cellId}-amt`},
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
    dataPool: makeDashboardDatapool(districtData),
    gui: makeDashboardGui(),
    components: [
      ...rowCellConfigs.map(c => makeBudgetActualsChart(c)),
      ...pctAmtRowCellConfigs.flatMap(c => makePctAmtChart(c)),
    ],
  };
}

async function loadData(dfd, dashboards, ccddd) {
  const districtData = await DistrictData.loadFromGcs(dfd, ccddd);
  dashboards.board('dashboard-charts-container', makeDashboardConfig(districtData));
}

export default function SummaryDashboard() {
  const {ccddd} = useFinanceNavState();
  const { highchartsObjs } = useHighcharts();
  const { dfd } = useDanfo();
  useEffect(() => {
    if (dfd.hasOwnProperty('readCSV') && highchartsObjs['dashboards']) {
      loadData(dfd, highchartsObjs['dashboards'], ccddd);
    }
  },
  [ccddd, highchartsObjs, dfd]);
  return (<div id="dashboard-charts-container" />);
}

