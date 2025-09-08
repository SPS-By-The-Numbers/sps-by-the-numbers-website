import { dfToJSONConnectorOptions, DEFAULT_PRECISION } from 'utilities/highcharts/utils';
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";
import makePctAmtChart from "utilities/highcharts/cells/PctAmtChart";
import merge from 'lodash.merge';

import type { BudgetActualsChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";
import type { PctAmtChartOptions } from "utilities/highcharts/cells/PctAmtChart";
import type DistrictData from "utilities/DistrictData";

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
    title: 'Staffing FTE',
    renderTo: 'staffing-ba-history-chart',
    metricColumnRoot: 'amount_staff_fte',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'decimal',
    precision: DEFAULT_PRECISION,
    yUnits: 'FTE',
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
    title: 'Beginning Balance',
    renderTo: 'beginning-balance-chart',
    metricColumnRoot: 'beginning_balance',
    connectorId: 'c-toplevel-metrics',
    xDataColumn: 'class_of',

    valueFormat: 'currency',
    precision: DEFAULT_PRECISION,
    yUnits: '$',
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
          {
            cells: [
              ...rowCellConfigs.map(c => ({id:c.renderTo})),
            ]
          }
        ],
      },
    ],
  };
}

export default function makeSummaryConfig(districtData : DistrictData) {
  const data = districtData.toplevel_metrics();
  return {
    editMode: {
      enabled: true,
      contextMenu: {
        enabled: true,
        items: ['editMode'],
      },
    },
    dataPool:  {
      connectors: [
        {
          id: 'c-toplevel-metrics',
          type: 'JSON',
          options: dfToJSONConnectorOptions(data),
        },
      ],
    },
    gui: makeDashboardGui(),
    components: [
      ...rowCellConfigs.map(c => makeBudgetActualsChart(c)),
    ],
  };
}
