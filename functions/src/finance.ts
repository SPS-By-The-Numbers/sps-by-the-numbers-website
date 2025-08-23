import { BigQuery } from '@google-cloud/bigquery';
import { jsonOnRequest, makeResponseJson } from "./utils";
import * as Constants from 'config/constants';
import crypto from 'node:crypto';

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function makeCachePaths(ccddd, query) {
  const hash = sha256(query);
  const relativePathRoot = `sps-by-the-numbers.appspot.com/cache/scratch/${ccddd}/${hash}_`;
  const gsExportPath = `gs://${relativePathRoot}_*.csv.gz`;

  // Expect all dumps to be just 1 file. If there is more, well, that'd be very odd.
  const publicUrl = `https://storage.googleapis.com/${relativePathRoot}_000000000000.csv.gz`;
  return { gsExportPath, publicUrl };
}

function prefixWithExport(path, query) {
  return `
    EXPORT DATA OPTIONS(
    uri='${path}',
    format='CSV',
    overwrite=true,
    header=true) AS
    ${query}
    LIMIT 999999999999 -- Force to one worker.
  `;
}

function getExpenditures(ccddd) {
  return `
  SELECT
    data_type,
    school_year,
    school_starting_year,
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
    school_year,
    school_starting_year,
    is_district_office,
    program_code,
    program,
    activity_code,
    activity,
    object_code,
    object,
    data_type
  `;
}

const bigqueryClient = new BigQuery();

async function ensureTopLevelMetrics(ccddd) {
  const query = getExpenditures(ccddd);
  const cachePaths = makeCachePaths(ccddd, query);
  const export_query = prefixWithExport(cachePaths.gsExportPath, query);

  const options = {
    query: export_query,
    compression: 'GZIP',
    location: Constants.GCP_REGION,
  };

  // Await the results.
  await bigqueryClient.query(options);
  return cachePaths.publicUrl;
}

async function getDistrictData(req, res) {
  const ccddd = req.query.ccddd;
  if (!ccddd || ccddd.length != 5) {
    return res.status(400).send(makeResponseJson(false, `Invalid ccddd: ${ccddd}`));
  }

  const dataset = req.query.dataset;

  if (dataset === "top-level-metrics") {
    const dataUrl = await ensureTopLevelMetrics(ccddd);
    return res.status(200).send(makeResponseJson(true, "ok", {dataUrl}));
  } else {
    return res.status(400).send(makeResponseJson(false, "Invalid Dataset"));
  }
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
