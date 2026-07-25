// Assemble the full bigsheet SQL from the vitals CTE chain + the enumerated
// pivot SELECT lists + the ccddd. SPS-only column families (MAP, BEX, churn,
// SQSS) are spliced in only for ccddd 17001; everything else is district-
// general. Operation order mirrors bigsheet.py (BIGSHEET_MIGRATION_PLAN §2):
// vitals branch (with map/bex/churn LEFT JOINs) -> FULL OUTER assessment ->
// post-join derived -> normalized (windowed over the pre-sqss frame) -> FULL
// OUTER sqss. The final SELECT lifts the five key columns to the front (the
// pandas moveToFront calls) and the AVRO field order IS this column order.

import {
  buildVitalsCtes, buildAssessmentFilteredSql, sqssWithMeasureClean,
  SEATTLE_CCDDD, INPUTS,
} from './staticSql';
import {
  Combo, buildPivotSelectList,
  ASSESSMENT_SPEC, MAP_HC_SPEC, MAP_NONHC_SPEC, SQSS_SPEC,
} from './pivots';

// Bump to force cache invalidation on a pure logic fix (data changes already
// invalidate via the enumerated pivot columns embedded in the SQL text).
export const BIGSHEET_SQL_VERSION = '2026-07-25.1';

export interface BigsheetCombos {
  assessment: Combo[];
  mapHc?: Combo[];
  mapNonhc?: Combo[];
  sqss?: Combo[];
}

/** null-safe equality (pandas merges match NULL==NULL; SQL `=` does not). */
function nse(a: string, b: string): string {
  return `(${a} = ${b} OR (${a} IS NULL AND ${b} IS NULL))`;
}

