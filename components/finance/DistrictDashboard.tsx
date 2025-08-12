'use client'

import "styles/finance-dashboard.css"
import { useEffect } from 'react';

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import highchartsAccessibility from "highcharts/modules/accessibility";

//import Dashboards from '@highcharts/dashboards';
//import DataGrid from '@highcharts/dashboards/datagrid';

import Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';
import '@highcharts/dashboards/es-modules/masters/modules/layout.src.js';
import DataGrid from '@highcharts/dashboards/datagrid';

Dashboards.HighchartsPlugin.custom.connectHighcharts(Highcharts);
Dashboards.GridPlugin.custom.connectGrid(DataGrid);
Dashboards.PluginHandler.addPlugin(Dashboards.HighchartsPlugin);
Dashboards.PluginHandler.addPlugin(Dashboards.GridPlugin);

import Paper from '@mui/material/Paper';

if (typeof window !== `undefined`) {
    highchartsAccessibility(Highcharts);
  Dashboards.HighchartsPlugin.custom.connectHighcharts(Highcharts);
  Dashboards.GridPlugin.custom.connectGrid(DataGrid);
  Dashboards.PluginHandler.addPlugin(Dashboards.HighchartsPlugin);
  Dashboards.PluginHandler.addPlugin(Dashboards.GridPlugin);
}

const config = {
  dataPool: {
    connectors: [
      {
        id: 'micro-element',
        type: 'JSON',
        options: {
          firstRowAsNames: false,
          columnNames: ['Food', 'Vitamin A', 'Iron'],
          data: [
            ['Beef Liver', 6421, 6.5],
            ['Lamb Liver', 2122, 6.5],
            ['Cod Liver Oil', 1350, 0.9],
            ['Mackerel', 388, 1],
            ['Tuna', 214, 0.6],
          ],
        },
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
  },
  editMode: {
    enabled: true,
    contextMenu: {
      enabled: true,
      items: ['editMode'],
    },
  },
  gui: {
    layouts: [
      {
        rows: [
          // Row 1
          {
            cells: [
              {
                id: 'spend-type',
              },
              {
                id: 'general-fund-balance',
              },
            ]
          },
          // Row 1
          {
            cells: [
              {
                id: 'kpi-wrapper',
                layout: {
                  rows: [
                    {
                      cells: [
                        {
                          id: 'kpi-vitamin-a',
                        },
                        {
                          id: 'kpi-iron',
                        },
                      ],
                    },
                  ],
                },
              },
              {
                id: 'dashboard-col-0',
              },
              {
                id: 'dashboard-col-1',
              },
            ],
          },
          // %row 2
          {
            cells: [
              {
                id: 'dashboard-col-2',
              },
            ],
          },
        ],
      },
    ],
  },
  components: [
    {
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
    },
    {
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
    },
    {
      type: 'KPI',
      cell: 'kpi-vitamin-a',
      value: 900,
      valueFormat: '{value}',
      title: 'Vitamin A',
      subtitle: 'daily recommended dose',
    },
    {
      type: 'KPI',
      cell: 'kpi-iron',
      value: 8,
      title: 'Iron',
      valueFormat: '{value}',
      subtitle: 'daily recommended dose',
    },
    {
      cell: 'title',
      type: 'HTML',
      elements: [
        {
          tagName: 'h1',
          textContent: 'MicroElement amount in Foods',
        },
      ],
    },
    {
      sync: {
        visibility: true,
        highlight: true,
        extremes: true,
      },
      connector: {
        id: 'micro-element',
      },
      cell: 'dashboard-col-0',
      type: 'Highcharts',
      columnAssignment: {
        Food: 'x',
        'Vitamin A': 'value',
      },
      chartOptions: {
        xAxis: {
          type: 'category',
          accessibility: {
            description: 'Groceries',
          },
        },
        yAxis: {
          title: {
            text: 'mcg',
          },
          plotLines: [
            {
              value: 900,
              zIndex: 7,
              dashStyle: 'shortDash',
              label: {
                text: 'RDA',
                align: 'right',
                style: {
                  color: '#B73C28',
                },
              },
            },
          ],
        },
        credits: {
          enabled: false,
        },
        plotOptions: {
          series: {
            marker: {
              radius: 6,
            },
          },
        },
        legend: {
          enabled: true,
          verticalAlign: 'top',
        },
        chart: {
          animation: false,
          type: 'column',
          spacing: [30, 30, 30, 20],
        },
        title: {
          text: '',
        },
        tooltip: {
          valueSuffix: ' mcg',
          stickOnContact: true,
        },
        lang: {
          accessibility: {
            chartContainerLabel:
              'Vitamin A in food. Highcharts Interactive Chart.',
          },
        },
        accessibility: {
          description: `The chart is displaying the Vitamin A amount in
              micrograms for some groceries. There is a plotLine demonstrating
              the daily Recommended Dietary Allowance (RDA) of 900
              micrograms.`,
          point: {
            valueSuffix: ' mcg',
          },
        },
      },
    },
    {
      cell: 'dashboard-col-1',
      sync: {
        visibility: true,
        highlight: true,
        extremes: true,
      },
      connector: {
        id: 'micro-element',
      },
      type: 'Highcharts',
      columnAssignment: {
        Food: 'x',
        Iron: 'y',
      },
      chartOptions: {
        xAxis: {
          type: 'category',
          accessibility: {
            description: 'Groceries',
          },
        },
        yAxis: {
          title: {
            text: 'mcg',
          },
          max: 8,
          plotLines: [
            {
              value: 8,
              dashStyle: 'shortDash',
              label: {
                text: 'RDA',
                align: 'right',
                style: {
                  color: '#B73C28',
                },
              },
            },
          ],
        },
        credits: {
          enabled: false,
        },
        plotOptions: {
          series: {
            marker: {
              radius: 6,
            },
          },
        },
        title: {
          text: '',
        },
        legend: {
          enabled: true,
          verticalAlign: 'top',
        },
        chart: {
          animation: false,
          type: 'column',
          spacing: [30, 30, 30, 20],
        },
        tooltip: {
          valueSuffix: ' mcg',
          stickOnContact: true,
        },
        lang: {
          accessibility: {
            chartContainerLabel: 'Iron in food. Highcharts Interactive Chart.',
          },
        },
        accessibility: {
          description: `The chart is displaying the Iron amount in
              micrograms for some groceries. There is a plotLine demonstrating
              the daily Recommended Dietary Allowance (RDA) of 8
              micrograms.`,
          point: {
            valueSuffix: ' mcg',
          },
        },
      },
    },
    {
      cell: 'dashboard-col-2',
      connector: {
        id: 'micro-element',
      },
      type: 'DataGrid',
      editable: true,
      sync: {
        highlight: true,
        visibility: true,
      },
    },
  ],
};


export default function DistrictDashboard() {
  useEffect(() => {
    Dashboards.board('container', config);
  }, [config]);
  return (
      <div id="container" />
  );
}

