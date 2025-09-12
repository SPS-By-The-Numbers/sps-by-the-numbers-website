import { fetchEndpoint } from 'utilities/client/endpoint';
import * as aq from 'arquero';
import { op } from 'arquero';
import type { ColumnTable } from 'arquero';

export type FilterSelection = {
  selectedObjectCodes: Array<number>,
  selectedActivityCodes: Array<number>,
  selectedProgramCodes: Array<number>,
};

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

function financeGroupSumAmount(new_col_name, df, col_to_sum) {
  return df
      .groupby(['data_type', 'class_of'])
      .rollup({[new_col_name]: op.sum(col_to_sum)});
}

export async function fetchDatasetStream(ccddd : string, dataset : string) {
  const datasetResponse = await fetchEndpoint('finance', 'GET', {ccddd, dataset});
  if (!datasetResponse.ok) {
    console.error(datasetResponse);
    throw "Unable to read data";
  }

  const csvResponse = await fetch(datasetResponse.data.dataUrl);
  if (csvResponse === null || csvResponse.status !== 200 || csvResponse.body === null) {
    console.error('fetch failed: ', csvResponse);
    throw 'fetch failed';
  }

  return csvResponse.body.pipeThrough(new DecompressionStream('gzip'));
}

export async function fetchDataset(ccddd, dataset) {
  const byteStream = await fetchDatasetStream(ccddd, dataset);
  return aq.fromCSVStream(byteStream.pipeThrough(new TextDecoderStream()));
}

function minMaxClassOf(df) {
  return df.select('class_of').rollup({min: op.min('class_of'), max: op.max('class_of')});
}

// Fetches the dataset for one district.
//
export default class DistrictData {
  private enrollment_df : ColumnTable;
  private gf_expenditure_df : ColumnTable;
  private gf_revenue_df : ColumnTable;
  private budget_items_df : ColumnTable;
  private actuals_items_df : ColumnTable;
  private s275_summary_df : ColumnTable;
  private all_class_ofs_df : ColumnTable;

  constructor(enrollment_df, gf_expenditure_df, gf_revenue_df,
              budget_items_df, actuals_items_df, s275_summary_df) {
    this.enrollment_df = enrollment_df;
    this.gf_expenditure_df = gf_expenditure_df;
    this.gf_revenue_df = gf_revenue_df;
    this.budget_items_df = budget_items_df;
    this.actuals_items_df = actuals_items_df;
    this.s275_summary_df = s275_summary_df;

    const minMaxDf = minMaxClassOf(this.enrollment_df)
        .concat(minMaxClassOf(this.gf_expenditure_df))
        .concat(minMaxClassOf(this.gf_revenue_df))
        .rollup({min: op.min('min'), max: op.max('max')});

    const minYear = minMaxDf.get('min', 0);
    const maxYear = minMaxDf.get('max', 0);

    const all_class_ofs = new Array<number>();
    for (let year = minYear; year <= maxYear; year++) {
      all_class_ofs.push(year);
    }

    this.all_class_ofs_df = aq.table({'class_of': all_class_ofs});
  }

  static async loadFromGcs(ccddd) {
    const [enrollment_df, gf_expenditure_df, gf_revenue_df,
           budget_items_df, actuals_items_df, s275_summary_df] = await Promise.all(
      [
        fetchDataset(ccddd, "enrollment"),
        fetchDataset(ccddd, "gf_expenditures"),
        fetchDataset(ccddd, "gf_revenues"),
        fetchDataset(ccddd, "budget_items"),
        fetchDataset(ccddd, "actuals_items"),
        fetchDataset(ccddd, "s275_summary"),
      ]
    );
    return new DistrictData(enrollment_df, gf_expenditure_df, gf_revenue_df,
                           budget_items_df, actuals_items_df, s275_summary_df);
  }

  toplevel_metrics() {
    const merged_df = this.cashflow()
      .join_full(this.enrollment())
      .join_full(this.staffing())
      .join_full(this.balances());
    return merged_df;
  }

