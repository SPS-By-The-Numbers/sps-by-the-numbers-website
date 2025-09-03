'use client'

import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import { useDanfo } from 'components/providers/DanfoProvider';
import { useEffect } from 'react';
import { useFinanceNavState } from 'components/providers/FinanceNavStateProvider';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import AmountOnlyBudgetActualsHistory from "utilities/highcharts/panels/AmountOnlyBudgetActualsHistory";
import BudgetActualsHistoryPanel from "utilities/highcharts/panels/BudgetActualsHistoryPanel";
import DistrictData from "utilities/DistrictData";
import merge from 'lodash.merge';
import SingleMetricHistoryComponents from "utilities/highcharts/panels/SingleMetricHistoryComponents";

import type { DataFrame } from "danfojs";
import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

import "styles/hc-ba-history.scss"

const enrollmentPanelFactory = new BudgetActualsHistoryPanel(
  {
    metricName: 'enrollment',
  },
  new AmountOnlyBudgetActualsHistory({
    title: 'Enrollment',
    metricColumnRoot: 'enrollment',
    keyStatFormat: 'decimal',
    xAxisName: 'class_of',
    connectorId: 'c-toplevel-metrics',
    yUnits: 'AFTE',
    tooltip: {
      valueDecimals: 2
    },
  })
);

const cashflowPanelFactory = new BudgetActualsHistoryPanel(
  {
    metricName: 'cashflow',
  },
  new AmountOnlyBudgetActualsHistory({
    title: 'Cashflow',
    metricColumnRoot: 'cashflow',
    keyStatFormat: 'currency',
    xAxisName: 'class_of',
    connectorId: 'c-toplevel-metrics',
    yUnits: '$',
    tooltip: {
      valuePrefix: "$",
      valueDecimals: 2
    },
  })
);

const staffingPanelFactory = new BudgetActualsHistoryPanel(
  {
    metricName: 'staff_fte',
  },
  new AmountOnlyBudgetActualsHistory({
    title: 'Staffing',
    metricColumnRoot: 'staff_fte',
    keyStatFormat: 'decimal',
    xAxisName: 'class_of',
    connectorId: 'c-toplevel-metrics',
    yUnits: 'FTE',
    tooltip: {
      valueDecimals: 2
    },
  })
);


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
        options: danfoToJsonOptions(districtData.toplevel_metrics()),
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
          enrollmentPanelFactory.makeLayout(),
          cashflowPanelFactory.makeLayout(),
          staffingPanelFactory.makeLayout(),
          {
            cells: [
              {
                id: 'key-expenditures-amt',
              },
              {
                id: 'key-expenditures-pct',
              }
            ],
          },
        ],
      },
    ],
  };
}

function pctFormater() {
  return (this.value * 100) + '%';
}

function makeExpenditureGraph(target_id, pct_or_amt) {
  const yAxis = {};
  const tooltip = {};
  if (pct_or_amt == 'pct_expenditure') {
    yAxis['min'] = 0;
    yAxis['max'] = 1;
    yAxis['title'] = {'text': "% of Expenditure"};
    yAxis['labels'] = {'formatter': pctFormater };
    tooltip['formatter'] = function() { return `${(this.y * 100).toFixed(1)}%` };
  } else {
    yAxis['title'] = {'text': "$"};
    tooltip['valuePrefix'] = '$';
  }

  return {
    connector: {
      id: 'c-toplevel-metrics',
      columnAssignment: [
        {
          seriesId: `teaching_related_comp_${pct_or_amt}_budget`,
          data: ['class_of', `teaching_related_comp_${pct_or_amt}_budget`],
        },
        {
          seriesId: `teaching_related_comp_${pct_or_amt}_actuals`,
          data: ['class_of', `teaching_related_comp_${pct_or_amt}_actuals`],
        },
      ]
    },
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    cell: target_id,
    type: 'Highcharts',
    chartOptions: merge({}, baselineClassOfChartOptions, {
      yAxis,
      title: {
        text: "Teaching Related",
      },
      series: [
        {
          id: `teaching_related_comp_${pct_or_amt}_budget`,
          name: 'Teaching Related Comp (Budget)',
        },
        {
          id: `teaching_related_comp_${pct_or_amt}_actuals`,
          name: 'Teaching Related Comp (Actuals)',
          pointPadding: 0.27,
        },
      ],
      plotOptions: {
        series: {
          grouping: false,
          shadow: false,
          borderWidth: 0,
        }
      },
      tooltip,
    }),
  };
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
      ...enrollmentPanelFactory.makeComponents(),
      ...cashflowPanelFactory.makeComponents(),
      ...staffingPanelFactory.makeComponents(),

      makeExpenditureGraph('key-expenditures-amt', 'amt'),
      makeExpenditureGraph('key-expenditures-pct', 'pct_expenditure'),
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


