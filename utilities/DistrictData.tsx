import { op } from "arquero";
import * as aq from "arquero";

import {
  loadDatasets,
  registerNormalizer,
} from "utilities/client/DistrictDatasets";

import type {
  DatasetBundle,
  DatasetName,
} from "utilities/client/DistrictDatasets";
import ALL_ASSESSMENT_TYPES from "utilities/domain/assessment_types";
import ALL_ENROLLMENT_STUDENT_GROUPS from "utilities/domain/enrollment_student_groups";
import ALL_GRADE_LEVELS from "utilities/domain/grade_levels";
import ALL_STUDENT_GROUPS from "utilities/domain/student_groups";
import ALL_TEST_SUBJECTS from "utilities/domain/test_subjects";
import {
  EMPLOYMENT_CLASS_LABEL,
  employmentClassCodeForDutyRoot,
  employmentClassForDutyRoot,
  staffCategoryCodeForDutyRoot,
  staffCategoryLabelForDutyRoot,
} from "utilities/domain/duty_roots";

import type { ColumnTable } from "arquero";

function codesToStrings<T>(
  domain: Array<T>,
  codeKey: string,
  valueKey: string,
  codes: Set<number>,
): Set<string> {
  const result = new Set<string>();
  for (const entry of domain) {
    if (codes.has(entry[codeKey])) {
      result.add(entry[valueKey]);
    }
  }
  return result;
}

// Combining activities that have been split over the years so they can
// be compared with history.
export const SYNTH_ACT_CODE_TEACHING = 9990;
export const SYNTH_ACT_TEACHING = "Teaching (27) / Professional Learning (34)";
export const SYNTH_ACT_CODE_PRINCIPAL_OFFICE = 9991;
export const SYNTH_ACT_PRINCPAL_OFFICE =
  "Principal's Office (23) / Principal (84)";

export type AFilters = {
  activityCodes: Set<number>;
};

export type PFilters = {
  programCodes: Set<number>;
};

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

export type EmploymentClassFilters = {
  employmentClassCodes: Set<number>;
};

export type RevenueCategoryFilters = {
  revenueCategoryCodes: Set<number>;
};

export type RevenueAccountFilters = {
  revenueCodes: Set<number>;
};

export type DemographicFilters = {
  activityCodes: Set<number>;
};

type ExpendituresFilters = Partial<PAOFilters & NcesFilters & SchoolFilters>;
type RevenuesFilters = Partial<
  RevenueCategoryFilters & RevenueAccountFilters & PFilters
>;
type StaffingFilters = Partial<
  PAFilters & DutyRootFilters & EmploymentClassFilters & SchoolFilters
>;
type EnrollmentFilters = Partial<
  DemographicFilters & SchoolFilters & GradeLevelFilters & StudentGroupFilters
>;
export type GradeLevelFilters = {
  gradeLevelCodes: Set<number>;
};

export type TestAdministrationFilters = {
  testAdministrationCodes: Set<number>;
};

export type StudentGroupFilters = {
  studentGroupCodes: Set<number>;
};

export type TestSubjectFilters = {
  testSubjectCodes: Set<number>;
};

type AssessmentFilters = Partial<
  SchoolFilters &
    GradeLevelFilters &
    TestAdministrationFilters &
    StudentGroupFilters &
    TestSubjectFilters
>;

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
      fte: (d) => op.sum(d.fte),
      activity_code: (_, $) => $.synth_activity_code,
      activity: (_, $) => $.synth_activity,
    });

  const others = df
    .params({ codes })
    .filter((d, $) => !op.includes($.codes, d.activity_code));

  const result = others.union(summed);
  return result;
}

// Same activity-combining as the S-275 combiner, but for the budgeted-FTE
// (F-195) frame, whose only measure is `fte` (no salary columns). Keeping the
// synthetic activity codes aligned with S-275 lets the Staffing dashboard's
// Activity facet line budget up with actuals.
function combineActivitiesBudgetedFte(df, codes, synth_activity_code) {
  const nonActivityColumns = df.columnNames(
    (c) => !["activity_code", "fte"].includes(c),
  );

  const summed = df
    .params({ codes, synth_activity_code })
    .filter((d, $) => op.includes($.codes, d.activity_code))
    .groupby(...nonActivityColumns)
    .rollup({
      fte: (d) => op.sum(d.fte),
      activity_code: (_, $) => $.synth_activity_code,
    });

  const others = df
    .params({ codes })
    .filter((d, $) => !op.includes($.codes, d.activity_code));

  return others.union(summed);
}

