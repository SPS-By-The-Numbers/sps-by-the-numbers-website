import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import { jsonOnRequest, makeResponseJson } from "./utils";
import * as Constants from 'config/constants';
import crypto from 'node:crypto';

const CACHE_BUCKET = "sps-by-the-numbers-public";

const EXPORT_FORMAT = 'AVRO';
const EXPORT_COMPRESSION = 'DEFLATE';
const EXPORT_FORMAT_EXTENSION = 'avro';
const EXPORT_EXTRA_OPTIONS = ',use_avro_logical_types=True';

const bigqueryClient = new BigQuery();
const storageClient = new Storage();

// Change this to force cache invalidaiton of results for queries.
const CACHE_BREAK_SALT = '2026-05-01';

function sha256(str) {
  return crypto.createHash('sha256').update(str + CACHE_BREAK_SALT).digest('hex');
}

function makeCachePaths(ccddd, dataset, query) {
  const hash = sha256(query);

  const bucket = CACHE_BUCKET;
  const relativePathRoot = `cache/scratch/${ccddd}/${dataset}/${hash.substr(0, 8)}_`;
  const gsUrlRoot = `gs://${bucket}`;
  const exportWildcardPath = `${relativePathRoot}_*.${EXPORT_FORMAT_EXTENSION}`;
  const publicUrlRoot = `https://storage.googleapis.com/${bucket}`;

  // Assume there is only 1 file output from the dump.
  const cacheFilePath = `${relativePathRoot}_000000000000.${EXPORT_FORMAT_EXTENSION}`;

  const publicUrl = `${publicUrlRoot}/${cacheFilePath}`;
  const gsExportPath = `${gsUrlRoot}/${exportWildcardPath}`;

  return {
    bucket,
    cacheFilePath,
    publicUrl,
    gsExportPath
  };
}

function prefixWithExport(path, query) {
  return `
    EXPORT DATA OPTIONS(
    uri='${path}',
    format='${EXPORT_FORMAT}',
    compression='${EXPORT_COMPRESSION}',
    overwrite=true
    ${EXPORT_EXTRA_OPTIONS}
    ) AS
    ${query}
    LIMIT 999999999999 -- Force to one worker to create 1 file.
  `;
}

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

async function cacheExists(cachePaths) {
   const [exists] = await storageClient.bucket(cachePaths.bucket).file(cachePaths.cacheFilePath).exists();
   return exists;
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
