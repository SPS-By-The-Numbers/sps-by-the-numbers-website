import { op } from "arquero";
import * as aq from "arquero";
import { fetchDataset } from "utilities/client/FetchData";

import type { ColumnTable } from "arquero";

// Combining activities that have been split over the years so they can
// be compared with history.
export const SYNTH_ACT_CODE_TEACHING = 9990;
export const SYNTH_ACT_TEACHING = "Teaching (27) / Professional Learning (34)";
export const SYNTH_ACT_CODE_PRINCIPAL_OFFICE = 9991;
export const SYNTH_ACT_PRINCPAL_OFFICE = "Principal's Office (23) / Principal (84)";

export type AFilters = {
  activityCodes: Set<number>;
};

export type PFilters = {
  programCodes: Set<number>;
}

export type OFilters = {
  objectCodes: Set<number>;
};

export type PAFilters = PFilters & AFilters;

export type PAOFilters = PAFilters & AFilters & OFilters;

export type NcesFilters = {
  ncesCodes: Set<number>;
};

export type SchoolFilters = {
  schoolCodes: Set<number>;
};

export type DutyRootFilters = {
  dutyRootCodes: Set<number>;
};

type ExpendituresFilters = Partial<PAOFilters & NcesFilters & SchoolFilters>;
type StaffingFilters = Partial<PAFilters & DutyRootFilters & SchoolFilters>;

const YEAR_GROUP_BY = ["class_of"];
const FINANCE_GROUP_BY = ["data_type", ...YEAR_GROUP_BY];

const SALARY_OBJECT_CODES = [
  2, // Certificated Salary
  3, // Classified Salary
];

const BENEFITS_OBJECT_CODES = [
  4, // Benefits
];

const COMP_OBJECT_CODES = [...SALARY_OBJECT_CODES, ...BENEFITS_OBJECT_CODES];

const TEACHING_CODES = [
  SYNTH_ACT_CODE_TEACHING,
  28, // Extracurricular
];

const STUDENT_SUPPORT_CODES = [
  SYNTH_ACT_CODE_PRINCIPAL_OFFICE,
  24, // Guidance and Counseling
  25, // Pupil Management and Safety
  26, // Health and Related Services
  35, // Pupil Safety
];

const BUILDING_SUPPORT = [
  62, // Grounds Maintenance
  63, // Operations of Building
  64, // Maintenance
  65, // Utilities
  67, // Building and Property Security
  68, // Insurance - Maintenance and Operations
];

function financeGroupSumAmount(new_col_name, df, col_to_sum) {
  return df
    .groupby(["data_type", "class_of"])
    .rollup({ [new_col_name]: op.sum(col_to_sum) });
}

function minMaxClassOf(df) {
  return df
    .select("class_of")
    .rollup({ min: op.min("class_of"), max: op.max("class_of") });
}

// TODO: Merge with combineActivitiesS275
function combineActivitiesF19x(df, codes, synth_activity_code, synth_activity) {
  const nonActivityColumns = df.columnNames(
    (c) => !["activity_code", "activity", "amount"].includes(c),
  );

  const summed = df
    .params({ codes, synth_activity, synth_activity_code })
    .filter((d, $) => op.includes($.codes, d.activity_code))
    .groupby(...nonActivityColumns)
    .rollup({
      amount: (d) => op.sum(d.amount),
      activity_code: (_, $) => $.synth_activity_code,
      activity: (_, $) => $.synth_activity,
    });

  const others = df
    .params({ codes })
    .filter((d, $) => !op.includes($.codes, d.activity_code));

  const result = others.union(summed);
  return result;
}

// TODO: Merge with combineActivitiesF19x
function combineActivitiesS275(df, codes, synth_activity_code, synth_activity) {
  const nonActivityColumns = df.columnNames(
    (c) =>
      ![
        "activity_code",
        "activity",
        "c_est_total_initial_salary",
        "c_est_total_initial_salary",
        "c_est_total_initial_salary",
      ].includes(c),
  );

  const summed = df
    .params({ codes, synth_activity, synth_activity_code })
    .filter((d, $) => op.includes($.codes, d.activity_code))
    .groupby(...nonActivityColumns)
    .rollup({
      c_est_total_initial_salary: (d) => op.sum(d.c_est_total_initial_salary),
      c_est_total_final_salary: (d) => op.sum(d.c_est_total_final_salary),
      fte_in_assignment: (d) => op.sum(d.fte_in_assignment),
      activity_code: (_, $) => $.synth_activity_code,
      activity: (_, $) => $.synth_activity,
    });

  const others = df
    .params({ codes })
    .filter((d, $) => !op.includes($.codes, d.activity_code));

  const result = others.union(summed);
  return result;
}

