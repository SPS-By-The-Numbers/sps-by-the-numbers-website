import { BigQuery } from '@google-cloud/bigquery';
import { jsonOnRequest, makeResponseJson } from "./utils";
import * as Constants from 'config/constants';
import {
  EXPORT_FORMAT,
  EXPORT_COMPRESSION,
  makeCachePaths,
  prefixWithExport,
  cacheExists,
} from './cache';

const bigqueryClient = new BigQuery();

function getEnrollment(ccddd) {
  return `
  SELECT
    * EXCEPT (school_name),
    school_name school,

    -- Numeric grade_level_code so the dashboard can reuse the existing
    -- GradeLevelFilter. Keep in sync with utilities/domain/grade_levels.ts.
    CASE grade
      WHEN 'All Grades' THEN 99
      WHEN 'K' THEN 98
      WHEN 'PK' THEN 97
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      WHEN '4' THEN 4
      WHEN '5' THEN 5
      WHEN '6' THEN 6
      WHEN '7' THEN 7
      WHEN '8' THEN 8
      WHEN '9' THEN 9
      WHEN '10' THEN 10
      WHEN '11' THEN 11
      WHEN '12' THEN 12
    END AS grade_level_code
  FROM
    sps-btn-data.ospi.rc_enrollment
  WHERE ccddd=${ccddd}
  `;
}

function getSqss(ccddd) {
  return `
  SELECT
    *
  FROM
    sps-btn-data.ospi.rc_sqss
  WHERE ccddd=${ccddd}
  `;
}

function getAssessment(ccddd) {
  return `
  SELECT
    a.class_of,

    a.school_code,
    d_s.school,

    a.test_subject,

    a.test_administration,

    a.student_group,
    a.student_group_type,

    -- Keep in sync with utilities/domain/grade_levels.ts
    CASE a.grade_level
      WHEN 'All Grades' THEN 99
      WHEN 'KG' THEN 98
      WHEN '01' THEN 1
      WHEN '02' THEN 2
      WHEN '03' THEN 3
      WHEN '04' THEN 4
      WHEN '05' THEN 5
      WHEN '06' THEN 6
      WHEN '07' THEN 7
      WHEN '08' THEN 8
      WHEN '09' THEN 9
      WHEN '10' THEN 10
      WHEN '11' THEN 11
      WHEN '12' THEN 12
    END AS grade_level_code,

    SAFE_CAST(REGEXP_EXTRACT(a.pct_met_standard, r'^([0-9]+(?:\.[0-9]+)?)%$') AS FLOAT64) / 100 AS pct_met_standard_nodat,
    SAFE_CAST(REGEXP_EXTRACT(a.pct_met_standard, r'^[<>]?([0-9]+(?:\.[0-9]+)?)%$') AS FLOAT64) / 100 AS pct_met_standard_withdat
  FROM
    sps-btn-data.ospi.rc_assessment a
    JOIN sps-btn-data.safs_domains.d_school d_s ON (a.school_code = d_s.school_code AND a.ccddd = d_s.ccddd)
  WHERE a.ccddd=${ccddd}
  `;
}

function getFundedEnrollment(ccddd) {
  return `
  SELECT
    report_type,
    school_year,
    class_of,
    ccddd,
    enrollment_domain fundedEnrollment_domain,
    grade_category,
    amount,
  FROM
    sps-btn-data.safs_enrollment.enrollment
  WHERE ccddd=${ccddd}
  `;
}

function getDomain(domain) {
  console.error('boo: ' + domain);
  return `SELECT * FROM sps-btn-data.safs_domains.d_${domain}`;
}

function getExpenditures(ccddd) {
  return `
  SELECT
    data_type,
    school_year,
    class_of,
    program_code,
    program,
    activity_code,
    activity,
    object_code,
    object,
    nces_code,
    nces,
    school_code,
    school,
    sum(amount) amount
  FROM
    sps-btn-data.safs_f19x.general_fund_expenditures
  WHERE ccddd=${ccddd}
  GROUP BY
    data_type,
    school_year,
    class_of,
    program_code,
    program,
    activity_code,
    activity,
    object_code,
    object,
    nces_code,
    nces,
    school_code,
    school
  `;
}

function getRevenues(ccddd) {
  return `
  SELECT
    data_type,
    school_year,
    class_of,
    fund_code,
    fund,
    revenue_code,
    revenue,
    category_code,
    category,
    program_code,
    program,
    amount
  FROM
    sps-btn-data.safs_f19x.general_fund_revenues
  WHERE ccddd=${ccddd}
  `;
}

function getBudgetItems(ccddd) {
  return `
  SELECT
    school_year,
    class_of,
    fund_code,
    fund,
    item_code,
    item,
    amount
  FROM
    sps-btn-data.safs_f19x.budget_items
  WHERE ccddd=${ccddd}
  `;
}

function getActualsItems(ccddd) {
  return `
  SELECT
    school_year,
    class_of,
    fund_code,
    fund,
    item_code,
    item,
    general_ledger_code_list,
    amount
  FROM
    sps-btn-data.safs_f19x.actuals_items
  WHERE ccddd=${ccddd}
  `;
}

