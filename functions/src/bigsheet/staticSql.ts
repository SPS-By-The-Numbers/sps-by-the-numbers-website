// Static (non-pivot) SQL fragments for the bigsheet endpoint: the vitals CTE
// chain (a faithful port of marts/vitals.sql with the two documented fixes
// applied in-place), plus the assessment/sqss source fragments the pivot
// generators consume. All join/derivation logic is SQL; this module only
// assembles strings.
//
// Porting map (see BIGSHEET_MIGRATION_PLAN.md section 2):
//  - {project} -> sps-btn-data, 17001 -> ccddd (both from vitals.sql).
//  - the two ARRAY_AGG(experience_years) columns become exact order-statistic
//    percentiles IN PLACE (numpy 'inverted_cdf'): the ceil(q/100*n)-th smallest.
//  - trailing ORDER BY dropped (applied once at the very end).
//  - spend groups (pandas fillna(0) -> COALESCE) and the type/region/ms dummies
//    are computed in the vitals branch, BEFORE the assessment/sqss outer joins,
//    so outer-join-only rows keep NULL (not 0) for them.

import { RAW_VITALS_SQL } from './sql/vitalsSql';
import { RAW_ASSESSMENT_SQL } from './sql/assessmentSql';

export const SEATTLE_CCDDD = 17001;
export const INPUTS = 'sps-btn-data.bigsheet_inputs';

/** numpy inverted_cdf percentile of a sorted-ascending ARRAY_AGG expression. */
function pctileExpr(arr: string, q: number): string {
  return `IF(ARRAY_LENGTH(${arr}) = 0, NULL, ` +
    `${arr}[OFFSET(CAST(CEIL(${q} / 100.0 * ARRAY_LENGTH(${arr})) AS INT64) - 1)])`;
}

const EXP_ARR =
  'ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years)';

/**
 * The vitals CTE chain, ending in a `vitals_all` CTE (vitals_org + spend groups
 * + dummies). Returned WITHOUT a leading `WITH` and WITHOUT a trailing comma,
 * so assemble.ts can splice it into one big WITH clause.
 */
export function buildVitalsCtes(ccddd: number): string {
  const isSps = ccddd === SEATTLE_CCDDD;
  let sql = RAW_VITALS_SQL;
  sql = sql.replace(/\{project\}/g, 'sps-btn-data');
  sql = sql.replace(/17001/g, String(ccddd));

  // Percentile fix, in-place (keeps the column position the golden expects).
  sql = sql.replace(
    /ARRAY_AGG\(re\.experience_years IGNORE NULLS\s+ORDER BY re\.experience_years\) AS class_teacher_exp_years/,
    `${pctileExpr(EXP_ARR, 50)} AS class_teacher_exp_50pctile,\n` +
    `    ${pctileExpr(EXP_ARR, 80)} AS class_teacher_exp_80pctile`);
  sql = sql.replace(
    /ARRAY_AGG\(re\.experience_years IGNORE NULLS\s+ORDER BY re\.experience_years\) AS principal_exp_years/,
    `${pctileExpr(EXP_ARR, 50)} AS principal_exp_50pctile,\n` +
    `    ${pctileExpr(EXP_ARR, 80)} AS principal_exp_80pctile`);

  // Drop the leading comment block + `WITH` keyword (we own the WITH).
  sql = sql.slice(sql.indexOf('WITH ') + 'WITH '.length);
  // Wrap the trailing vitals_org SELECT as its own CTE.
  sql = sql.replace(
    /\)\s*\n\s*--[^\n]*vitals_org[^\n]*\n\s*\n\s*SELECT/,
    '),\n\nvitals_org AS (\nSELECT');
  // Drop the final ORDER BY and close the vitals_org CTE.
  sql = sql.replace(/\s*ORDER BY\s+school_code,\s*class_of\s*$/, '\n)');

  const dummies: string[] = [
    `IF(vo.type = 'Other', 1, 0) AS OtherSchool`,
    `IF(vo.type = 'K-8', 1, 0) AS K_8`,
    `IF(vo.type = 'Highschool', 1, 0) AS Highschool`,
    `IF(vo.type = 'Middle', 1, 0) AS Middle`,
    `IF(vo.type = 'Elementary', 1, 0) AS Elementary`,
  ];
  if (isSps) {
    for (const [name, val] of [
      ['r_Invalid', 'Invalid'], ['r_NW', 'NW'], ['r_NE', 'NE'],
      ['r_Central', 'Central'], ['r_SW', 'SW'], ['r_SE', 'SE'],
      ['r_Other', 'Other']]) {
      dummies.push(`IF(vo.region = '${val}', 1, 0) AS ${name}`);
    }
    for (const [name, code] of MS_ASSIGNMENT_DUMMIES) {
      dummies.push(`IF(vo.ms_assignment_code = ${code}, 1, 0) AS ${name}`);
    }
  }

  const vitalsAll = `,\n\nvitals_all AS (\n  SELECT\n    vo.*,\n` +
    `    COALESCE(vo.spend_gen_ed_per_pupil, 0) + COALESCE(vo.spend_instr_other_per_pupil, 0)` +
    ` + COALESCE(vo.spend_district_support_per_pupil, 0) + COALESCE(vo.spend_other_per_pupil, 0)` +
    ` AS spend_grp_ex_ell_speced_comp,\n` +
    `    COALESCE(vo.spend_spec_ed_per_pupil, 0) + COALESCE(vo.spend_compensatory_per_pupil, 0)` +
    ` AS spend_grp_spec_ed,\n` +
    `    COALESCE(vo.spend_title1_per_pupil, 0) + COALESCE(vo.spend_lap_per_pupil, 0)` +
    ` + COALESCE(vo.spend_ble_per_pupil, 0) AS spend_grp_title1_lap_ble,\n    ` +
    dummies.join(',\n    ') +
    `\n  FROM vitals_org vo\n)`;

  return sql + vitalsAll;
}

