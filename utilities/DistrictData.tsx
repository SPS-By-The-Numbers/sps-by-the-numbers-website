import { fetchEndpoint } from 'utilities/client/endpoint';

import type { DataFrame } from 'danfojs';

const YEAR_GROUP_BY = ["class_of"];
const FINANCE_GROUP_BY = ["data_type", ...YEAR_GROUP_BY];

const COMP_OBJECT_CODES = [
  2,  // Certificated Salary
  3,  // Classified Salary
  4,  // Benefits
];

const TEACHING_CODES = [
  27,  // Teaching
  28,  // Extracurricular
  34,  // Professional Learning - State (funds part of teacher salary. Not all budget systems can account for it but it shows up in actuals)
];

const STUDENT_SUPPORT_CODES = [
  23,  // Principal's Office
  24,  // Guidance and Counseling
  25,  // Pupil Management and Safety
  26,  // Health and Related Services
  84,  // Principal
];

const BUILDING_SUPPORT = [
  62,  // Grounds Maintenanceko
  63,  // Operations of Building
  64,  // Maintenance
];

function financeGroupSumAmount(new_col_name, df, col_to_sum="amount") {
  const grouped = df.groupby(FINANCE_GROUP_BY).col([col_to_sum]).sum();
  grouped.rename({ [`${col_to_sum}_sum`]: new_col_name }, { axis: 1, inplace: true });
  return grouped;
}

function doQuery(df, query) {
  // HACK: danfo query chaining seems to break unless the index is reset.
  // This wrapper makes sure queries can be chained.
  const result = df.query(query);
  result.resetIndex({inplace: true});
  return result;
}

function inMask(df, field, values) {
  let mask : any = null;
  for (const v of values) {
    if (mask === null) {
      mask = df[field].eq(v);
    } else {
      mask = mask.or(df[field].eq(v));
    }
  }

  return mask;
}

function notInMask(df, field, values) {
  let mask : any = null;
  for (const v of values) {
    if (mask === null) {
      mask = df[field].ne(v);
    } else {
      mask = mask.and(df[field].ne(v));
    }
  }

  return mask;
}


export async function fetchDatasetStream(ccddd, dataset) {
  // Pass in dfd so that this code can be reused by nodejs or browser entrypoints.
  const datasetResponse = await fetchEndpoint('finance', 'GET', {ccddd, dataset});
  if (!datasetResponse.ok) {
    console.error(datasetResponse);
    return '';
  }

  const csvResponse = await fetch(datasetResponse.data.dataUrl);
  if (csvResponse === null || csvResponse.status !== 200 || csvResponse.body === null) {
    console.error('fetch failed: ', csvResponse);
    throw 'fetch failed';
  }

  return csvResponse.body.pipeThrough(new DecompressionStream('gzip'));
}

export async function fetchDataset(dfd, ccddd, dataset) {
  const csvBlob = await new Response(await fetchDatasetStream(ccddd, dataset)).blob();
  return dfd.readCSV(new File([csvBlob], `${dataset}-${ccddd}.csv`, { type: 'text/csv' }));
}

function fieldFoldl(dataframes, field, f, initial) {
  let ret = initial;
  for (const df of dataframes) {
    ret = f(ret, df[field].count());
  }
  return ret;
}

export default class DistrictData {
  private dfd : any;
  private enrollment_df : DataFrame;
  private gf_expenditure_df : DataFrame;
  private gf_revenue_df : DataFrame;
  private budget_items_df : DataFrame;
  private actuals_items_df : DataFrame;
  private s275_summary_df : DataFrame;
  private all_school_years_df : DataFrame;

  constructor(dfd, enrollment_df, gf_expenditure_df, gf_revenue_df,
              budget_items_df, actuals_items_df, s275_summary_df) {
    this.dfd = dfd;

    this.enrollment_df = enrollment_df;
    this.gf_expenditure_df = gf_expenditure_df;
    this.gf_revenue_df = gf_revenue_df;
    this.budget_items_df = budget_items_df;
    this.actuals_items_df = actuals_items_df;
    this.s275_summary_df = s275_summary_df;

    let all_school_years_df = this.dfd.concat({
      dfList: [
        this.enrollment_df["class_of"],
        this.gf_expenditure_df["class_of"],
        this.gf_revenue_df["class_of"],
      ],
      axis: 1
    });
    
    const minYear = all_school_years_df["class_of"].min();
    const maxYear = all_school_years_df["class_of"].max();

    const all_school_years = new Array<number>();
    for (let year = minYear; year <= maxYear; year++) {
      all_school_years.push(year);
    }

    this.all_school_years_df = new this.dfd.DataFrame({"class_of": all_school_years});
  }

