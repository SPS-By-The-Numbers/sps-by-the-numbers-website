import * as aq from 'arquero';
import { op } from 'arquero';

import DutyRoots from 'app/finance/DutyRoots';

import type { ColumnTable } from 'arquero';
import type DistrictData from 'utilities/DistrictData';

export type SortType = "variance";
export type SortOrder = "ascending" | "descending";
export type FacetInfo = {
  code: number;
  title: string;
};

export type CurrencyNormalization =
  "amount"       // Raw amount. No normalization
  | "pctexp"     // Percent of total expenditures.
  | "pctrev"     // Percent of total revenues.
  | "pctcomp"    // Percent total expenditures on compensation.
  | "pctsalary"  // Percent total expenditures on salary.
;

export type StaffingNormalization =
  "amount"       // Raw amount. No normalization.
  | "pctfte"     // Percent of total staffing.
;

function sortOrderOp(sortOrder : SortOrder, expr) {
  if (sortOrder === 'ascending') {
    return expr;
  } else if (sortOrder === 'descending') {
    return aq.desc(expr);
  }

  throw `Unknown sort order ${sortOrder}`;
}

// Returns data with one entry in the "class_of" column for each year and most column
// representing one chartable metric or aggregation.
//
// Columns representing a chartable metric has a column name with this format:
//
//   ${ccddd]_${normalization}_${metric}_${budget/actuals}
//
//  Example for amount of activity_code 11 in actuals for 17001 would be:
//
//    17001_amount_act11_actuals
//
//  where act is the shortening for activity_code
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
      .orderby(sortOrderOp(sortOrder, 'absmedian'))
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

// ${ccddd]_amount_${nces_code}_${budget/actual}
export function makeChartableNces(
    ccddd: number,
    raw_df: ColumnTable,
    facetColumn: string,
    sortType: SortType,
    sortOrder: SortOrder) : [ColumnTable, Array<FacetInfo>] {
  try {
    const facetCodeColumn = `${facetColumn}_code`;

    // NCES codes only work with actuals.
    // TODO: Remove sample!
    const df = raw_df.filter(d => d.nces_code !== null);

    // Sort by biggest.
    const facetInfoSorted = df
      .groupby('class_of', facetColumn, facetCodeColumn)
      .rollup({amount: op.sum('amount') })
      .groupby(facetColumn, facetCodeColumn)
      .rollup({medamount: op.median(`amount`)})
      .orderby(sortOrderOp(sortOrder, 'medamount'))
      .derive({
        facet_info: aq.escape(
          d => ({
            code: d[facetCodeColumn],
            title: d[facetColumn],
          })
        )
      })
      .array('facet_info');

    const data = df.groupby('class_of')
      .pivot([facetCodeColumn, 'data_type'], {
        [`${ccddd}_amount`]: d => op.sum(d.amount),
          _pivot_name_hack_: d => op.any('_pivot_name_hack_')
      })
      .select(aq.not('_pivot_name_hack_'));

      return [data, facetInfoSorted as Array<FacetInfo>];
  } catch (e) {
    console.warn("No data");
    return [raw_df.groupby('class_of').rollup(), []];
  }
}

// Returns data with one entry in the "class_of" column for each year and most column
// representing one duty_root.  It uses the same format as makeChartableExpenditures
// but facet is always dutyRoot data is always actuals.
//
// The metric_name can be fte or salary or estTotalComp.
//
//   ${ccddd]_${metric_name}_dutyRoot_actuals
export function makeChartableStaffing(
    ccddd: number,
    rawDf: ColumnTable,
    sortType: "range",
    sortOrder: SortOrder) : [ColumnTable, Array<FacetInfo>] {
  try {
    const df = rawDf
      .groupby('class_of', 'duty_root_code')
      .rollup({
        finalSalary: op.sum('c_est_total_final_salary'),
        fte: op.sum('fte_in_assignment'),
      })
      .derive({data_type: () => 'actuals'});  // synthetically make it actuals.

      // TODO: is this conceptually a budget?
      //initial_sal: op.sum('c_est_total_initial_salary'),

    const facetInfoSorted = df
      .groupby('duty_root_code')
      .derive({
        lastFte: d => op.last_value(d.fte),
        firstFte: d => op.last_value(d.fte),
      })
      .derive({growth: d => d.lastFte - d.firstFte})
      .orderby(aq.desc('lastFte'))
      .derive({
        facet_info: aq.escape(
          d => ({
            code: d['duty_root_code'],
            title: DutyRoots[d['duty_root_code']] ?? "Unknown",
          })
        )
      })
      .array('facet_info');

    const data = df
      .groupby('class_of')
      .pivot(['duty_root_code', 'data_type'], {
        // TODO: rename to total_initial_assignment_salary.
        [`${ccddd}_finalSalary`]: d => op.sum(d.finalSalary),
        [`${ccddd}_fte`]: d => op.sum(d.fte),
      });

    return [data, facetInfoSorted as Array<FacetInfo>];
  } catch (e) {
    console.warn("No data", e);
    return [rawDf.groupby('class_of').rollup(), []];
  }
}

export function extractNormalizationDf(districtData: DistrictData,
                                       currencyNormalization: CurrencyNormalization) {
  if (currencyNormalization === "amount") {
    const data_types = aq.table({data_type: ['budget', 'actuals']});
    return districtData.all_class_ofs()
      .cross(data_types)
      .derive({norm: 1});
  } if (currencyNormalization === "pctexp") {
    return districtData.expenditures()
      .groupby(['data_type', 'class_of'])
      .rollup({norm: d => op.sum(d.amount) / 100});
  } else if (currencyNormalization === "pctrev") {
    return districtData.revenues()
      .groupby(['data_type', 'class_of'])
      .rollup({norm: d => op.sum(d.amount) / 100});
  } else if (currencyNormalization === "pctcomp") {
    return districtData.compensation()
      .groupby(['data_type', 'class_of'])
      .derive({norm: d => d.allStaffComp / 100});
  } else if (currencyNormalization === "pctsalary") {
    throw `Not implemented`;
  }

  throw `Invalid Normalizaiton: ${currencyNormalization}`;
}

