import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";
import makePctAmtChart from "utilities/highcharts/cells/PctAmtChart";
import merge from 'lodash.merge';
import * as aq from 'arquero';
import { op } from 'arquero';

import type { BudgetActualsChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";
import type { PctAmtChartOptions } from "utilities/highcharts/cells/PctAmtChart";
import type DistrictData from "utilities/DistrictData";

// TODO: This needs dedupping with DistrictData.
const DEFAULT_PRECISION = 2;

const rowCellConfigs : Array<BudgetActualsChartOptions> = [
  {
    title: 'Enrollment',
    renderTo: 'enrollment-ba-history-chart',
    metricColumnRoot: 'enrollment',
    connectorId: 'c-gf-exp-by-activity',
    xDataColumn: 'class_of',

    precision: DEFAULT_PRECISION,
    valueFormat: 'decimal',
    yUnits: 'AFTE',
  },
];

function makeDashboardGui(allActivitiesDf) {
  const r = {
    layouts: [
      {
        rows: [
          ...rowCellConfigs.map(c => ({cells:[{id:c.renderTo}]})),
          ...allActivitiesDf.objects().map(info => (
            {
              cells:[
                {id: `act-${info.activity_code}-chart-pct`},
                {id: `act-${info.activity_code}-chart-amt`},
              ]
            })),
        ],
      },
    ],
  };

  return r;
}

function makeActivityCells(allActivitiesDf) {
  const results = new Array<PctAmtChartOptions>;
  for (const info of allActivitiesDf.objects()) {
    const options = {
      title: `${info.activity}`,
      renderTo: `act-${info.activity_code}-chart`,
      metricSuffix: info.activity_code,
      connectorId: 'c-gf-exp-by-activity',
      xDataColumn: 'class_of',
      precision: DEFAULT_PRECISION,
    };
    results.push(...makePctAmtChart(options));
  }
  return results;
}

export default function makeExpendituresConfig(districtData : DistrictData) {
  // TODO: Hack on object_codes.
  const expendituresDf = districtData.filteredExpenditures([2,3,4]);


  const allActivitiesDf = expendituresDf.groupby('activity_code', 'activity').rollup();

  const data = expendituresDf.groupby('class_of', 'data_type', 'activity_code')
    .rollup({
      amount: op.sum('amount'),
      pctexp: op.sum('c_pct_expenditure'),
      pctrev: op.sum('c_pct_revenue'),
    })
    .groupby('class_of')
    .pivot(['activity_code', 'data_type'], {
      amount: d => op.sum(d.amount),
      pctexp: d => op.sum(d.pctexp) * 100,
      pctrev: d => op.sum(d.pctrev) * 100,
    })
    .join(districtData.enrollment());

  return {
    dataPool: {
      connectors: [
        {
          id: 'c-gf-exp-by-activity',
          type: 'JSON',
          options: dfToJSONConnectorOptions(data, DEFAULT_PRECISION),
        },
      ],
    },
    gui: makeDashboardGui(allActivitiesDf),
    components: [
      ...rowCellConfigs.map(c => makeBudgetActualsChart(c)),
      ...makeActivityCells(allActivitiesDf),
    ],
  };
}