  static async loadFromGcs(dfd, ccddd) {
    const [enrollment_df, gf_expenditure_df, gf_revenue_df,
           budget_items_df, actuals_items_df, s275_summary_df] = await Promise.all(
      [
        fetchDataset(dfd, ccddd, "enrollment"),
        fetchDataset(dfd, ccddd, "gf_expenditures"),
        fetchDataset(dfd, ccddd, "gf_revenues"),
        fetchDataset(dfd, ccddd, "budget_items"),
        fetchDataset(dfd, ccddd, "actuals_items"),
        fetchDataset(dfd, ccddd, "s275_summary"),
      ]
    );
    return new DistrictData(dfd, enrollment_df, gf_expenditure_df, gf_revenue_df,
                           budget_items_df, actuals_items_df, s275_summary_df);
  }

  static async loadTest(real_dfd) {
    return await DistrictData.loadFromGcs(real_dfd, 17001);
  }

  toplevel_metrics() {
    let merged_df = this.merge(
      this.cashflow(),
      this.enrollment().loc({columns: ["class_of", "enrollment_actuals", "enrollment_budget"]}),
    );
    merged_df = this.merge(merged_df, this.key_expenditures());
    merged_df = this.merge(merged_df, this.staffing());

    // Label covid type.
    merged_df.addColumn(
      'covid_type',
      merged_df["class_of"].apply((year) => {
        if (year < 2020) {
          return 4;
        } else if (year < 2022) {
          return 2;
        } else {
          return 8;
        }
      }),
      { inplace: true }
    );

    return merged_df;
  }

  staffing() {
    const staffFteActuals = this.s275_summary_df.
      groupby(['class_of']).
      col(['fte_in_assignment']).
      sum().
      rename({fte_in_assignment_sum: 'staff_fte_actuals'}, {axis:1});

    const staffFteBudget = this.budget_items_df.query(
      // 317 is certificated FTE counts
      // 318 is classified FTE counts.
      this.budget_items_df['item_code'].eq(317).or(
        this.budget_items_df['item_code'].eq(318))
    ).groupby(['class_of']).
      col(['amount']).
      sum().
      rename({amount_sum: 'staff_fte_budget'}, {axis:1});

    let staff_fte = this.merge(staffFteActuals, staffFteBudget,
                                 ["class_of"], "outer");

    const add_data = (name_root, codes, target_df) => {
      const result = doQuery(
        this.s275_summary_df,
        inMask(this.s275_summary_df, "activity_code", codes)
      ).
        groupby(['class_of']).
        col(['fte_in_assignment']).
        sum().
        rename({fte_in_assignment_sum: `${name_root}_actuals`}, {axis:1});

      return this.merge(target_df, result,
                        ["class_of"], "outer");

    };
    staff_fte = add_data('teaching_fte', TEACHING_CODES, staff_fte);
    staff_fte = add_data('student_support_fte', STUDENT_SUPPORT_CODES, staff_fte);
    staff_fte = add_data('building_support_fte', BUILDING_SUPPORT, staff_fte);

    const non_teaching_fte =
      doQuery(
        this.s275_summary_df,
        notInMask(this.s275_summary_df, "activity_code", [
          ...TEACHING_CODES,
          ...STUDENT_SUPPORT_CODES,
          ...BUILDING_SUPPORT])
      ).
      groupby(['class_of']).
      col(['fte_in_assignment']).
      sum().
      rename({fte_in_assignment_sum: 'non_teaching_fte_actuals'}, {axis:1});
    staff_fte = this.merge(staff_fte, non_teaching_fte,
                           ["class_of"], "outer");


    return this.fillYears(staff_fte);
  }

