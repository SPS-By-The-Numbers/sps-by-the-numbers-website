import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";
import makePctAmtChart from "utilities/highcharts/cells/PctAmtChart";
import merge from 'lodash.merge';

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
  const allActivitiesDf = districtData.allActivities();

  return {
    editMode: {
      enabled: true,
      contextMenu: {
        enabled: true,
        items: ['editMode'],
      },
    },
    dataPool: districtData.expenditures_datapool(),
    gui: makeDashboardGui(allActivitiesDf),
    components: [
      ...rowCellConfigs.map(c => makeBudgetActualsChart(c)),
      ...makeActivityCells(allActivitiesDf),
    ],
  };
}
