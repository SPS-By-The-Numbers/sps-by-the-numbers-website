import * as aq from 'arquero';
import { op } from 'arquero';

import type { ColumnTable } from 'arquero';
export type SortType = "variance";
export type SortOrder = "ascending" | "descending";

// Data should be
export default class ChartableMetrics {
  constructor() {
    this.districtDataList = [];
  }

  mergeExpenditures(ccddd: number, df : ColumnTable) {
    this.filterSelection = filterSelection;
  }
}

// Returns data with one entry in the "class_of" column for each year and most column
// representing one chartable metric or aggregation.
//
// Columns representing a chartable metric has a column name with this format:
//
//   ${ccddd]_${metric_name}_${facet}_${budget/actual}
//
//  Example for amount of activity_code 11 in actuals for 17001 would be:
//
//    17001_amount_11_actuals
//
// Columns providing more info on the row itself do not follow
// any specific form. An example of such a column is "covid_type"
// which lists of the year is before, during, or after covid.
export function makeChartableExpenditures(ccddd: number,
                                          df: ColumnTable,
                                          facetColumn: string,
                                          sortType: SortType,
                                          sortOrder: SortOrder) {
  try {
    const facetCodeColumn = `${facetColumn}_code`;

    // Calculate variance for sort order.
    const varianceDf = df
      .groupby('class_of', 'data_type', facetColumn, facetCodeColumn)
      .rollup({
        val: op.sum(`amount`),
      })
      .groupby('class_of', facetColumn, facetCodeColumn)
      .pivot(['data_type'], { val: d => op.sum(d.val) })
      .derive({variance: d => d.budget - d.actuals})
      .filter(d => !op.is_nan(d.variance));

    const facetInfoSorted = varianceDf
      .groupby(facetColumn, facetCodeColumn)
      .rollup({absmedian: d => op.abs(op.median(d.variance))})
      .orderby(aq.desc('absmedian'))
      .derive({
        facet_info: aq.escape(
          d => ({
            code: d[facetCodeColumn],
            title: d[facetColumn],
          })
        )
      })
      .array('facet_info')];

    const data = df.groupby('class_of', 'data_type', facetCodeColumn)
      .rollup({
        amount: op.sum(`amount`),
        pctexp: op.sum(`c_pct_expenditure`),
        pctrev: op.sum(`c_pct_revenue`),
      })
      .groupby('class_of')
      .pivot([facetCodeColumn, 'data_type'], {
        [`${ccddd}_amount`]: d => op.sum(d.amount),
        [`${ccddd}_pctexp`]: d => op.sum(d.pctexp) * 100,
        [`${ccddd}_pctrev`]: d => op.sum(d.pctrev) * 100,
      });

      return [data, facetInfoSorted];
  } catch (e) {
    console.warn("No data");
    return [df.groupby('class_of').rollup(), []];
  }
}
