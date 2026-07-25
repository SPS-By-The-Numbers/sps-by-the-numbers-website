// Golden-diff harness for the migrated bigsheet SQL (task T1.4 / gate T3.1).
// Runs with tsx + ADC, NOT jest:
//   npx tsx scripts/golden_diff.ts dryrun [ccddd]
//   npx tsx scripts/golden_diff.ts diff <golden.csv> [ccddd]
//
// dryrun: enumerate combos, assemble, BigQuery dry-run (cheapest syntax check).
// diff:   also run the query and compare value-for-value against the golden.
//
// Comparison: sanitize golden headers (dropping golden column 0, the pandas
// index); assert bijective; column set + order equal; per-cell numeric within
// rel 1e-6 / abs 1e-9 (inf/NaN/NULL/empty all normalized); row counts equal;
// keyed by (class_of, school_code with NULL -> sentinel).

import { BigQuery } from '@google-cloud/bigquery';
import * as fs from 'node:fs';
import { assembleBigsheetSql, BigsheetCombos } from '../src/bigsheet/assemble';
import {
  Combo, comboQueryAssessment, comboQueryMap, comboQuerySqss,
} from '../src/bigsheet/pivots';
import { sanitizeUnique } from '../src/bigsheet/names';

const LOCATION = 'us-west1';
const bq = new BigQuery({ projectId: 'sps-btn-data' });

async function run(query: string): Promise<Record<string, unknown>[]> {
  const [rows] = await bq.query({ query, location: LOCATION });
  return rows as Record<string, unknown>[];
}

async function fetchCombos(ccddd: number): Promise<BigsheetCombos> {
  const asmt = await run(comboQueryAssessment(ccddd));
  const combos: BigsheetCombos = {
    assessment: asmt.map((r) => [
      r.test_administration, r.test_subject, r.student_group] as Combo),
  };
  if (ccddd === 17001) {
    const hc = await run(comboQueryMap('map_hc'));
    const nonhc = await run(comboQueryMap('map_nonhc'));
    const sqss = await run(comboQuerySqss());
    const mapCombo = (r: Record<string, unknown>): Combo =>
      [r.academic_subject as string, Number(r.grade), r.season as string];
    combos.mapHc = hc.map(mapCombo);
    combos.mapNonhc = nonhc.map(mapCombo);
    combos.sqss = sqss.map((r) => [r.measure_clean, r.student_group] as Combo);
  }
  return combos;
}

// ---- minimal RFC-4180 CSV parser (golden is small: 1185 rows) ----
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let i = 0;
  let quoted = false;
  while (i < text.length) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      cell += c; i++; continue;
    }
    if (c === '"') { quoted = true; i++; continue; }
    if (c === ',') { row.push(cell); cell = ''; i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i++; continue; }
    cell += c; i++;
  }
  if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

const NULLISH = new Set(['', 'nan', 'null', 'none', 'na']);

function normNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object') {
    // BigQueryNumeric / BigQueryInt expose .value or stringify
    const s = String((v as { value?: unknown }).value ?? v);
    v = s;
  }
  if (typeof v === 'boolean') return v ? 1 : 0;
  const s = String(v).trim();
  if (NULLISH.has(s.toLowerCase())) return null;
  if (/^-?inf(inity)?$/i.test(s)) return s[0] === '-' ? -Infinity : Infinity;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

function cellsEqual(golden: string, actual: unknown): boolean {
  // boolean-ish normalization (True/true/1)
  const gRaw = golden.trim();
  const gLow = gRaw.toLowerCase();
  const aIsBool = typeof actual === 'boolean';
  if (aIsBool || gLow === 'true' || gLow === 'false') {
    const gb = gLow === 'true' || gRaw === '1' || gRaw === '1.0';
    const ab = typeof actual === 'boolean' ? actual :
      (normNum(actual) === 1);
    if (gLow === 'true' || gLow === 'false') return gb === ab;
  }
  const gN = normNum(gRaw);
  const aN = normNum(actual);
  const gIsNum = gN !== null || NULLISH.has(gLow) || /inf/i.test(gLow);
  const aIsNum = aN !== null || actual === null || actual === undefined ||
    (typeof actual === 'number');
  if (gIsNum && aIsNum) {
    if (gN === null && aN === null) return true;
    if (gN === null || aN === null) return false;
    if (gN === aN) return true;
    const diff = Math.abs(gN - aN);
    if (diff <= 1e-9) return true;
    return diff <= 1e-6 * Math.max(Math.abs(gN), Math.abs(aN));
  }
  // string compare
  const aStr = actual === null || actual === undefined ? '' : String(actual);
  if (NULLISH.has(gLow) && NULLISH.has(aStr.trim().toLowerCase())) return true;
  return gRaw === aStr;
}

function keyOf(classOf: unknown, schoolCode: unknown): string {
  const c = classOf === null || classOf === undefined || classOf === '' ?
    '∅' : String(normNum(classOf) ?? classOf);
  const s = schoolCode === null || schoolCode === undefined || schoolCode === '' ?
    '∅' : String(normNum(schoolCode) ?? schoolCode);
  return `${c}|${s}`;
}

