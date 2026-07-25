// Non-SPS smoke test (T3.2): assemble + run for a given ccddd, then check that
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
  const forbidden = ['hc_', 'nonhc_', 'bldg_staff_', 'r_', 'm_'];
  const bad = cols.filter((c) =>
    forbidden.some((p) => c.startsWith(p)) ||
    /_percent$|_numerator$|_denominator$/.test(c) ||   // sqss
    c === 'ms_assignment_code_normalized' ||
    /Composite_Score|BEX_IV_Rank|es_zone/.test(c));    // bex/income
  const withVal = (name: string) =>
    (rows as Record<string, unknown>[]).filter((r) => r[name] != null).length;

  console.log(`ccddd ${ccddd}: ${rows.length} rows, ${cols.length} columns`);
  console.log(`  SPS-only columns present (should be 0): ${bad.length}` +
    (bad.length ? ' -> ' + bad.slice(0, 10).join(', ') : ''));
  console.log(`  type dummies present: ${['OtherSchool', 'K_8', 'Highschool', 'Middle', 'Elementary'].filter((c) => cols.includes(c)).length}/5`);
  console.log(`  rows with total_spend: ${withVal('total_spend')}`);
  console.log(`  rows with fte: ${withVal('fte')}`);
  console.log(`  rows with all_students: ${withVal('all_students')}`);
  console.log(`  assessment cols (pct_noscore-suffixed): ${cols.filter((c) => c.endsWith('_pct_noscore')).length}`);
  console.log(bad.length === 0 ? 'NON-SPS SMOKE OK ✅' : 'NON-SPS SMOKE FAILED ❌');
  process.exitCode = bad.length === 0 ? 0 : 1;
}
main().catch((e) => { console.error(e.message || e); process.exitCode = 2; });
