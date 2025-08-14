'use client'

import dynamic from 'next/dynamic'


import "styles/finance-dashboard.css"
import { useEffect } from 'react';

import Highcharts from 'highcharts'
import highchartsAccessibility from "highcharts/modules/accessibility";

//import Dashboards from '@highcharts/dashboards';
//import DataGrid from '@highcharts/dashboards/datagrid';

import Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';
import '@highcharts/dashboards/es-modules/masters/modules/layout.src.js';
import DataGrid from '@highcharts/dashboards/datagrid';

import Paper from '@mui/material/Paper';

if (typeof window !== `undefined`) {
    highchartsAccessibility(Highcharts);
  Dashboards.HighchartsPlugin.custom.connectHighcharts(Highcharts);
  Dashboards.GridPlugin.custom.connectGrid(DataGrid);
  Dashboards.PluginHandler.addPlugin(Dashboards.HighchartsPlugin);
  Dashboards.PluginHandler.addPlugin(Dashboards.GridPlugin);
}

function makeEnrollmentSeries() {
  const columnAssignment = [];
  for (const grade of ['total'].reverse()) {
    columnAssignment.push(
      {
        seriesId: grade,
        data: ['year', grade],
      }
    );
  }
  return columnAssignment;
}

function makeDashboardDatapool() {
  return {
    connectors: [
      {
        id: 'c-enrollment',
        type: 'CSV',
        options: {
          csvURL: 'http://localhost:3000/_TEMP_enrollment_17001.csv'
        },
        dataModifier: {
            type: 'Math',
            columnFormulas: [{
                column: 'Total',
                formula: 'A2+A3+A4+A5+A6+A7+A8+A9+A10+A11+A12+A13',
            }]
        },
      },
      {
        id: 'c-gfe',
        type: 'CSV',
        options: {
          csvURL: 'http://localhost:3000/_TEMP_gfe_17001.csv'
        }
      },
      {
        id: 'c-gfe-total',
        type: 'CSV',
        options: {
          csvURL: 'http://localhost:3000/_TEMP_gfe_total_17001.csv'
        }
      },
      {
        id: 'c-gfr',
        type: 'CSV',
        options: {
          csvURL: 'http://localhost:3000/_TEMP_gfr_17001.csv'
        }
      },
      {
        id: 'c-revenues-expenditures',
        type: 'DataTable',
        sync: async function (connector, table) {
          const c_gfe = await connector.dataPool.getConnectorTable('c-gfe');
          const c_gfr = await connector.dataPool.getConnectorTable('c-gfr');

          // Convert Highcharts DataTables to Danfo DataFrames
          const expenditures = new dfd.DataFrame(
            Object.fromEntries(c_gfe.getColumnNames().map(name => [
              name, c_gfe.getColumn(name)
            ]))
          );
          const revenues = new dfd.DataFrame(
            Object.fromEntries(c_gfr.getColumnNames().map(name => [
              name, c_gfr.getColumn(name)
            ]))
          );

          // Merge on "year" (adjust to your key)
          const mergedDF = df1.merge({ right: df2, on: 'year', how: 'inner' });

          // Convert merged Danfo DF back to Highcharts DataTable
          const mergedTable = new Highcharts.DataTable();
          mergedTable.setColumns([
            mergedDF.columns,
            ...mergedDF.values
          ]);

          // Replace this connector's table
          table.setTable(mergedTable);
        }
      },
      {
        id: 'c-spend-type',
        type: 'JSON',
        options: {
          firstRowAsNames: false,
          columnNames: ["Spend Type", "Budget", "Actuals"],
          data: [
            ['Non-Compensation Spending', 175420766.00, 204390909.24],
            ['School-allocated Staffing', 634579723.00, 620153637.87],
            ['"District Office" Staffing', 362568512.00, 313743583.96],
          ],
        },
      },
      {
        id: 'c-general-fund-balance',
        type: 'JSON',
        options: {
          firstRowAsNames: false,
          columnNames: ["Balance Type", "Budget", "Actuals"],
          data: [
            ['Beginning Balance', 98568313.00, 134179376.00],
            ['Ending Balance', 19043604.00, 121226917.00],
            ['Revenues', 1093044292.00, 1125335672.03],
            ['Expenditures', 1172569001.00, 1138288131.07],
          ],
        },
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
          {
            cells: [
              {
                id: 'enrollment',
              },
            ]
          },
          {
            cells: [
              {
                id: 'cashflow',
              },
            ]
          },
          {
            cells: [
              {
                id: 'gf-balance',
              },
            ]
          },
          {
            cells: [
              {
                id: 'per-pupil-expenditure',
              },
            ]
          },
          {
            cells: [
              {
                id: 'expenditure-detail',
              },
            ]
          },
        ],
      },
    ],
  };
}