async function main() {
  const mode = process.argv[2];
  const ccddd = Number(process.argv[process.argv.length - 1]) || 17001;

  const combos = await fetchCombos(17001 === ccddd ? 17001 : ccddd);
  const sql = assembleBigsheetSql(ccddd, combos);
  console.log(`Assembled SQL: ${sql.length} bytes, ` +
    `${combos.assessment.length} assessment combos` +
    (combos.mapHc ? `, ${combos.mapHc.length} mapHc, ${combos.mapNonhc!.length} mapNonhc, ${combos.sqss!.length} sqss combos` : ''));

  // Always dry-run first.
  const [job] = await bq.createQueryJob({ query: sql, location: LOCATION, dryRun: true });
  const bytes = job.metadata.statistics?.totalBytesProcessed;
  console.log(`Dry-run OK. Would process ${bytes} bytes.`);
  if (mode === 'dryrun') return;

  if (mode !== 'diff') { throw new Error(`unknown mode ${mode}`); }
  const goldenPath = process.argv[3];
  const text = fs.readFileSync(goldenPath, 'utf8');
  const grid = parseCsv(text);
  const rawHeader = grid[0];
  // drop column 0 (pandas index)
  const goldenHeaders = rawHeader.slice(1);
  const { names: sanitized, collisions } = sanitizeUnique(goldenHeaders);
  if (collisions.length) {
    console.log(`Golden headers: disambiguated ${collisions.length} sanitize ` +
      `collision(s): ${collisions.map((c) => c.join('->')).join(', ')}`);
  }
  const goldIdx = new Map(sanitized.map((s, i) => [s, i] as [string, number]));

  const goldRows = grid.slice(1).filter((r) => r.length > 1);
  const ciClass = sanitized.indexOf('class_of');
  const ciSchool = sanitized.indexOf('school_code');

  console.log('Running full query (this reads the tables)...');
  const rows = await run(sql);
  const actualHeaders = rows.length ? Object.keys(rows[0]) : [];

  // ---- column set + order ----
  const setG = new Set(sanitized);
  const setA = new Set(actualHeaders);
  const missing = sanitized.filter((h) => !setA.has(h));
  const extra = actualHeaders.filter((h) => !setG.has(h));
  console.log(`\nColumns: golden ${sanitized.length}, actual ${actualHeaders.length}`);
  if (missing.length) console.log(`  MISSING in actual (${missing.length}): ${missing.slice(0, 30).join(', ')}`);
  if (extra.length) console.log(`  EXTRA in actual (${extra.length}): ${extra.slice(0, 30).join(', ')}`);
  let orderMismatch = -1;
  for (let i = 0; i < Math.min(sanitized.length, actualHeaders.length); i++) {
    if (sanitized[i] !== actualHeaders[i]) { orderMismatch = i; break; }
  }
  if (orderMismatch >= 0) {
    console.log(`  ORDER first differs at index ${orderMismatch}: ` +
      `golden=${sanitized[orderMismatch]} actual=${actualHeaders[orderMismatch]}`);
  } else if (missing.length === 0 && extra.length === 0) {
    console.log('  column set + order MATCH');
  }

  // ---- rows ----
  const actualByKey = new Map<string, Record<string, unknown>>();
  for (const r of rows) actualByKey.set(keyOf(r.class_of, r.school_code), r);
  console.log(`\nRows: golden ${goldRows.length}, actual ${rows.length}`);

  const commonCols = sanitized.filter((h) => setA.has(h));
  let mismatches = 0;
  let keyMisses = 0;
  const shown: string[] = [];
  for (const gr of goldRows) {
    const key = keyOf(gr[ciClass + 1], gr[ciSchool + 1]);
    const ar = actualByKey.get(key);
    if (!ar) {
      keyMisses++;
      if (shown.length < 50) shown.push(`  KEY MISSING in actual: ${key}`);
      continue;
    }
    for (const h of commonCols) {
      const gi = goldIdx.get(h)!;
      const gv = gr[gi + 1];
      const av = ar[h];
      if (!cellsEqual(gv, av)) {
        mismatches++;
        if (shown.length < 50) {
          shown.push(`  ${key} col=${h} golden=${JSON.stringify(gv)} actual=${JSON.stringify(av)}`);
        }
      }
    }
  }
  console.log(`\nKey misses: ${keyMisses}, value mismatches: ${mismatches}`);
  if (shown.length) console.log('\nFirst issues:\n' + shown.join('\n'));

  const clean = missing.length === 0 && extra.length === 0 &&
    orderMismatch < 0 && keyMisses === 0 && mismatches === 0 &&
    goldRows.length === rows.length;
  console.log(`\n=== ${clean ? 'GOLDEN DIFF CLEAN ✅' : 'GOLDEN DIFF FAILED ❌'} ===`);
  process.exitCode = clean ? 0 : 1;
}

main().catch((e) => { console.error(e); process.exitCode = 2; });
