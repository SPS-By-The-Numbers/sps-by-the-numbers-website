import * as aq from 'arquero';
import { op } from 'arquero';

import type { ColumnTable } from 'arquero';
export type SortType = "variance";
export type SortOrder = "ascending" | "descending";
export type FacetInfo = {
  code: number;
  title: string;
};

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
export function makeChartableExpenditures(
    ccddd: number,
    df: ColumnTable,
    facetColumn: string,
    sortType: SortType,
    sortOrder: SortOrder) : [ColumnTable, Array<FacetInfo>] {
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
      .array('facet_info');

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

      return [data, facetInfoSorted as Array<FacetInfo>];
  } catch (e) {
    console.warn("No data");
    return [df.groupby('class_of').rollup(), []];
  }
}

export function makeChartableVitals(
    ccddd: number,
    enrollmentSummaryDf: ColumnTable,
    staffingSummaryDf: ColumnTable,
    balancesDf: ColumnTable,
    compensationDf: ColumnTable) : ColumnTable {
  const enrollment = enrollmentSummaryDf
      .select('class_of', 'enrollment_budget', 'enrollment_actuals')
      .rename(
        {
          enrollment_budget: `${ccddd}_enrollment_budget`,
          enrollment_actuals:`${ccddd}_enrollment_actuals`,
        }
      );

  const staffing = staffingSummaryDf
      .rename(
        {
          amount_staff_fte_budget: `${ccddd}_amount_staff_fte_budget`,
          amount_staff_fte_actuals:`${ccddd}_amount_staff_fte_actuals`,

          amount_teaching_fte_actuals:`${ccddd}_amount_teaching_fte_actuals`,

          amount_student_support_fte_actuals:`${ccddd}_amount_student_support_fte_actuals`,

          amount_building_support_fte_actuals:`${ccddd}_amount_building_support_fte_actuals`,

          amount_other_fte_actuals:`${ccddd}_amount_other_fte_actuals`,
        }
      );

  const balances = balancesDf
      .derive({
        cashflow_budget: d => (d.ending_balance_budget - d.beginning_balance_budget),
        cashflow_actuals: d => (d.ending_balance_actuals - d.beginning_balance_actuals),
      })
      .select('class_of', 'beginning_balance_budget', 'beginning_balance_actuals',
              'cashflow_budget', 'cashflow_actuals')
      .rename(
        {
          beginning_balance_budget: `${ccddd}_beginning_balance_budget`,
          beginning_balance_actuals:`${ccddd}_beginning_balance_actuals`,
          cashflow_budget: `${ccddd}_cashflow_budget`,
          cashflow_actuals:`${ccddd}_cashflow_actuals`,
        }
      );

  const compensation = compensationDf
      .groupby('class_of')
      .rename(
        {
          allStaffComp: `${ccddd}_allStaffComp`,
          teachingComp: `${ccddd}_teachingComp`,
          studentSupportComp: `${ccddd}_studentSupportComp`,
          buildingSupportComp: `${ccddd}_buildingSupportComp`,
          otherComp: `${ccddd}_otherComp`,
        })
      .pivot('data_type', [
        `${ccddd}_allStaffComp`,
        `${ccddd}_teachingComp`,
        `${ccddd}_studentSupportComp`,
        `${ccddd}_buildingSupportComp`,
        `${ccddd}_otherComp`,
      ]);

  return enrollment.join_full(staffing).join_full(balances).join_full(compensation);
}