  staffing() {
    const staffFteActuals = this.s275_summary_df
      .groupby(['class_of'])
      .rollup({'amount_staff_fte_actuals': op.sum('fte_in_assignment')});

    // 317 is certificated FTE counts
    // 318 is classified FTE counts.
    const staffFteBudget = this.budget_items_df.filter(
      d => op.includes(['317', '318'], d.item_code))
      .groupby('class_of')
      .rollup({'amount_staff_fte_budget': op.sum('amount')});

    const teachingFteActuals = this.s275_summary_df
        .filter(aq.escape(d => op.includes(TEACHING_CODES, d.activity_code)))
        .groupby('class_of')
        .rollup({amount_teaching_fte_actuals: op.sum('fte_in_assignment')});

    const studentSupportFte = this.s275_summary_df
        .filter(aq.escape(d => op.includes(STUDENT_SUPPORT_CODES, d.activity_code)))
        .groupby('class_of')
        .rollup({amount_student_support_fte_actuals: op.sum('fte_in_assignment')});

    const buildingSupportFte = this.s275_summary_df
        .filter(aq.escape(d => op.includes(BUILDING_SUPPORT, d.activity_code)))
        .groupby('class_of')
        .rollup({amount_building_support_fte_actuals: op.sum('fte_in_assignment')});

    const otherFte = this.s275_summary_df
        .filter(aq.escape(d => !op.includes([
            ...TEACHING_CODES,
            ...STUDENT_SUPPORT_CODES,
            ...BUILDING_SUPPORT],
            d.activity_code)))
        .groupby('class_of')
        .rollup({amount_other_fte_actuals: op.sum('fte_in_assignment')});

    return staffFteActuals
        .join_full(staffFteBudget)
        .join_full(teachingFteActuals)
        .join_full(studentSupportFte)
        .join_full(buildingSupportFte)
        .join_full(otherFte);
  }

  balances() {
    const beginningBalanceBudget = this.budget_items_df.filter(
      aq.escape(d => d.item_code === '275' && d.fund_code === 1))
      .groupby('class_of')
      .rollup(
        {'beginning_balance_budget': op.sum('amount')});

    const endingBalanceBudget = this.budget_items_df.filter(
      aq.escape(d => d.item_code === '439' && d.fund_code === 1))
      .groupby('class_of')
      .rollup(
        {'ending_balance_budget': op.sum('amount')});

    const beginningBalanceActuals = this.actuals_items_df.filter(
      aq.escape(d => d.item_code === '275' && d.fund_code === 1))
      .groupby('class_of')
      .rollup(
        {'beginning_balance_actuals': op.sum('amount')});

    const endingBalanceActuals = this.actuals_items_df.filter(
      aq.escape(d => d.item_code === '439' && d.fund_code === 1))
      .groupby('class_of')
      .rollup(
        {'ending_balance_actuals': op.sum('amount')});

    return beginningBalanceBudget
        .join_full(beginningBalanceActuals)
        .join_full(endingBalanceBudget)
        .join_full(endingBalanceActuals);
  }

  cashflow() {
    const expenditures_df = financeGroupSumAmount("expenditures", this.gf_expenditure_df, "amount");
    const revenues_df = financeGroupSumAmount("revenues", this.gf_revenue_df, "amount");

    // Put expenses + revenues onto one sheet preserving incomplete years
    // and calculate cashflow.
    const merged_df = expenditures_df.join_full(revenues_df)
      .derive({cashflow: d => d.revenues - d.expenditures});

    // Pivot out the data_type so the index is just class_of.
    return merged_df.groupby('class_of').pivot('data_type', ['cashflow', 'revenues', 'expenditures'])
    .join_full(this.all_class_ofs_df);
  }

  enrollment() {
    const k12EnrollmentActuals =
      this.enrollment_df.filter(
        d => op.includes(['K-12 FTE', 'K-12 FTE - Includes ALE'], d.enrollment_domain)
    )
    .groupby('class_of')
    .rollup({'enrollment_actuals': op.sum('amount')});

    // K-12 FTE from the p223 confusingly is NOT the
    // "Total K-12 FTE Enrollment Counts" (item code 314) in the F195.
    //
    // Item 314 in F195 includes also the Running Start and Drop Out Reengagement.
    //
    // The equivalent number from the F195 is actually the sum of these two item codes
    //  327 - Subtotal K-12
    //  148 - ALE Enrollment
    const k12EnrollmentBudget = this.budget_items_df.filter(
        d => op.includes(['327', '148'], d.item_code)
    )
    .groupby('class_of')
    .rollup({'enrollment_budget': op.sum('amount')});

    return k12EnrollmentActuals
      .join_full(k12EnrollmentBudget)
      .join_full(this.all_class_ofs_df);
  }

  expenditures() {
    return this.gf_expenditure_df;
  }

  filteredExpenditures(filterSelection: FilterSelection) {
    return this.gf_expenditure_df
      .params(filterSelection)
      .filter((d, $) =>
              d.includes($.selectedObjectCodes, d.object_code) &&
              d.includes($.selectedActivityCodes, d.activity_code) &&
              d.includes($.selectedProgramCodes, d.program_code));
  }
};