function getS275Summary(ccddd) {
  return `
  SELECT
    r.school_year,
    CAST(SPLIT(r.school_year, '-')[1] as int) class_of,
    a.school_code,
    d_s.school,
    a.program_code,
    d_p.program,
    a.activity_code,
    d_a.activity,
    a.duty_root_code,
    d_dr.duty_name duty_root,
    a.duty_suffix_code,
    d_ds.duty_contract_type duty_suffix,
    sum(COALESCE(a.fte_in_assignment, 0)) fte,
    sum(pa.assignment_salary) + sum(pa.c_est_other_salary) c_est_total_initial_salary,
    sum(pa.c_est_total_final_salary) c_est_total_final_salary,
  FROM
    sps-btn-data.safs_s275.assignment a
    JOIN sps-btn-data.safs_s275.report r ON (a.report_id = r.report_id)
    JOIN sps-btn-data.safs_s275.private_assignment pa ON (a.assignment_id = pa.assignment_id)
    JOIN sps-btn-data.safs_domains.d_school d_s ON (a.school_code = d_s.school_code)
    JOIN sps-btn-data.safs_domains.d_program d_p ON (a.program_code = d_p.program_code)
    JOIN sps-btn-data.safs_domains.d_activity d_a ON (a.activity_code = d_a.activity_code)
    JOIN sps-btn-data.safs_domains.d_duty_root d_dr ON (a.duty_root_code = d_dr.duty_root)
    JOIN sps-btn-data.safs_domains.d_duty_suffix d_ds ON (a.duty_suffix_code = d_ds.duty_suffix)
    WHERE
    r.report_type = 'final' AND
    r.ccddd = ${ccddd}
  GROUP BY
    school_year,
    class_of,
    school_code,
    school,
    program_code,
    program,
    activity_code,
    activity,
    duty_root_code,
    duty_root,
    duty_suffix_code,
    duty_suffix
  `;
}

// One row per employee per S-275 final report: their total_final_salary, their
// total FTE, and the duty root they are counted under. This is the per-person
// grain the Salaries dashboard draws -- getS275Summary() above answers "what
// does this duty cost in total", which cannot be un-summed back into people.
//
// Three things are easy to get wrong here, all of them multi-counting:
//   * total_final_salary lives on the *employee* (private_report_employee), not
//     the assignment. Joining it per assignment repeats one person's whole
//     salary once per assignment they hold.
//   * fte_in_assignment is the only additive FTE column. The certificated /
//     classified columns on assignment_fte are per-employee markers and
//     over-count by roughly 5x if summed.
//   * a person can hold assignments under several duty roots. They are counted
//     once, under the duty of their major assignment, matching how the printed
//     apportionment reports attribute staff.
// Verified against the SEA-critique extract: SPS 2024-25 comes back 7,156
// people / $684.0M, the same as tools/sea_chart_critique/staff_2425.csv.
function getS275Salaries(ccddd) {
  return `
  WITH per_duty AS (
    SELECT
      a.report_employee_id emp,
      a.duty_root_code dr,
      SUM(a.fte_in_assignment) fte,
      COUNTIF(a.is_major) nmaj,
      SUM(COALESCE(pa.assignment_salary, 0)) sal
    FROM
      sps-btn-data.safs_s275.assignment a
      JOIN sps-btn-data.safs_s275.report r ON (a.report_id = r.report_id)
      LEFT JOIN sps-btn-data.safs_s275.private_assignment pa
        ON (pa.assignment_id = a.assignment_id)
    WHERE
      r.report_type = 'final' AND
      r.ccddd = ${ccddd}
    GROUP BY emp, dr
  ),
  pick AS (
    SELECT emp, dr,
      ROW_NUMBER() OVER (
        PARTITION BY emp ORDER BY nmaj DESC, fte DESC, sal DESC, dr) rn
    FROM per_duty
  ),
  tot AS (
    SELECT emp, SUM(fte) fte FROM per_duty GROUP BY emp
  )
  SELECT
    r.school_year,
    CAST(SPLIT(r.school_year, '-')[1] as int) class_of,
    p.dr duty_root_code,
    d_dr.duty_name duty_root,
    pre.total_final_salary,
    t.fte
  FROM
    pick p
    JOIN tot t ON (t.emp = p.emp)
    JOIN sps-btn-data.safs_s275.report_employee re
      ON (re.report_employee_id = p.emp)
    JOIN sps-btn-data.safs_s275.report r ON (r.report_id = re.report_id)
    JOIN sps-btn-data.safs_s275.private_report_employee pre
      ON (pre.report_employee_id = p.emp)
    LEFT JOIN sps-btn-data.safs_domains.d_duty_root d_dr
      ON (d_dr.duty_root = p.dr)
  WHERE
    p.rn = 1 AND
    pre.total_final_salary IS NOT NULL
  `;
}

