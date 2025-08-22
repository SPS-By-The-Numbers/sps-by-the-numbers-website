const YEAR_GROUP_BY = ["school_starting_year"];
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
  let mask = null;
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
  let mask = null;
  for (const v of values) {
    if (mask === null) {
      mask = df[field].ne(v);
    } else {
      mask = mask.and(df[field].ne(v));
    }
  }

  return mask;
}

async function fetchDataset(dfd, ccddd, dataset) {
  // Pass in dfd so that this code can be reused by nodejs or browser entrypoints.
  return dfd.readCSV(`http://localhost:3000/_TEMP_${dataset}_${ccddd}.csv`);
}

function fieldFoldl(dataframes, field, f, initial) {
  let ret = initial;
  for (const df of dataframes) {
    ret = f(ret, df[field].count());
  }
  return ret;
}

export default class DistrictData {

  constructor(dfd, enrollment_df, gfe_df, gfr_df) {
    this.dfd = dfd;

    this.enrollment_df = enrollment_df;
    this.enrollment_df.rename({ "year": "school_starting_year" }, { axis: 1, inplace: true });
    this.enrollment_df.rename({ "total": "total_enrollment" }, { axis: 1, inplace: true });
    this.gfe_df = gfe_df;
    this.gfr_df = gfr_df;

    let all_school_years_df = this.dfd.concat({
      dfList: [
        this.enrollment_df["school_starting_year"],
        this.gfe_df["school_starting_year"],
        this.gfr_df["school_starting_year"],
      ],
      axis: 1
    });
    
    const minYear = all_school_years_df["school_starting_year"].min();
    const maxYear = all_school_years_df["school_starting_year"].max();

    const all_school_years = [];
    for (let year = minYear; year <= maxYear; year++) {
      all_school_years.push(year);
    }

    this.all_school_years_df = new this.dfd.DataFrame({"school_starting_year": all_school_years})
  }

  static async loadFromGcs(dfd, ccddd) {
    const [enrollment_df, gfe_df, gfr_df] = await Promise.all(
      [
        fetchDataset(dfd, ccddd, "enrollment"),
        fetchDataset(dfd, ccddd, "gfe"),
        fetchDataset(dfd, ccddd, "gfr"),
      ]
    );
    return new DistrictData(dfd, enrollment_df, gfe_df, gfr_df);
  }

  static async loadTest(real_dfd) {
    return await DistrictData.loadFromGcs(real_dfd, 17001);
  }

  toplevel_metrics() {
    let merged_df = this.merge(
      this.cashflow(),
      this.enrollment().loc({columns: ["school_starting_year", "total_enrollment"]})
    );
    merged_df = this.merge(merged_df, this.key_expenditures());

    return merged_df;
  }

  key_expenditures() {
    const key_metric = 'c_pct_expenditure';
    const comp_only = doQuery(
      this.gfe_df,
      inMask(this.gfe_df, "object_code", COMP_OBJECT_CODES)
    );

    let non_comp_df = this.expenditureSum(
      "non_comp",
      doQuery(
        this.gfe_df,
        notInMask(this.gfe_df, "object_code", COMP_OBJECT_CODES)
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
    const expenditures_df = financeGroupSumAmount("expenditures", this.gfe_df);
    const revenues_df = financeGroupSumAmount("revenues", this.gfr_df);

    // Put expenses + revenues onto one sheet dropping missing years.
    let merged_df = this.merge(expenditures_df, revenues_df, FINANCE_GROUP_BY);

    // Calculate cashflow.
    merged_df = merged_df.addColumn("cashflow", merged_df["revenues"].sub(merged_df["expenditures"]));
    const cashflows = this.pivotBudgetActuals("cashflow", merged_df, YEAR_GROUP_BY);

    // Add missing years to all things have the same axis.
    return this.fillYears(cashflows);
  }

  enrollment() {
    return this.fillYears(this.enrollment_df);
  }

  debug() {
    this.enrollment_df.head().print();
    this.gfe_df.head().print();
    this.gfr_df.head().print();
  }

  merge(left, right, on=["school_starting_year"], how="inner") {
    return this.dfd.merge({left, right, on, how});
  }

  fillYears(df) {
    return this.dfd.merge(
      {
        left: this.all_school_years_df,
        right: df,
        on: ["school_starting_year"],
        how: "left"
      });
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
