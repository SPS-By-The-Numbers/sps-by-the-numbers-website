import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import { jsonOnRequest, makeResponseJson } from "./utils";
import * as Constants from 'config/constants';
import crypto from 'node:crypto';

const CACHE_BUCKET = "sps-by-the-numbers.appspot.com";

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

async function cacheExists(cachePaths) {
   const [exists] = await storageClient.bucket(cachePaths.bucket).file(cachePaths.cacheFilePath).exists();
   return exists;
}

async function ensureTopLevelMetrics(ccddd) {
  const query = getExpenditures(ccddd);
  const cachePaths = makeCachePaths(ccddd, 'top-level-metrics', query);

  if (! await cacheExists(cachePaths)) {
    console.info(`No cache found for top-level-metrics in ${ccddd}. Doing SQL dump.`);
    const export_query = prefixWithExport(cachePaths.gsExportPath, query);

    const options = {
      query: export_query,
      compression: 'GZIP',
      location: Constants.GCP_REGION,
    };

    // Await the results.
    await bigqueryClient.query(options);
  }

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
