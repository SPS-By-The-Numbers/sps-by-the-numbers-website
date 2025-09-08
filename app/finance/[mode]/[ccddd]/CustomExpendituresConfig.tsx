import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import { dfToJSONConnectorOptions, DEFAULT_PRECISION } from 'utilities/highcharts/utils';
import { op } from 'arquero';
import * as aq from 'arquero';
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";
import makePctAmtChart from "utilities/highcharts/cells/PctAmtChart";
import merge from 'lodash.merge';

import type { ExpenditureFilterState } from "app/finance/ExpenditureFilter";
import type { BudgetActualsChartOptions } from "utilities/highcharts/cells/BudgetActualsChart";
import type { PctAmtChartOptions } from "utilities/highcharts/cells/PctAmtChart";
import type { default as DistrictData, FilterSelection } from "utilities/DistrictData";

type MetricVariant =
  "amount"         // Raw amount.
    | "pctExp"     // percentage of expenditures.
    | "perStudent" // Per student.
    ;

type SortType = "variance";
type SortOrder = "ascending" | "descending";
type ScaleLock = "yFixed" | "yFree";

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
                {id: `act-${info.activity_code}-chart`},
              ]
            })),
        ],
      },
    ],
  };

  return r;
}

function makeActivityCells(allActivitiesDf, metricVaraint, scaleLock) {
  const results = new Array<PctAmtChartOptions>;
  for (const info of allActivitiesDf.objects()) {
    const options = {
      title: `${info.activity}`,
      renderTo: `act-${info.activity_code}-chart`,
      metricSuffix: info.activity_code,
      metricColumnRoot: metricVaraint,
      connectorId: 'c-gf-exp-by-activity',
      xDataColumn: 'class_of',
      precision: DEFAULT_PRECISION,
      valueFormat: 'currency' as const,
      yUnits: '$',
    };
    results.push(makeBudgetActualsChart(options));
  }
  return results;
}


export default function makeCustomConfig(
  districtData : DistrictData,
  filterSelection : FilterSelection,   // TODO: Should this be moved up a layer?

  ccddd: number,
  metricVaraint: MetricVariant,

  sortType: SortType,
  sortOrder: SortOrder,

  scaleLock: ScaleLock,
) {

  const expendituresDf = districtData.filteredExpenditures(filterSelection);

  const activityVarianceDf = expendituresDf
    .groupby('class_of', 'data_type', 'activity_code', 'activity')
    .rollup({
      val: op.sum(`c_pct_expenditure`),
    })
    .groupby('class_of', 'activity_code', 'activity')
    .pivot(['data_type'], { val: d => op.sum(d.val) })
    .derive({variance: d => d.budget - d.actuals})
    .filter(d => !op.is_nan(d.variance));

   const allActivitiesDf = activityVarianceDf
    .groupby('activity_code', 'activity')
    .rollup({
        absmedian: d => op.abs(op.median(d.variance)),
      })
      .orderby(aq.desc('absmedian'));

  const data = expendituresDf.groupby('class_of', 'data_type', 'activity_code')
    .rollup({
      amount: op.sum(`amount`),
      pctexp: op.sum(`c_pct_expenditure`),
      pctrev: op.sum(`c_pct_revenue`),
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
          options: dfToJSONConnectorOptions(data),
        },
      ],
    },
    gui: makeDashboardGui(allActivitiesDf),
    components: [
      ...rowCellConfigs.map(c => makeBudgetActualsChart(c)),
      ...makeActivityCells(allActivitiesDf, metricVaraint, scaleLock),
    ],
  };
}