function combineCommonActivities(df, combiner) {
  df = combiner(
    df,
    // 27 - Teaching
    // 34 - Professional Learning - State (funds part of teacher salary. Not all budget systems can account for it but it shows up in actuals)
    [27, 34],
    SYNTH_ACT_CODE_TEACHING,
    SYNTH_ACT_TEACHING,
  );
  df = combiner(
    df,
    // 84 - Principal
    // 23 - Principal's Office
    [84, 23],
    SYNTH_ACT_CODE_PRINCIPAL_OFFICE,
    SYNTH_ACT_PRINCPAL_OFFICE,
  );
  return df;
}

// Fetches the dataset for one district. It provides minimal processing
// to produce consistent data over time (eg combining activities that have been
// split) basic filtering and data tables for common semantic
// groupings of information and calculations.
//
// Data is joinable on the 'class_of' and 'data_type' columns.
export default class DistrictData {
  private fundedEnrollment_df: ColumnTable;
  private gf_expenditure_df: ColumnTable;
  private gf_revenue_df: ColumnTable;
  private budget_items_df: ColumnTable;
  private actuals_items_df: ColumnTable;
  private s275_summary_df: ColumnTable;
  private all_class_ofs_df: ColumnTable;

  constructor(
    fundedEnrollment_df,
    gf_expenditure_df,
    gf_revenue_df,
    budget_items_df,
    actuals_items_df,
    s275_summary_df,
  ) {
    this.fundedEnrollment_df = fundedEnrollment_df;
    this.gf_expenditure_df = gf_expenditure_df;
    this.gf_revenue_df = gf_revenue_df;
    this.budget_items_df = budget_items_df;
    this.actuals_items_df = actuals_items_df;
    this.s275_summary_df = s275_summary_df;

    // Create synthetic activities for categories that have split over the
    // years such as Teaching + Professional Learning. In this case, it
    // replaces the activity code 27 and 34 with their summation labeled
    // with a synthetic activity code.
    this.gf_expenditure_df = combineCommonActivities(
      this.gf_expenditure_df,
      combineActivitiesF19x,
    );
    this.s275_summary_df = combineCommonActivities(
      this.s275_summary_df,
      combineActivitiesS275,
    );

    const minMaxDf = minMaxClassOf(this.fundedEnrollment_df)
      .concat(minMaxClassOf(this.gf_expenditure_df))
      .concat(minMaxClassOf(this.gf_revenue_df))
      .rollup({ min: op.min("min"), max: op.max("max") });

    const minYear = minMaxDf.get("min", 0);
    const maxYear = minMaxDf.get("max", 0);

    const all_class_ofs = new Array<number>();
    for (let year = minYear; year <= maxYear; year++) {
      all_class_ofs.push(year);
    }

    this.all_class_ofs_df = aq.table({ class_of: all_class_ofs });
  }

  static async loadFromGcs(ccddd) {
    const [
      fundedEnrollment_df,
      gf_expenditure_df,
      gf_revenue_df,
      budget_items_df,
      actuals_items_df,
      s275_summary_df,
    ] = await Promise.all([
      fetchDataset(ccddd, "fundedEnrollment"),
      fetchDataset(ccddd, "gf_expenditures"),
      fetchDataset(ccddd, "gf_revenues"),
      fetchDataset(ccddd, "budget_items"),
      fetchDataset(ccddd, "actuals_items"),
      fetchDataset(ccddd, "s275_summary"),
    ]);
    return new DistrictData(
      fundedEnrollment_df,
      gf_expenditure_df,
      gf_revenue_df,
      budget_items_df,
      actuals_items_df,
      s275_summary_df,
    );
  }

  // Direct accessors
  fundedEnrollment() {
    return this.fundedEnrollment_df;
  }

  expenditures() {
    return this.gf_expenditure_df;
  }

  revenues() {
    return this.gf_revenue_df;
  }

  all_class_ofs() {
    return this.all_class_ofs_df;
  }

