import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import { jsonOnRequest, makeResponseJson } from "./utils";
import * as Constants from 'config/constants';
import crypto from 'node:crypto';

const CACHE_BUCKET = "sps-by-the-numbers-public";

const bigqueryClient = new BigQuery();
const storageClient = new Storage();


function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function makeCachePaths(ccddd, dataset, query) {
  const hash = sha256(query);

  const bucket = CACHE_BUCKET;
  const relativePathRoot = `cache/scratch/${ccddd}/${dataset}/${hash.substr(0, 8)}_`;
  const gsUrlRoot = `gs://${bucket}`;
  const exportWildcardPath = `${relativePathRoot}_*.csv.gz`;
  const publicUrlRoot = `https://storage.googleapis.com/${bucket}`;

  // Assume there is only 1 file output from the dump.
  const cacheFilePath = `${relativePathRoot}_000000000000.csv.gz`;

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
    format='CSV',
    compression='GZIP',
    overwrite=true,
    header=true) AS
    ${query}
    LIMIT 999999999999 -- Force to one worker to create 1 file.
  `;
}

function getEnrollment(ccddd) {
  return `
  SELECT
    report_type,
    school_year,
    class_of,
    ccddd,
    enrollment_domain,
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
    sum(c_pct_expenditure) c_pct_expenditure,
    sum(c_pct_revenue) c_pct_revenue,
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
    object
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
    SPLIT(r.school_year, '-')[1] class_of,
    a.program_code,
    a.activity_code,
    sum(a.fte_in_assignment) fte_in_assignment
  FROM
    sps-btn-data.safs_s275.assignment a
    JOIN sps-btn-data.safs_s275.report r ON (a.report_id = r.report_id)
    WHERE
    r.report_type = 'final' AND
    r.ccddd = ${ccddd}
  GROUP BY
    school_year,
    class_of,
    program_code,
    activity_code
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
  return res.status(200).send(makeResponseJson(true, "ok", {dataUrl}));
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