// Stamp a frame that has a `duty_root_code` column with the two OSPI-derived
// staffing dimensions: `employment_class[_code]` (2-way, the filter) and
// `staff_category[_code]` (6-way, the facet). See utilities/domain/duty_roots.
function deriveStaffClassColumns(df) {
  return df.derive({
    employment_class_code: aq.escape((d) =>
      employmentClassCodeForDutyRoot(d.duty_root_code),
    ),
    employment_class: aq.escape(
      (d) =>
        EMPLOYMENT_CLASS_LABEL[employmentClassForDutyRoot(d.duty_root_code)],
    ),
    staff_category_code: aq.escape((d) =>
      staffCategoryCodeForDutyRoot(d.duty_root_code),
    ),
    staff_category: aq.escape((d) =>
      staffCategoryLabelForDutyRoot(d.duty_root_code),
    ),
  });
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
// Per-dataset normalization, registered with the dataset cache so it runs once
// per district-dataset rather than once per DistrictData. Synthetic activity
// codes collapse categories that OSPI split over the years; the staff-class
// columns are derived from the duty root so both the S-275 actuals and the
// F-195 budget can be filtered and faceted the same way.
registerNormalizer("gf_expenditures", (df) =>
  combineCommonActivities(df, combineActivitiesF19x),
);
registerNormalizer("s275_summary", (df) =>
  deriveStaffClassColumns(combineCommonActivities(df, combineActivitiesS275)),
);
registerNormalizer("budgeted_fte", (df) =>
  deriveStaffClassColumns(
    combineCommonActivities(df, combineActivitiesBudgetedFte),
  ),
);

export default class DistrictData {
  private bundle: DatasetBundle;
  private all_class_ofs_cache: ColumnTable | null = null;

  constructor(bundle: DatasetBundle) {
    this.bundle = bundle;
  }

  // A dashboard reaching for a dataset it did not declare is a bug in its
  // declaration, and the failure has to be loud: falling back to an empty
  // frame would draw a plausible-looking chart with nothing in it, which is
  // far harder to notice than a crash.
  private require(name: DatasetName): ColumnTable {
    const df = this.bundle[name];
    if (!df) {
      throw new Error(
        `DistrictData needs the "${name}" dataset, which this dashboard did ` +
          `not declare. Add it to the dashboard's datasets list (or to the ` +
          `DATASETS constant of the helper that reads it).`,
      );
    }
    return df;
  }

  // Getters rather than fields so every method below reads unchanged while
  // the underlying frames stay lazily required.
  private get enrollment_df() {
    return this.require("enrollment");
  }
  private get fundedEnrollment_df() {
    return this.require("fundedEnrollment");
  }
  private get assessment_df() {
    return this.require("assessment");
  }
  private get gf_expenditure_df() {
    return this.require("gf_expenditures");
  }
  private get gf_revenue_df() {
    return this.require("gf_revenues");
  }
  private get budget_items_df() {
    return this.require("budget_items");
  }
  private get actuals_items_df() {
    return this.require("actuals_items");
  }
  private get s275_summary_df() {
    return this.require("s275_summary");
  }
  private get budgeted_fte_df() {
    return this.require("budgeted_fte");
  }
  private get budgetary_comparison_df() {
    return this.require("budgetary_comparison");
  }

  private get all_class_ofs_df(): ColumnTable {
    // Computed on demand: it spans three datasets, so eagerly deriving it
    // would drag them into every dashboard whether or not it asks for a year
    // list. Cached because callers hit it per render.
    if (this.all_class_ofs_cache) return this.all_class_ofs_cache;

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

    this.all_class_ofs_cache = aq.table({ class_of: all_class_ofs });
    return this.all_class_ofs_cache;
  }

  static async loadFromGcs(ccddd: number, datasets: readonly DatasetName[]) {
    return new DistrictData(await loadDatasets(ccddd, datasets));
  }

  /**
   * Whether every named dataset is present in this instance.
   *
   * The provider rebuilds DistrictData as dashboards ask for wider dataset
   * sets, so a district being "loaded" is not the same as being loaded with
   * what the current dashboard needs -- switching from a narrower tab would
   * otherwise render against a bundle missing a frame.
   */
  hasAll(names: readonly DatasetName[]): boolean {
    return names.every((n) => this.bundle[n] !== undefined);
  }

  // Direct accessors
  fundedEnrollment() {
    return this.fundedEnrollment_df;
  }

  // Per-school total enrollment for a class_of, as school_code -> headcount,
  // read from OSPI rc_enrollment's "All Grades" (grade_level_code 99),
  // all_students row. Empty when the year isn't covered -- rc_enrollment does
  // not reach as far back as the expenditure history -- which lets callers fall
  // back (see the Expenditure Flow school-size coloring).
  schoolEnrollmentTotals(classOf: number): Map<number, number> {
    const rows = this.enrollment_df
      .params({ classOf })
      .filter((d, $) => d.class_of === $.classOf && d.grade_level_code === 99)
      .groupby("school_code")
      .rollup({ enrollment: op.sum("all_students") })
      .objects() as Array<{ school_code: number; enrollment: number }>;
    const out = new Map<number, number>();
    for (const r of rows) {
      if (r.enrollment > 0) {
        out.set(r.school_code, r.enrollment);
      }
    }
    return out;
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

  // The DISTINCT fiscal years that actually have General Fund expenditure data,
  // as opposed to `all_class_ofs()` which fills every year in the min..max span
  // (including gaps with no data). Used by the Expenditure Flow view's year
  // picker so it only offers years that can render a flow.
  expenditureClassOfs() {
    return this.gf_expenditure_df.select("class_of").dedupe();
  }

  // Summary accessors
  staffingSummary() {
    const staffFteActuals = this.s275_summary_df.groupby(["class_of"]).rollup({
      data_type: () => "actuals",
      staffFte: op.sum("fte"),
    });

    // 317 is certificated FTE counts
    // 318 is classified FTE counts.
    const staffFteBudget = this.budget_items_df
      .filter((d) => op.includes(["317", "318"], d.item_code))
      .groupby("class_of")
      .rollup({ data_type: () => "budget", staffFte: op.sum("amount") });

    // Actuals (S-275) and budget (F-195) FTE for each activity-based breakout.
    // Both frames carry activity_code combined to the same synthetic 9990/9991
    // codes, so the groupings line up. F-195 has no school breakdown, which is
    // fine: Vitals is district-level. Each breakout unions its actuals and budget
    // rows (they never collide -- data_type always differs) so the Vitals FTE
    // breakout charts render a Budget series next to Actuals.
    const OTHER_FTE_CODES = [
      ...TEACHING_CODES,
      ...STUDENT_SUPPORT_CODES,
      ...BUILDING_SUPPORT,
    ];
    const breakoutFte = (
      column: string,
      predicate: (activityCode: number) => boolean,
    ) => {
      const actuals = this.s275_summary_df
        .filter(aq.escape((d) => predicate(d.activity_code)))
        .groupby("class_of")
        .rollup({ data_type: () => "actuals", [column]: op.sum("fte") });
      const budget = this.budgeted_fte_df
        .filter(aq.escape((d) => predicate(d.activity_code)))
        .groupby("class_of")
        .rollup({ data_type: () => "budget", [column]: op.sum("fte") });
      return actuals.join_full(budget);
    };

    const teachingFte = breakoutFte("teachingFte", (c) =>
      op.includes(TEACHING_CODES, c),
    );
    const studentSupportFte = breakoutFte("studentSupportFte", (c) =>
      op.includes(STUDENT_SUPPORT_CODES, c),
    );
    const buildingSupportFte = breakoutFte("buildingSupportFte", (c) =>
      op.includes(BUILDING_SUPPORT, c),
    );
    const otherFte = breakoutFte(
      "otherFte",
      (c) => !op.includes(OTHER_FTE_CODES, c),
    );

    return staffFteActuals
      .join_full(staffFteBudget)
      .join_full(teachingFte)
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

  filteredS275Summary(staffingFilter: StaffingFilters) {
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

    if (staffingFilter.employmentClassCodes !== undefined) {
      results = results
        .params(staffingFilter)
        .filter((d, $) =>
          d.includes([...$.employmentClassCodes], d.employment_class_code),
        );
    }

    return results;
  }

  budgetedFte() {
    return this.budgeted_fte_df;
  }

  // Budgeted (F-195) FTE filtered by the dimensions the budget actually carries:
  // program, activity, duty root, and employment class (all derivable from the
  // F-195 rows). Only SCHOOL is intentionally NOT applied -- the budget has no
  // school breakdown, so the Staffing dashboard shows the budget overlay only
  // when all schools are selected (see the eligibility check there) and
  // otherwise surfaces a banner.
  filteredBudgetedFte(staffingFilter: StaffingFilters) {
    let results = this.budgeted_fte_df;

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

    if (staffingFilter.dutyRootCodes !== undefined) {
      results = results
        .params(staffingFilter)
        .filter((d, $) => d.includes([...$.dutyRootCodes], d.duty_root_code));
    }

    if (staffingFilter.employmentClassCodes !== undefined) {
      results = results
        .params(staffingFilter)
        .filter((d, $) =>
          d.includes([...$.employmentClassCodes], d.employment_class_code),
        );
    }

    return results;
  }

  budgetaryComparison() {
    return this.budgetary_comparison_df;
  }

  // General-fund revised (F-196 "final") budget summary, one wide row per
  // class_of with the summary/fund_balance item_codes as columns
  // (total_revenues, total_expenditures, total_other_financing_sources_uses,
  // beginning_total_fund_balance, ending_total_fund_balance, ...). Empty
  // frame when the dataset isn't available.
  private revisedGfSummary() {
    if (this.budgetary_comparison_df.numRows() === 0) {
      return this.budgetary_comparison_df;
    }
    let wide = this.budgetary_comparison_df
      .filter((d) => d.fund === "general")
      .groupby("class_of")
      .pivot("item_code", { amount: op.sum("amount") });
    // A district can lack some line items (e.g. no other financing
    // sources). Backfill the columns downstream derives read so they
    // compile against a consistent shape.
    for (const col of [
      "total_revenues",
      "total_expenditures",
      "total_other_financing_sources_uses",
      "beginning_total_fund_balance",
      "ending_total_fund_balance",
    ]) {
      if (!wide.column(col)) {
        wide = wide.derive({ [col]: () => null });
      }
    }
    return wide;
  }

  // General-fund revised budget totals per class_of: {class_of, revenues,
  // expenditures}, with other financing sources folded into revenues to
  // match the SAFS general_fund_revenues rollup (the identity holds to the
  // cent). Empty frame when the dataset isn't available.
  revisedGfTotals() {
    const wide = this.revisedGfSummary();
    if (wide.numRows() === 0) {
      return aq.table({ class_of: [], revenues: [], expenditures: [] });
    }
    return wide
      .filter((d) => d.total_revenues != null && d.total_expenditures != null)
      .derive({
        revenues: (d) =>
          d.total_revenues + (d.total_other_financing_sources_uses || 0),
        expenditures: (d) => d.total_expenditures,
      })
      .select("class_of", "revenues", "expenditures");
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

    const result = beginningBalance.join_full(endingBalance);

    // Overlay the mid-year revised (F-196 final) budget as a third
    // data_type.
    const revised_wide = this.revisedGfSummary();
    if (revised_wide.numRows() === 0) {
      return result;
    }
    // Require both items so a one-sided null can't normalize into a
    // misleading zero-height bar (null / norm === 0 in JS).
    const revisedBalances = revised_wide
      .filter(
        (d) =>
          d.beginning_total_fund_balance != null &&
          d.ending_total_fund_balance != null,
      )
      .derive({
        data_type: () => "revised",
        beginningBalance: (d) => d.beginning_total_fund_balance,
        endingBalance: (d) => d.ending_total_fund_balance,
      })
      .select("class_of", "data_type", "beginningBalance", "endingBalance");
    return result.concat(revisedBalances);
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

    // Overlay the mid-year revised (F-196 final) budget as a third
    // data_type.
    const revised_totals = this.revisedGfTotals();
    if (revised_totals.numRows() === 0) {
      return merged_df;
    }
    const revised_df = revised_totals
      .derive({
        data_type: () => "revised",
        cashflow: (d) => d.revenues - d.expenditures,
      })
      .select("data_type", "class_of", "expenditures", "revenues", "cashflow");
    return merged_df.concat(revised_df);
  }

  filteredAssessment(filter: AssessmentFilters) {
    let results = this.assessment_df;

    if (filter.schoolCodes !== undefined) {
      results = results
        .params(filter)
        .filter((d, $) => d.includes([...$.schoolCodes], d.school_code));
    }

    if (filter.gradeLevelCodes !== undefined) {
      results = results
        .params({ gradeLevelCodes: [...filter.gradeLevelCodes] })
        .filter((d, $) => d.includes($.gradeLevelCodes, d.grade_level_code));
    }

    if (filter.testAdministrationCodes !== undefined) {
      const testAdministrations = codesToStrings(
        ALL_ASSESSMENT_TYPES,
        "test_administration_code",
        "test_administration",
        filter.testAdministrationCodes,
      );
      results = results
        .params({ testAdministrations: [...testAdministrations] })
        .filter((d, $) =>
          d.includes($.testAdministrations, d.test_administration),
        );
    }

    if (filter.studentGroupCodes !== undefined) {
      const studentGroups = codesToStrings(
        ALL_STUDENT_GROUPS,
        "student_group_code",
        "student_group",
        filter.studentGroupCodes,
      );
      results = results
        .params({ studentGroups: [...studentGroups] })
        .filter((d, $) => d.includes($.studentGroups, d.student_group));
    }

    if (filter.testSubjectCodes !== undefined) {
      const testSubjects = codesToStrings(
        ALL_TEST_SUBJECTS,
        "test_subject_code",
        "test_subject",
        filter.testSubjectCodes,
      );
      results = results
        .params({ testSubjects: [...testSubjects] })
        .filter((d, $) => d.includes($.testSubjects, d.test_subject));
    }

    // Join with domain tables to add display names and code columns for series identification.
    const gradeLevelDomain = aq.table({
      grade_level_code: ALL_GRADE_LEVELS.map((g) => g.grade_level_code),
      grade_level: ALL_GRADE_LEVELS.map((g) => g.grade_level),
    });
    const testSubjectDomain = aq.table({
      test_subject: ALL_TEST_SUBJECTS.map((t) => t.test_subject),
      test_subject_code: ALL_TEST_SUBJECTS.map((t) => t.test_subject_code),
    });
    const assessmentTypeDomain = aq.table({
      test_administration: ALL_ASSESSMENT_TYPES.map(
        (t) => t.test_administration,
      ),
      test_administration_code: ALL_ASSESSMENT_TYPES.map(
        (t) => t.test_administration_code,
      ),
    });
    const studentGroupDomain = aq.table({
      student_group: ALL_STUDENT_GROUPS.map((g) => g.student_group),
      student_group_code: ALL_STUDENT_GROUPS.map((g) => g.student_group_code),
    });

    return results
      .derive({
        data_type: (d) => "actuals",
      })
      .join_left(gradeLevelDomain, "grade_level_code")
      .join_left(testSubjectDomain, "test_subject")
      .join_left(assessmentTypeDomain, "test_administration")
      .join_left(studentGroupDomain, "student_group");
  }

  filteredEnrollment(filter: EnrollmentFilters) {
    let results = this.enrollment_df;

    if (filter.schoolCodes !== undefined) {
      results = results
        .params(filter)
        .filter((d, $) => d.includes([...$.schoolCodes], d.school_code));
    }

    if (filter.gradeLevelCodes !== undefined) {
      results = results
        .params({ gradeLevelCodes: [...filter.gradeLevelCodes] })
        .filter((d, $) => d.includes($.gradeLevelCodes, d.grade_level_code));
    }

    // rc_enrollment is wide (one column per student-group attribute), but
    // the dashboard wants a long-format frame keyed by student_group_code
    // so the existing facet/breakdown machinery can treat student group
    // as just another dimension. Fold the relevant columns down into
    // (student_group_column, amount) rows, then attach the human-readable
    // student_group label and the numeric student_group_code.
    const groupColumns = ALL_ENROLLMENT_STUDENT_GROUPS.map((g) => g.column);
    results = results.fold(groupColumns, {
      as: ["student_group_column", "amount"],
    });
    const groupDomain = aq.table({
      student_group_column: ALL_ENROLLMENT_STUDENT_GROUPS.map((g) => g.column),
      student_group_code: ALL_ENROLLMENT_STUDENT_GROUPS.map(
        (g) => g.student_group_code,
      ),
      student_group: ALL_ENROLLMENT_STUDENT_GROUPS.map((g) => g.student_group),
      student_group_type: ALL_ENROLLMENT_STUDENT_GROUPS.map(
        (g) => g.student_group_type,
      ),
    });
    results = results.join_left(groupDomain, "student_group_column");

    if (filter.studentGroupCodes !== undefined) {
      results = results
        .params({ studentGroupCodes: [...filter.studentGroupCodes] })
        .filter((d, $) =>
          d.includes($.studentGroupCodes, d.student_group_code),
        );
    }

    // Provide a grade_level string alongside the existing grade column so
    // the dashboard can facet by grade_level the same way the assessment
    // dashboard does (extractFacetsSortedByLatestAmount groups on
    // (facetColumn, facetCodeColumn) = ("grade_level", "grade_level_code")).
    // Also derive grade_cohort / grade_cohort_code so the dashboard can
    // facet by the standard grade-cohort buckets (PreK, K-2, 3-5, 6-8,
    // 9-12). Cohort codes are >= 9000 so makeFacetCodeText suppresses
    // them in chart titles.
    return results.derive({
      grade_level: (d) => d.grade,
      grade_cohort: (d) =>
        d.grade_level_code === 97
          ? "PreK"
          : d.grade_level_code === 98 ||
              d.grade_level_code === 1 ||
              d.grade_level_code === 2
            ? "K-2"
            : d.grade_level_code === 3 ||
                d.grade_level_code === 4 ||
                d.grade_level_code === 5
              ? "3-5"
              : d.grade_level_code === 6 ||
                  d.grade_level_code === 7 ||
                  d.grade_level_code === 8
                ? "6-8"
                : d.grade_level_code === 9 ||
                    d.grade_level_code === 10 ||
                    d.grade_level_code === 11 ||
                    d.grade_level_code === 12
                  ? "9-12"
                  : "Other",
      grade_cohort_code: (d) =>
        d.grade_level_code === 97
          ? 9001
          : d.grade_level_code === 98 ||
              d.grade_level_code === 1 ||
              d.grade_level_code === 2
            ? 9002
            : d.grade_level_code === 3 ||
                d.grade_level_code === 4 ||
                d.grade_level_code === 5
              ? 9003
              : d.grade_level_code === 6 ||
                  d.grade_level_code === 7 ||
                  d.grade_level_code === 8
                ? 9004
                : d.grade_level_code === 9 ||
                    d.grade_level_code === 10 ||
                    d.grade_level_code === 11 ||
                    d.grade_level_code === 12
                  ? 9005
                  : 9999,
      // Projected high-school diploma year. Grade 12 students
      // graduate in class_of itself; each grade below adds another
      // year (Grade 11 → +1, …, Grade 1 → +11, K → +12, PK → +13).
      // The "All Grades" rollup row gets null since it isn't a
      // single grade level.
      diploma_year: (d) =>
        d.grade_level_code === 99
          ? null
          : d.grade_level_code === 98
            ? d.class_of + 12
            : d.grade_level_code === 97
              ? d.class_of + 13
              : d.class_of + (12 - d.grade_level_code),
      diploma_year_code: (d) =>
        d.grade_level_code === 99
          ? null
          : d.grade_level_code === 98
            ? d.class_of + 12
            : d.grade_level_code === 97
              ? d.class_of + 13
              : d.class_of + (12 - d.grade_level_code),
      years_to_diploma: (d) =>
        d.grade_level_code === 99
          ? null
          : d.grade_level_code === 98
            ? 12
            : d.grade_level_code === 97
              ? 13
              : 12 - d.grade_level_code,
    });
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

  filteredRevenues(revenuesFilter: RevenuesFilters) {
    let results = this.gf_revenue_df;

    if (revenuesFilter.revenueCategoryCodes !== undefined) {
      results = results
        .params(revenuesFilter)
        .filter((d, $) =>
          d.includes([...$.revenueCategoryCodes], d.category_code),
        );
    }

    if (revenuesFilter.revenueCodes !== undefined) {
      results = results
        .params(revenuesFilter)
        .filter((d, $) => d.includes([...$.revenueCodes], d.revenue_code));
    }

    if (revenuesFilter.programCodes !== undefined) {
      results = results
        .params(revenuesFilter)
        .filter((d, $) => d.includes([...$.programCodes], d.program_code));
    }

    return results;
  }
}