  // Summary accessors
  staffingSummary() {
    const staffFteActuals = this.s275_summary_df.groupby(["class_of"]).rollup({
      data_type: () => "actuals",
      staffFte: op.sum("fte_in_assignment"),
    });

    // 317 is certificated FTE counts
    // 318 is classified FTE counts.
    const staffFteBudget = this.budget_items_df
      .filter((d) => op.includes(["317", "318"], d.item_code))
      .groupby("class_of")
      .rollup({ data_type: () => "budget", staffFte: op.sum("amount") });

    const teachingFteActuals = this.s275_summary_df
      .filter(aq.escape((d) => op.includes(TEACHING_CODES, d.activity_code)))
      .groupby("class_of")
      .rollup({
        data_type: () => "actuals",
        teachingFte: op.sum("fte_in_assignment"),
      });

    const studentSupportFte = this.s275_summary_df
      .filter(
        aq.escape((d) => op.includes(STUDENT_SUPPORT_CODES, d.activity_code)),
      )
      .groupby("class_of")
      .rollup({
        data_type: () => "actuals",
        studentSupportFte: op.sum("fte_in_assignment"),
      });

    const buildingSupportFte = this.s275_summary_df
      .filter(aq.escape((d) => op.includes(BUILDING_SUPPORT, d.activity_code)))
      .groupby("class_of")
      .rollup({
        data_type: () => "actuals",
        buildingSupportFte: op.sum("fte_in_assignment"),
      });

    const otherFte = this.s275_summary_df
      .filter(
        aq.escape(
          (d) =>
            !op.includes(
              [
                ...TEACHING_CODES,
                ...STUDENT_SUPPORT_CODES,
                ...BUILDING_SUPPORT,
              ],
              d.activity_code,
            ),
        ),
      )
      .groupby("class_of")
      .rollup({
        data_type: () => "actuals",
        otherFte: op.sum("fte_in_assignment"),
      });

    return staffFteActuals
      .join_full(staffFteBudget)
      .join_full(teachingFteActuals)
      .join_full(studentSupportFte)
      .join_full(buildingSupportFte)
      .join_full(otherFte);
  }

  // Returns a bunch of roll-ups related to compensation. Compensation is tricky
  // because there are multiple data sources that overlap and are not fully complete.
  //
  // From the s275, there is the total_final_salary per position which comes from
  // payroll and should be accurate. It matches Object codes 2 and 3 for salary.
  // However, the entire s275 sticks to the staff list on Oct 1st and can have
  // errors. It doesn't fully reconcile with the f196 data.
  //
  // Benefits overall are not assigned to any single staff member in the s275
  // so trying to reconcile total compensation in a way that can be cut apart
  // by consistently is difficult.  The F195 and F196 can be compared by PAO
  // codes, but the s275 cannot be done without making estimates.
  compensation() {
    const allStaffComp = this.gf_expenditure_df
      .filter(aq.escape((d) => op.includes(COMP_OBJECT_CODES, d.object_code)))
      .groupby("data_type", "class_of")
      .rollup({ allStaffComp: op.sum("amount") });

    const teachingRelatedComp = this.gf_expenditure_df
      .filter(
        aq.escape(
          (d) =>
            op.includes(TEACHING_CODES, d.activity_code) &&
            op.includes(COMP_OBJECT_CODES, d.object_code),
        ),
      )
      .groupby("data_type", "class_of")
      .rollup({ teachingComp: op.sum("amount") });

    const studentSupportComp = this.gf_expenditure_df
      .filter(
        aq.escape(
          (d) =>
            op.includes(STUDENT_SUPPORT_CODES, d.activity_code) &&
            op.includes(COMP_OBJECT_CODES, d.object_code),
        ),
      )
      .groupby("data_type", "class_of")
      .rollup({ studentSupportComp: op.sum("amount") });

    const buildingSupportComp = this.gf_expenditure_df
      .filter(
        aq.escape(
          (d) =>
            op.includes(BUILDING_SUPPORT, d.activity_code) &&
            op.includes(COMP_OBJECT_CODES, d.object_code),
        ),
      )
      .groupby("data_type", "class_of")
      .rollup({ buildingSupportComp: op.sum("amount") });

    const otherComp = this.gf_expenditure_df
      .filter(
        aq.escape(
          (d) =>
            op.includes(COMP_OBJECT_CODES, d.object_code) &&
            !op.includes(
              [
                ...TEACHING_CODES,
                ...STUDENT_SUPPORT_CODES,
                ...BUILDING_SUPPORT,
              ],
              d.activity_code,
            ),
        ),
      )
      .groupby("data_type", "class_of")
      .rollup({ otherComp: op.sum("amount") });

    const rawResult = allStaffComp
      .join_full(teachingRelatedComp)
      .join_full(studentSupportComp)
      .join_full(buildingSupportComp)
      .join_full(otherComp);

    return rawResult;
  }

  s275Summary() {
    return this.s275_summary_df;
  }