// m_<school> dummy -> ms_assignment_code (from bigsheet.py).
const MS_ASSIGNMENT_DUMMIES: Array<[string, number]> = [
  ['m_Meany', 5485], ['m_Eckstein', 2729], ['m_JaneAddams', 5351],
  ['m_Hamilton', 2371], ['m_McClure', 3517], ['m_RESMS', 5486],
  ['m_Whitman', 3277], ['m_AkiKurose', 3774], ['m_Mercer', 3095],
  ['m_Washington', 4064], ['m_Denny', 2839], ['m_Madison', 2435],
];

/** assessment.sql, parameterized, trailing ORDER BY dropped. */
export function buildAssessmentRawSql(ccddd: number): string {
  let sql = RAW_ASSESSMENT_SQL;
  sql = sql.replace(/\{project\}/g, 'sps-btn-data');
  sql = sql.replace(/17001/g, String(ccddd));
  sql = sql.replace(/\s*ORDER BY[\s\S]*$/, '\n');
  return sql.trim();
}

/**
 * assessment.sql + the two row filters bigsheet.py's select_assessments applies:
 * drop any NULL in the 6-col logical key; drop rows where all four value
 * columns are NULL (pct_alternative participates in this filter but is NOT
 * pivoted).
 */
export function buildAssessmentFilteredSql(ccddd: number): string {
  return `SELECT * FROM (\n${buildAssessmentRawSql(ccddd)}\n)\n` +
    `WHERE class_of IS NOT NULL AND school_code IS NOT NULL\n` +
    `  AND grade_level IS NOT NULL AND test_administration IS NOT NULL\n` +
    `  AND test_subject IS NOT NULL AND student_group IS NOT NULL\n` +
    `  AND NOT (pct_noscore IS NULL AND pct_alternative IS NULL\n` +
    `           AND pct_met_standard_numeric IS NULL\n` +
    `           AND pct_met_standard_numeric_nodat IS NULL)`;
}

/** sqss external table with the measure -> measure_clean mapping applied. */
export function sqssWithMeasureClean(): string {
  return `SELECT *, CASE measure\n` +
    `    WHEN 'Dual Credit' THEN 'dual_credit'\n` +
    `    WHEN 'Regular Attendance' THEN 'attendance'\n` +
    `    WHEN 'Ninth Grade on Track' THEN 'ninth_grade_on_track'\n` +
    `  END AS measure_clean\n  FROM ${INPUTS}.sqss`;
}