function makeSpendTypeComponent() {
  return {
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    connector: {
      id: 'c-spend-type',
    },
    cell: 'spend-type',
    type: 'Highcharts',
    chartOptions: {
      xAxis: {
        type: 'category',
        accessibility: {
          description: 'Spending Type',
        },
      },
      yAxis: {
        title: {
          text: 'Amount ($)',
        },
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          marker: {
            radius: 8,
          },
        },
      },
      legend: {
        enabled: true,
        verticalAlign: 'top',
      },
      chart: {
        animation: false,
        styledMode: true,
        type: 'bar',
        spacing: [30, 30, 30, 20],
      },
      title: {
        text: 'Spending Allocation',
      },
      tooltip: {
        valuePrefix: '$',
        stickOnContact: true,
      },
      lang: {
        accessibility: {
          chartContainerLabel:
            'Spending breakdown for district into non-compensation, ' +
            'school-allocated, and district-office staffing. ' +
            'Highcharts Interactive Chart.',
        },
      },
      accessibility: {
        description: `The chart is displays the budgeted versus actual
        amount of spending in the district broken down by
        non-compensation, school-allocated staffing, and
        non-school allocated staffing.`,
        point: {
          valuePrefix: '$',
        },
      },
    },
  };
}

function makeMockComponent(target_id) {
  return {
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    connector: {
      id: 'c-spend-type',
    },
    cell: target_id,
    type: 'Highcharts',
    chartOptions: {
      xAxis: {
        type: 'category',
        accessibility: {
          description: 'Spending Type',
        },
      },
      yAxis: {
        title: {
          text: 'Amount ($)',
        },
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          marker: {
            radius: 8,
          },
        },
      },
      legend: {
        enabled: true,
        verticalAlign: 'top',
      },
      chart: {
        animation: false,
        styledMode: true,
        type: 'bar',
        spacing: [30, 30, 30, 20],
      },
      title: {
        text: 'Spending Allocation',
      },
      tooltip: {
        valuePrefix: '$',
        stickOnContact: true,
      },
    },
  };
}

function makeEnrollmentGraph(target_id) {
  return {
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    connector: {
      id: 'c-enrollment',
      columnAssignment: makeEnrollmentSeries(),
    },
    cell: target_id,
    type: 'Highcharts',
    chartOptions: {
      chart: {
        type: 'column',
        animation: false,
        styledMode: true,
      },
      xAxis: {
        type: 'category',
        accessibility: {
          description: 'school year for data',
        },
      },
      yAxis: {
        title: {
          text: 'AFTE',
        },
      },
      title: {
        text: "Historical Enrollment",
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          groupPadding: 0,
          stacking: 'normal',
          label: {
            enabled: true,
            useHTML: true
          }
        }
      },
      legend: {
        enabled: true,
        verticalAlign: 'top',
      },
      tooltip: {
        valueSuffix: ' AFTE',
        stickOnContact: true,
      },
    },
  };
}

function makeCashflowGraph(target_id) {
  return {
    sync: {
      visibility: true,
      highlight: true,
      extremes: true,
    },
    connector: {
      id: 'c-gfe-total',
      columnAssignment: [
        {
          seriesId: 'actuals',
          data: ['year', 'actuals'],
        },
        {
          seriesId: 'budget',
          data: ['year', 'budget'],
        },
      ]
    },
    cell: target_id,
    type: 'Highcharts',
    chartOptions: {
      chart: {
        type: 'column',
        animation: false,
        styledMode: true,
      },
      xAxis: {
        type: 'category',
        accessibility: {
          description: 'school year for data',
        },
      },
      yAxis: {
        title: {
          text: '$',
        },
      },
      title: {
        text: "Expenditures",
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          groupPadding: 0,
          label: {
            enabled: true,
            useHTML: true
          }
        }
      },
      legend: {
        enabled: true,
        verticalAlign: 'top',
      },
      tooltip: {
        valuePrefix: '$',
        stickOnContact: true,
      },
    },
  };
}

function makeGeneralFundBalanceComponent() {
  return {
    connector: {
      id: 'c-general-fund-balance',
    },
    cell: 'general-fund-balance',
    type: 'Highcharts',
    chartOptions: {
      xAxis: {
        type: 'category',
        accessibility: {
          description: 'Balance item',
        },
      },
      yAxis: {
        title: {
          text: 'Amount ($)',
        },
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        series: {
          marker: {
            radius: 8,
          },
        },
      },
      legend: {
        enabled: true,
        verticalAlign: 'top',
      },
      chart: {
        animation: false,
        styledMode: true,
        inverted: true,
        type: 'bar',
        spacing: [30, 30, 30, 20],
      },
      title: {
        text: 'Cashflow',
      },
      tooltip: {
        valuePrefix: '$',
        stickOnContact: true,
      },
      lang: {
        accessibility: {
          chartContainerLabel: 'TODO',
        },
      },
      accessibility: {
        description: 'TODO',
        point: {
          valuePrefix: '$',
        },
      },
    },
  };
}

const config = {
  editMode: {
    enabled: true,
    contextMenu: {
      enabled: true,
      items: ['editMode'],
    },
  },
  dataPool: makeDashboardDatapool(),
  gui: makeDashboardGui(),
  components: [
    makeEnrollmentGraph('enrollment'),
    makeCashflowGraph('cashflow'),
    makeMockComponent('gf-balance'),
    makeMockComponent('per-pupil-expenditure'),
    makeMockComponent('expenditure-detail'),
  ],
};


export default function DistrictDashboard() {
  useEffect(() => {
    Dashboards.board('container', config);
  },
  [config]);
  return (
      <div id="container" />
  );
}