export function assembleBigsheetSql(
    ccddd: number, combos: BigsheetCombos): string {
  const isSps = ccddd === SEATTLE_CCDDD;
  const ctes: string[] = [buildVitalsCtes(ccddd)];

  // ---- Pivot / join CTEs (SPS-only families gated) ----
  if (isSps) {
    ctes.push(`map_hc_wide AS (\n  SELECT school_code,\n    ` +
      buildPivotSelectList(MAP_HC_SPEC, combos.mapHc || []) +
      `\n  FROM ${INPUTS}.map_hc\n  GROUP BY school_code\n)`);
    ctes.push(`map_nonhc_wide AS (\n  SELECT school_code,\n    ` +
      buildPivotSelectList(MAP_NONHC_SPEC, combos.mapNonhc || []) +
      `\n  FROM ${INPUTS}.map_nonhc\n  GROUP BY school_code\n)`);
    // COALESCE(SUM(x), 0): pandas groupby.sum() (min_count=0) yields 0 for an
    // all-NaN group; BigQuery SUM yields NULL. Groups here always exist (LEFT
    // JOIN handles absent schools), so 0 is the faithful value.
    const cs = (c: string) => `COALESCE(SUM(${c}), 0)`;
    ctes.push(`churn AS (\n  SELECT class_of, school_code,\n` +
      `    ${cs('transfer_in')} AS bldg_staff_transfer_in,\n` +
      `    ${cs('transfer_out')} AS bldg_staff_transfer_out,\n` +
      `    ${cs('hire')} AS bldg_staff_hire,\n` +
      `    ${cs('depart')} AS bldg_staff_depart,\n` +
      `    ${cs('transfer_in')} + ${cs('hire')} AS bldg_staff_added,\n` +
      `    ${cs('transfer_out')} + ${cs('depart')} AS bldg_staff_lost,\n` +
      `    (${cs('transfer_in')} + ${cs('hire')}) - (${cs('transfer_out')} + ${cs('depart')})` +
      ` AS bldg_staff_net_churn\n` +
      `  FROM ${INPUTS}.building_transitions\n  GROUP BY class_of, school_code\n)`);
    ctes.push(`sqss_wide AS (\n  SELECT class_of, school_code,\n    ` +
      buildPivotSelectList(SQSS_SPEC, combos.sqss || []) +
      `\n  FROM (\n${sqssWithMeasureClean()}\n  )\n` +
      `  WHERE measure_clean IS NOT NULL\n  GROUP BY class_of, school_code\n)`);
  }

  ctes.push(`assessment_wide AS (\n  SELECT class_of, school_code, grade_level,\n    ` +
    buildPivotSelectList(ASSESSMENT_SPEC, combos.assessment) +
    `\n  FROM (\n${buildAssessmentFilteredSql(ccddd)}\n  )\n` +
    `  GROUP BY class_of, school_code, grade_level\n)`);

  // ---- vitals branch: vitals_all + map/bex/churn LEFT JOINs (SPS only) ----
  const branchCols: string[] = ['va.*'];
  const branchJoins: string[] = [];
  if (isSps) {
    branchCols.push('mh.* EXCEPT(school_code)', 'mn.* EXCEPT(school_code)',
      'bex.* EXCEPT(school_code)', 'util.* EXCEPT(school_code)',
      'income.* EXCEPT(school_code)', 'ch.* EXCEPT(class_of, school_code)');
    branchJoins.push(
      `  LEFT JOIN map_hc_wide mh ON ${nse('va.school_code', 'mh.school_code')}`,
      `  LEFT JOIN map_nonhc_wide mn ON ${nse('va.school_code', 'mn.school_code')}`,
      `  LEFT JOIN ${INPUTS}.bex bex ON ${nse('va.school_code', 'bex.school_code')}`,
      `  LEFT JOIN ${INPUTS}.utilization_condition util ON ${nse('va.school_code', 'util.school_code')}`,
      `  LEFT JOIN ${INPUTS}.income_by_school income ON ${nse('va.school_code', 'income.school_code')}`,
      `  LEFT JOIN churn ch ON va.class_of = ch.class_of AND ${nse('va.school_code', 'ch.school_code')}`);
  }
  ctes.push(`vitals_branch AS (\n  SELECT\n    ${branchCols.join(',\n    ')}\n` +
    `  FROM vitals_all va\n${branchJoins.join('\n')}${branchJoins.length ? '\n' : ''})`);

  // ---- merged: vitals_branch FULL OUTER assessment + post-join derived ----
  ctes.push(`merged AS (\n  SELECT\n` +
    `    COALESCE(vb.class_of, a.class_of) AS class_of,\n` +
    `    COALESCE(vb.school_code, a.school_code) AS school_code,\n` +
    `    vb.* EXCEPT(class_of, school_code),\n` +
    `    a.grade_level,\n` +
    `    a.* EXCEPT(class_of, school_code, grade_level),\n` +
    `    IF(COALESCE(vb.class_of, a.class_of) >= 2021, 1, 0) AS at_or_after_2021,\n` +
    `    IF(vb.all_students > 0, LN(vb.all_students), NULL) AS log_enrollment\n` +
    `  FROM vitals_branch vb\n` +
    `  FULL OUTER JOIN assessment_wide a\n` +
    `    ON vb.class_of = a.class_of AND ${nse('vb.school_code', 'a.school_code')}\n)`);

  // ---- merged_norm: MAX() OVER () normalized fields over the pre-sqss frame -
  const normCols: string[] = [
    'IEEE_DIVIDE(m.all_students, MAX(m.all_students) OVER ()) AS num_students_normalized',
    'IEEE_DIVIDE(m.class_of, MAX(m.class_of) OVER ()) AS class_of_normalized',
    'IEEE_DIVIDE(m.school_code, MAX(m.school_code) OVER ()) AS school_code_normalized',
  ];
  if (isSps) {
    normCols.push('IEEE_DIVIDE(m.ms_assignment_code, MAX(m.ms_assignment_code) OVER ()) AS ms_assignment_code_normalized');
  }
  normCols.push(
    'IEEE_DIVIDE(m.class_teacher_exp_50pctile, MAX(m.class_teacher_exp_50pctile) OVER ()) AS class_teacher_exp_50pctile_normalized',
    'IEEE_DIVIDE(m.num_class_teachers_bachelors + m.num_class_teachers_masters + m.num_class_teachers_doctors, m.num_class_teachers) AS pct_class_teacher_ge_bachelors',
    'IEEE_DIVIDE(m.num_class_teachers_masters + m.num_class_teachers_doctors, m.num_class_teachers) AS pct_class_teacher_gt_bachelors',
    'IEEE_DIVIDE(m.class_teacher_fte, m.all_students) AS class_teacher_fte_per_pupil',
    'IEEE_DIVIDE(m.asst_principal_fte, m.all_students) AS asst_principal_fte_per_pupil',
    'IEEE_DIVIDE(m.other_teacher_fte, m.all_students) AS other_teacher_fte_per_pupil');
  ctes.push(`merged_norm AS (\n  SELECT m.*,\n    ${normCols.join(',\n    ')}\n  FROM merged m\n)`);

  // ---- final SELECT: lift the 5 key cols to the front; FULL OUTER sqss ------
  const front5 = 'class_of, school_name, type, is_regular, school_code';
  let finalSelect: string;
  if (isSps) {
    finalSelect =
      `SELECT\n` +
      `  COALESCE(m.class_of, s.class_of) AS class_of,\n` +
      `  m.school_name, m.type, m.is_regular,\n` +
      `  COALESCE(m.school_code, s.school_code) AS school_code,\n` +
      `  m.* EXCEPT(${front5}),\n` +
      `  s.* EXCEPT(class_of, school_code)\n` +
      `FROM merged_norm m\n` +
      `FULL OUTER JOIN sqss_wide s\n` +
      `  ON ${nse('m.class_of', 's.class_of')} AND ${nse('m.school_code', 's.school_code')}\n` +
      `ORDER BY class_of, school_code`;
  } else {
    finalSelect =
      `SELECT\n` +
      `  m.class_of, m.school_name, m.type, m.is_regular, m.school_code,\n` +
      `  m.* EXCEPT(${front5})\n` +
      `FROM merged_norm m\n` +
      `ORDER BY class_of, school_code`;
  }

  return `-- BIGSHEET_SQL_VERSION: ${BIGSHEET_SQL_VERSION}\n` +
    `WITH\n\n${ctes.join(',\n\n')}\n\n${finalSelect}\n`;
}
