// Non-SPS smoke test: assemble + run for a given ccddd, then check that
// SPS-only column families are absent and core columns are populated.
//   npx tsx scripts/nonsps_smoke.ts 27010
import { BigQuery } from '@google-cloud/bigquery';
import { assembleBigsheetSql } from '../src/bigsheet/assemble';
import { comboQueryAssessment, Combo } from '../src/bigsheet/pivots';

const bq = new BigQuery({ projectId: 'sps-btn-data' });
const LOCATION = 'us-west1';

async function main() {
  const ccddd = Number(process.argv[2] || 27010);
  const [asmt] = await bq.query({ query: comboQueryAssessment(ccddd), location: LOCATION });
  const combos = {
    assessment: (asmt as Record<string, unknown>[]).map((r) =>
      [r.test_administration, r.test_subject, r.student_group] as Combo),
  };
  const sql = assembleBigsheetSql(ccddd, combos);
  const [rows] = await bq.query({ query: sql, location: LOCATION });
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const spsOnlyPrefixes = ['map_hc_', 'map_nonhc_', 'bex_', 'bldg_', 'income_',
    'churn_', 'sqss_', 'region_', 'ms_meany'];
  const bad = cols.filter((c) =>
    spsOnlyPrefixes.some((p) => c.startsWith(p)) ||
    c === 'ms_assignment_code_normalized');
  const withVal = (name: string) =>
    (rows as Record<string, unknown>[]).filter((r) => r[name] != null).length;

  console.log(`ccddd ${ccddd}: ${rows.length} rows, ${cols.length} columns`);
  console.log(`  SPS-only columns present (should be 0): ${bad.length}` +
    (bad.length ? ' -> ' + bad.slice(0, 10).join(', ') : ''));
  console.log(`  type dummies present: ${['type_other', 'type_k8', 'type_highschool', 'type_middle', 'type_elementary'].filter((c) => cols.includes(c)).length}/5`);
  console.log(`  rows with spend_total: ${withVal('spend_total')}`);
  console.log(`  rows with staff_all_fte: ${withVal('staff_all_fte')}`);
  console.log(`  rows with enroll_total: ${withVal('enroll_total')}`);
  console.log(`  assessment cols (asmt_-prefixed): ${cols.filter((c) => c.startsWith('asmt_')).length}`);
  console.log(bad.length === 0 ? 'NON-SPS SMOKE OK ✅' : 'NON-SPS SMOKE FAILED ❌');
  process.exitCode = bad.length === 0 ? 0 : 1;
}
main().catch((e) => { console.error(e.message || e); process.exitCode = 2; });