  filteredS275Summary(staffingFilter : StaffingFilters) {
    let results = this.s275_summary_df;

    if (staffingFilter.programCodes !== undefined) {
      results = results
        .params(staffingFilter)
        .filter((d, $) => d.includes([...$.programCodes], d.program_code));
    }

    if (staffingFilter.activityCodes !== undefined) {
      results = results
        .params(staffingFilter)
        .filter((d, $) => d.includes([...$.activityCodes], d.activity_code));
    }

    if (staffingFilter.schoolCodes !== undefined) {
      results = results
        .params(staffingFilter)
        .filter((d, $) => d.includes([...$.schoolCodes], d.school_code));
    }

    if (staffingFilter.dutyRootCodes !== undefined) {
      results = results
        .params(staffingFilter)
        .filter((d, $) => d.includes([...$.dutyRootCodes], d.duty_root_code));
    }

    return results;
  }

  balances() {
    const beginningBalanceBudget = this.budget_items_df
      .filter(aq.escape((d) => d.item_code === "275" && d.fund_code === 1))
      .groupby("class_of")
      .rollup({
        data_type: () => "budget",
        beginningBalance: op.sum("amount"),
      });

    const endingBalanceBudget = this.budget_items_df
      .filter(aq.escape((d) => d.item_code === "439" && d.fund_code === 1))
      .groupby("class_of")
      .rollup({ data_type: () => "budget", endingBalance: op.sum("amount") });

    const beginningBalanceActuals = this.actuals_items_df
      .filter(aq.escape((d) => d.item_code === "275" && d.fund_code === 1))
      .groupby("class_of")
      .rollup({
        data_type: () => "actuals",
        beginningBalance: op.sum("amount"),
      });

    const endingBalanceActuals = this.actuals_items_df
      .filter(aq.escape((d) => d.item_code === "439" && d.fund_code === 1))
      .groupby("class_of")
      .rollup({ data_type: () => "actuals", endingBalance: op.sum("amount") });

    const beginningBalance = beginningBalanceBudget.join_full(
      beginningBalanceActuals,
    );
    const endingBalance = endingBalanceBudget.join_full(endingBalanceActuals);

    return beginningBalance.join_full(endingBalance);
  }

  cashflow() {
    const expenditures_df = financeGroupSumAmount(
      "expenditures",
      this.gf_expenditure_df,
      "amount",
    );
    const revenues_df = financeGroupSumAmount(
      "revenues",
      this.gf_revenue_df,
      "amount",
    );

    // Put expenses + revenues onto one sheet preserving incomplete years
    // and calculate cashflow.
    const merged_df = expenditures_df
      .join_full(revenues_df)
      .derive({ cashflow: (d) => d.revenues - d.expenditures });
    return merged_df;
  }

  fundedEnrollmentSummary() {
    const k12EnrollmentActuals = this.fundedEnrollment_df
      .filter((d) =>
        op.includes(
          ["K-12 FTE", "K-12 FTE - Includes ALE"],
          d.fundedEnrollment_domain,
        ),
      )
      .groupby("class_of")
      .rollup({
        data_type: () => "actuals",
        fundedEnrollment: op.sum("amount"),
      });

    // K-12 FTE from the p223 confusingly is NOT the
    // "Total K-12 FTE Enrollment Counts" (item code 314) in the F195.
    //
    // Item 314 in F195 includes also the Running Start and Drop Out Reengagement.
    //
    // The equivalent number from the F195 is actually the sum of these two item codes
    //  327 - Subtotal K-12
    //  148 - ALE Enrollment
    const k12EnrollmentBudget = this.budget_items_df
      .filter((d) => op.includes(["327", "148"], d.item_code))
      .groupby("class_of")
      .rollup({
        data_type: () => "budget",
        fundedEnrollment: op.sum("amount"),
      });

    const fundedEnrollment =
      k12EnrollmentActuals.join_full(k12EnrollmentBudget);
    return fundedEnrollment;
  }

  filteredExpenditures(expendituresFilter: ExpendituresFilters) {
    let results = this.gf_expenditure_df;

    if (expendituresFilter.objectCodes !== undefined) {
      results = results
        .params(expendituresFilter)
        .filter((d, $) => d.includes([...$.objectCodes], d.object_code));
    }

    if (expendituresFilter.activityCodes !== undefined) {
      results = results
        .params(expendituresFilter)
        .filter((d, $) => d.includes([...$.activityCodes], d.activity_code));
    }

    if (expendituresFilter.programCodes !== undefined) {
      results = results
        .params(expendituresFilter)
        .filter((d, $) => d.includes([...$.programCodes], d.program_code));
    }

    if (expendituresFilter.schoolCodes !== undefined) {
      results = results
        .params(expendituresFilter)
        .filter((d, $) => d.includes([...$.schoolCodes], d.school_code));
    }

    if (expendituresFilter.ncesCodes !== undefined) {
      results = results
        .params(expendituresFilter)
        .filter((d, $) => d.includes([...$.ncesCodes], d.nces_code));
    }

    return results;
  }
}
