import { baselineClassOfChartOptions } from "utilities/highcharts/defaults";
import { dfToJSONConnectorOptions, DEFAULT_PRECISION } from 'utilities/highcharts/utils';
import { op } from 'arquero';
import * as aq from 'arquero';
import makeBudgetActualsChart from "utilities/highcharts/cells/BudgetActualsChart";
import merge from 'lodash.merge';

import type { ExpenditureFilterState } from "app/finance/ExpenditureFilter";
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

export function makeSortedGui(prefix, facetCodesSorted : Array<number>) {
  const r = {
    layouts: [
      {
        rows: [
          {
            cells: [
              ...facetCodesSorted.map(code => (
                {id: `${prefix}-${code}-chart`}
              )),
            ]
          }
        ],
      },
    ],
  };

  return r;
}

export function makeChartCells(allActivitiesDf, connectorId, metricVaraint, scaleLock) {
  const results = new Array<PctAmtChartOptions>;
  for (const info of allActivitiesDf.objects()) {
    const options = {
      title: `${info.activity}`,
      renderTo: `act-${info.activity_code}-chart`,
      metricSuffix: info.activity_code,
      metricColumnRoot: metricVaraint,
      connectorId,
      xDataColumn: 'class_of',
      precision: DEFAULT_PRECISION,
      valueFormat: 'currency' as const,
      yUnits: '$',
    };
    results.push(makeBudgetActualsChart(options));
  }
  return results;
}

export function makeExpendituresData(expendituresDf : ColumnTable, 
                                     sortType: SortType,
                                     sortOrder: SortOrder) {
  // Calculate variance for sort order.
  const varianceDf = expendituresDf
    .groupby('class_of', 'data_type', 'activity_code', 'activity')
    .rollup({
      val: op.sum(`amount`),
    })
    .groupby('class_of', 'activity_code', 'activity')
    .pivot(['data_type'], { val: d => op.sum(d.val) })
    .derive({variance: d => d.budget - d.actuals})
    .filter(d => !op.is_nan(d.variance));

  const facetCodesSorted = varianceDf
    .groupby('activity_code', 'activity')
    .rollup({absmedian: d => op.abs(op.median(d.variance))})
    .orderby(aq.desc('absmedian'));
  facetCodesSorted.print();

  const allActivitiesDf = varianceDf.groupby('activity_code', 'activity').rollup({});

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
    });

  return [allActivitiesDf, facetCodesSorted, data];
};

export default function makeCustomConfig(
  gui: any,
  data : ColumnTable,
  allActivitiesDf: ColumnTable,
  facetCodesSortedDf: ColumnTable,
  metricVaraint: MetricVariant,
  scaleLock: ScaleLock,
) {


  const connectorId = 'c-connector';
  return {
    dataPool: {
      connectors: [
        {
          id: connectorId,
          type: 'JSON',
          options: dfToJSONConnectorOptions(data),
        },
      ],
    },
    gui,
    components: makeChartCells(allActivitiesDf, connectorId, metricVaraint, scaleLock),
  };
}