  key_expenditures() {
    const key_metric = 'c_pct_expenditure';
    const comp_only = doQuery(
      this.gf_expenditure_df,
      inMask(this.gf_expenditure_df, "object_code", COMP_OBJECT_CODES)
    );

    let non_comp_df = this.expenditureSum(
      "non_comp",
      doQuery(
        this.gf_expenditure_df,
        notInMask(this.gf_expenditure_df, "object_code", COMP_OBJECT_CODES)
      )
    );

    let teaching_related_comp = this.expenditureSum(
      "teaching_related_comp",
      doQuery(
        comp_only,
        inMask(comp_only, "activity_code", TEACHING_CODES))
    );

    let other_comp = this.expenditureSum(
      "other_comp",
      doQuery(
        comp_only,
        notInMask(comp_only, "activity_code", TEACHING_CODES))
    );

    let result = this.merge(
      non_comp_df,
      teaching_related_comp);
    result = this.merge(result, other_comp);
    return this.fillYears(result);
  }

  cashflow() {
    const expenditures_df = financeGroupSumAmount("expenditures", this.gf_expenditure_df);
    const revenues_df = financeGroupSumAmount("revenues", this.gf_revenue_df);

    // Put expenses + revenues onto one sheet dropping missing years.
    let merged_df = this.merge(expenditures_df, revenues_df, FINANCE_GROUP_BY);

    // Calculate cashflow.
    merged_df = merged_df.addColumn("cashflow", merged_df["revenues"].sub(merged_df["expenditures"]));
    const cashflows = this.pivotBudgetActuals("cashflow", merged_df, YEAR_GROUP_BY);

    // Add missing years to all things have the same axis.
    return this.fillYears(cashflows);
  }

  enrollment() {
    const k12EnrollmentActuals = this.enrollment_df.query(
      this.enrollment_df['enrollment_domain'].eq('K-12 FTE').or(
        this.enrollment_df['enrollment_domain'].eq('K-12 FTE - Includes ALE')))
        .groupby(['class_of']).col(['amount'])
        .sum();
    k12EnrollmentActuals.rename({ 'amount_sum': `enrollment_actuals` }, { axis: 1, inplace: true });

    // 314 is the item code for total K-12 enrollment FTE in the F195.
    const k12EnrollmentBudget = this.budget_items_df.query(
      this.budget_items_df['item_code'].eq(314)).
        loc({columns: ['amount', 'class_of']}).
        rename({amount: 'enrollment_budget'}, {axis:1});

    const k12Enrollment = this.merge(k12EnrollmentActuals, k12EnrollmentBudget,
                                     ["class_of"], "outer");

    return this.fillYears(k12Enrollment);
  }

  merge(left, right, on=["class_of"], how="inner") {
    return this.dfd.merge({left, right, on, how});
  }

  fillYears(df) {
    return this.merge(this.all_school_years_df, df, ["class_of"], "left");
  }

  pivotBudgetActuals(col_name, df, preserverd_cols) {
    const actuals_df = df.loc({
      rows: df['data_type'].eq('actuals'),
      columns: [...preserverd_cols, col_name]
    });
    const budget_df = df.loc({
      rows: df['data_type'].eq('budget'),
      columns: [...preserverd_cols, col_name]
    });

    actuals_df.rename({ [col_name]: `${col_name}_actuals` }, { axis: 1, inplace: true });
    budget_df.rename({ [col_name]: `${col_name}_budget` }, { axis: 1, inplace: true });
    return this.merge(actuals_df, budget_df);
  }

  // Returns sums of amount and c_pct_expenditure columns for
  // budget and actuals ia given dataframe.
  expenditureSum(new_col_prefix, df) {
    const amt_col_name = `${new_col_prefix}_amt`;

    let amt = financeGroupSumAmount(amt_col_name, df, "amount");
    amt = this.pivotBudgetActuals(amt_col_name, amt, YEAR_GROUP_BY);

    const pct_col_name = `${new_col_prefix}_pct_expenditure`;
    let pct_expenditure = financeGroupSumAmount(pct_col_name, df, "c_pct_expenditure");
    pct_expenditure = this.pivotBudgetActuals(pct_col_name, pct_expenditure, YEAR_GROUP_BY);

    return this.merge(amt, pct_expenditure);
  }

};
