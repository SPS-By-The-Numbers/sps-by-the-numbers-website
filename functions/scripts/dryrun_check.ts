// Assembles the bigsheet SQL with live combos and BigQuery DRY-RUNS it (zero
// cost): proves the generated SQL compiles against the real tables and
// reports the planned column count.
//   npx tsx scripts/dryrun_check.ts 17001
import { BigQuery } from '@google-cloud/bigquery';
import { buildBigsheetPlan, BigsheetCombos } from '../src/bigsheet/assemble';
import {
  Combo, comboQueryAssessment, comboQueryMap, comboQuerySqss,
} from '../src/bigsheet/pivots';

const bq = new BigQuery({ projectId: 'sps-btn-data' });
const LOCATION = 'us-west1';
const SEATTLE = 17001;

async function q(query: string): Promise<Record<string, unknown>[]> {
  const [rows] = await bq.query({ query, location: LOCATION });
  return rows as Record<string, unknown>[];
}

async function main() {
  const ccddd = Number(process.argv[2] || SEATTLE);
  const combos: BigsheetCombos = {
    assessment: (await q(comboQueryAssessment(ccddd))).map((r) =>
      [r.test_administration, r.test_subject, r.student_group] as Combo),
  };
  if (ccddd === SEATTLE) {
    const [hc, nonhc, sqss] = await Promise.all([
      q(comboQueryMap('map_hc')), q(comboQueryMap('map_nonhc')), q(comboQuerySqss()),
    ]);
    const mapCombo = (r: Record<string, unknown>): Combo =>
      [r.academic_subject as string, Number(r.grade), r.season as string];
    combos.mapHc = hc.map(mapCombo);
    combos.mapNonhc = nonhc.map(mapCombo);
    combos.sqss = sqss.map((r) => [r.measure, r.student_group] as Combo);
  }
  const plan = buildBigsheetPlan(ccddd, combos);
  console.log(`ccddd ${ccddd}: ${plan.columns.length} planned columns, ` +
    `sql ${(plan.sql.length / 1024).toFixed(0)}KB`);
  const [job] = await bq.createQueryJob(
    { query: plan.sql, location: LOCATION, dryRun: true });
  const stats = job.metadata.statistics;
  console.log(`  dry run OK, would process ` +
    `${(Number(stats.totalBytesProcessed) / 1e6).toFixed(1)} MB`);
  const schema = job.metadata.statistics.query?.schema?.fields;
  if (schema) {
    console.log(`  result schema: ${schema.length} fields`);
    const planned = plan.columns.map((c) => c.name);
    const got = schema.map((f: { name: string }) => f.name);
    const mismatch = planned.length !== got.length ||
      planned.some((n, i) => n !== got[i]);
    console.log(mismatch ? '  SCHEMA MISMATCH vs plan ❌' : '  schema matches plan 1:1 ✅');
    if (mismatch) {
      for (let i = 0; i < Math.max(planned.length, got.length); i++) {
        if (planned[i] !== got[i]) {
          console.log(`    first diff at ${i}: planned=${planned[i]} got=${got[i]}`);
          break;
        }
      }
      process.exitCode = 1;
    }
  }
}
main().catch((e) => { console.error(e.message || e); process.exitCode = 2; });
