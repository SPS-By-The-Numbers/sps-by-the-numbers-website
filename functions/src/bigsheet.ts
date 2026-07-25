// bigsheet endpoint: the ~1,170-column per-school joined sheet built entirely
// as one BigQuery SQL string and exported as DEFLATE AVRO to the public cache
// bucket, mirroring finance.ts. Column naming/structure: bigsheet/NAMING.md.
//
// GET ?ccddd=NNNNN
//   1. validate ccddd (integer, 4-5 digits) -- interpolate only the parsed
//      integer into SQL, never the raw string.
//   2. enumerate the pivot combos BigQuery PIVOT can't do dynamically (small
//      SELECT DISTINCT queries, in parallel; ordering + naming happen in the
//      generator via the canonical vocabularies in bigsheet/names.ts).
//   3. assemble the full SQL; SPS-only families included only for ccddd 17001.
//   4. cache key = sha256(assembledSql); the SQL text embeds the enumerated
//      pivot columns, so the cache self-invalidates when upstream years/groups
//      change (bump BIGSHEET_SQL_VERSION for pure logic fixes / CSV edits).
//   5. if the cache file exists -> return its URL; else EXPORT DATA then return.

import { BigQuery } from '@google-cloud/bigquery';
import { jsonOnRequest, makeResponseJson } from './utils';
import * as Constants from 'config/constants';
import {
  makeCachePaths, cacheExists, prefixWithExport,
  EXPORT_FORMAT, EXPORT_COMPRESSION,
} from './cache';
import { assembleBigsheetSql, BigsheetCombos } from './bigsheet/assemble';
import {
  Combo, comboQueryAssessment, comboQueryMap, comboQuerySqss,
} from './bigsheet/pivots';

const SEATTLE_CCDDD = 17001;
const bigqueryClient = new BigQuery();

async function runCombo(query: string): Promise<Record<string, unknown>[]> {
  const [rows] = await bigqueryClient.query(
    { query, location: Constants.GCP_REGION });
  return rows as Record<string, unknown>[];
}

async function enumerateCombos(ccddd: number): Promise<BigsheetCombos> {
  if (ccddd === SEATTLE_CCDDD) {
    const [asmt, hc, nonhc, sqss] = await Promise.all([
      runCombo(comboQueryAssessment(ccddd)),
      runCombo(comboQueryMap('map_hc')),
      runCombo(comboQueryMap('map_nonhc')),
      runCombo(comboQuerySqss()),
    ]);
    const mapCombo = (r: Record<string, unknown>): Combo =>
      [r.academic_subject as string, Number(r.grade), r.season as string];
    return {
      assessment: asmt.map((r) =>
        [r.test_administration, r.test_subject, r.student_group] as Combo),
      mapHc: hc.map(mapCombo),
      mapNonhc: nonhc.map(mapCombo),
      sqss: sqss.map((r) => [r.measure, r.student_group] as Combo),
    };
  }
  const asmt = await runCombo(comboQueryAssessment(ccddd));
  return {
    assessment: asmt.map((r) =>
      [r.test_administration, r.test_subject, r.student_group] as Combo),
  };
}

async function getBigsheet(req, res) {
  const raw = req.query.ccddd;
  const ccddd = Number.parseInt(raw, 10);
  if (!raw || !/^\d{4,5}$/.test(String(raw)) || !Number.isInteger(ccddd)) {
    return res.status(400).send(
      makeResponseJson(false, `Invalid ccddd: ${raw}`));
  }

  const combos = await enumerateCombos(ccddd);
  const query = assembleBigsheetSql(ccddd, combos);
  const cachePaths = makeCachePaths(String(ccddd), 'bigsheet', query);

  if (!await cacheExists(cachePaths)) {
    console.info(`No bigsheet cache for ${ccddd}. Running EXPORT DATA.`);
    await bigqueryClient.query({
      query: prefixWithExport(cachePaths.gsExportPath, query),
      location: Constants.GCP_REGION,
    });
  }

  return res.status(200).send(makeResponseJson(true, 'ok', {
    dataUrl: cachePaths.publicUrl,
    format: EXPORT_FORMAT,
    compression: EXPORT_COMPRESSION,
  }));
}

export const bigsheet = jsonOnRequest(
  { cors: true, region: [Constants.GCP_REGION] },
  async (req, res) => {
    if (req.method === 'GET') {
      return await getBigsheet(req, res);
    }
    return res.status(405).send(makeResponseJson(false, 'Method Not Allowed'));
  },
);