// Budgeted (F-195 salary exhibit) FTE. This is the district's BUDGET filing, so
// it has NO school breakdown -- FTE is only reported by program / activity /
// duty. We roll General Fund `detail` rows (the `activity_total` / `program_total`
// rows are redundant subtotals that would double-count) up to the same numeric
// (program_code, activity_code, duty_root_code) space the S-275 actuals use, so
// the staffing dashboard can overlay budget on actuals. The printed F-195
// duty_code is the 3-digit S-275 code; its 2-digit prefix is the duty ROOT
// (e.g. `310` -> 31 Elementary Homeroom Teacher). exhibit_kind (certificated /
// classified) is summed over -- the duty root already distinguishes staff type.
function getBudgetedFte(ccddd) {
  return `
  SELECT
    class_of,
    CAST(program_code AS INT64) program_code,
    CAST(activity_code AS INT64) activity_code,
    CAST(SUBSTR(duty_code, 1, 2) AS INT64) duty_root_code,
    SUM(fte) fte
  FROM
    sps-btn-data.ospi_fiscal.fiscal_f195_salary_exhibits
  WHERE
    ccddd = ${ccddd} AND
    fund = 'general' AND
    row_kind = 'detail'
  GROUP BY
    class_of,
    program_code,
    activity_code,
    duty_root_code
  `;
}

// Mid-year revised ("final") budget from the F-196 Budgetary Comparison
// Schedule -- the only source of post-revision budget numbers. The table has
// no program/activity/object codes (item_code is a label-derived slug), so
// only the summary and fund_balance roll-ups are useful to the dashboards.
// All funds ship so fund-level charts can be added without a redeploy.
// Note: total_revenues here EXCLUDES other financing sources; the SAFS
// general_fund_revenues rollup the site charts includes them, so clients
// must add total_other_financing_sources_uses for apples-to-apples revenue.
function getBudgetaryComparison(ccddd) {
  return `
  SELECT
    school_year,
    class_of,
    fund,
    section,
    item_code,
    value amount
  FROM
    sps-btn-data.ospi_fiscal.fiscal_f196_budgetary_comparison
  WHERE
    ccddd = ${ccddd} AND
    column_kind = 'final_budget' AND
    section IN ('summary', 'fund_balance')
  `;
}

function getQueryForDataset(ccddd, dataset) {
  if (ccddd === 'domain') {
    return getDomain(dataset);
  } else {
    if (dataset === 'enrollment') {
      return getEnrollment(ccddd);
    } else if (dataset === 'fundedEnrollment') {
      return getFundedEnrollment(ccddd);
    } else if (dataset === 'sqss') {
      return getSqss(ccddd);
    } else if (dataset === 'assessment') {
      return getAssessment(ccddd);
    } else if (dataset === 'gf_expenditures') {
      return getExpenditures(ccddd);
    } else if (dataset === 'gf_revenues') {
      return getRevenues(ccddd);
    } else if (dataset === 'budget_items') {
      return getBudgetItems(ccddd);
    } else if (dataset === 'actuals_items') {
      return getActualsItems(ccddd);
    } else if (dataset === 's275_summary') {
      return getS275Summary(ccddd);
    } else if (dataset === 's275_salaries') {
      return getS275Salaries(ccddd);
    } else if (dataset === 'budgeted_fte') {
      return getBudgetedFte(ccddd);
    } else if (dataset === 'budgetary_comparison') {
      return getBudgetaryComparison(ccddd);
    }
  }
  return null;
}

async function ensureDataset(ccddd, dataset) {
  const query = getQueryForDataset(ccddd, dataset);
  if (query === null) {
    return null;
  }

  const cachePaths = makeCachePaths(ccddd, dataset, query);

  if (! await cacheExists(cachePaths)) {
    console.info(`No cache found for ${dataset} in ${ccddd}. Doing SQL dump.`);
    const export_query = prefixWithExport(cachePaths.gsExportPath, query);

    const options = {
      query: export_query,
      location: Constants.GCP_REGION,
    };

    // Await the results.
    await bigqueryClient.query(options);
  }

  return cachePaths.publicUrl;
}

async function getDistrictData(req, res) {
  const ccddd = req.query.ccddd;
  if (!ccddd || ccddd.length < 4 || (ccddd.length > 5 && ccddd !== 'domain')) {
    return res.status(400).send(makeResponseJson(false, `Invalid ccddd: ${ccddd}`));
  }

  const dataset = req.query.dataset;

  const dataUrl = await ensureDataset(ccddd, dataset);
  if (dataUrl === null) {
    return res.status(400).send(
      makeResponseJson(false,
                       `Invalid Dataset (${dataset}) or cccddd (${ccddd})`));
  }
  return res.status(200).send(makeResponseJson(true, "ok", {dataUrl, format: EXPORT_FORMAT, compression: EXPORT_COMPRESSION}));
}

export const finance = jsonOnRequest(
  {cors: true, region: [Constants.GCP_REGION]},
  async (req, res) => {
    if (req.method === "GET") {
      return await getDistrictData(req, res);
    }

    return res.status(405).send(makeResponseJson(false, "Method Not Allowed"));
  }
);
