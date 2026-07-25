// Unit tests for the bigsheet SQL generator (pure string building, no BQ).
// The end-to-end fidelity proof is the golden diff (scripts/golden_diff.ts);
// these lock the pieces the golden diff would otherwise diagnose slowly.

import { sanitizeName, sanitizeUnique, pivotColumnName } from './names';
import {
  buildPivotSelectList, comboQueryAssessment,
  ASSESSMENT_SPEC, MAP_HC_SPEC, SQSS_SPEC, Combo,
} from './pivots';
import { buildVitalsCtes, buildAssessmentFilteredSql } from './staticSql';
import { assembleBigsheetSql } from './assemble';

describe('sanitizeName', () => {
  it('replaces runs of non-identifier chars with a single _', () => {
    expect(sanitizeName('hc_Math_2_Fall_Average of RITScore'))
      .toBe('hc_Math_2_Fall_Average_of_RITScore');
    expect(sanitizeName('Hispanic/ Latino of any race(s)'))
      .toBe('Hispanic_Latino_of_any_race_s_');
    expect(sanitizeName('K-8')).toBe('K_8');
  });
  it('prefixes a leading digit with _', () => {
    expect(sanitizeName('2012 Composite Score')).toBe('_2012_Composite_Score');
    expect(sanitizeName('2022_building_condition_score'))
      .toBe('_2022_building_condition_score');
  });
});

describe('sanitizeUnique', () => {
  it('disambiguates genuine collisions deterministically, first keeps base', () => {
    const { names, collisions } = sanitizeUnique(
      ['Non Migrant', 'Non-Migrant', 'Non_Migrant']);
    expect(names).toEqual(['Non_Migrant', 'Non_Migrant_2', 'Non_Migrant_3']);
    expect(collisions.length).toBe(2);
  });
  it('leaves non-colliding names untouched', () => {
    expect(sanitizeUnique(['a', 'b_c', 'd']).names).toEqual(['a', 'b_c', 'd']);
  });
});

describe('pivotColumnName (rotate-left legacy naming)', () => {
  it('rotates value to the back, joins, prefixes, sanitizes', () => {
    expect(pivotColumnName('hc_', ['Mathematics', 1, 'Spring'], 'Average of RITScore'))
      .toBe('hc_Mathematics_1_Spring_Average_of_RITScore');
    expect(pivotColumnName('', ['EOC', 'Biology', 'All Students'], 'pct_noscore'))
      .toBe('EOC_Biology_All_Students_pct_noscore');
  });
});

describe('buildPivotSelectList', () => {
  it('is value-major then combo-order, with MAX(IF()) cells', () => {
    const combos: Combo[] = [
      ['EOC', 'Biology', 'All Students'], ['SBAC', 'ELA', 'Female']];
    const sql = buildPivotSelectList(ASSESSMENT_SPEC, combos);
    // value-major: all pct_noscore combos precede the first pct_met column
    const iNoscore = sql.indexOf('EOC_Biology_All_Students_pct_noscore');
    const iMet = sql.indexOf('EOC_Biology_All_Students_pct_met_standard_numeric`');
    expect(iNoscore).toBeGreaterThanOrEqual(0);
    expect(iMet).toBeGreaterThan(iNoscore);
    expect(sql).toContain(
      "MAX(IF(test_administration = 'EOC' AND test_subject = 'Biology' AND " +
      "student_group = 'All Students', pct_noscore, NULL)) AS " +
      '`EOC_Biology_All_Students_pct_noscore`');
    // 2 combos x 3 values = 6 columns
    expect(sql.split(' AS ').length - 1).toBe(6);
  });
  it('escapes single quotes and emits bare numeric grade literals', () => {
    const sql = buildPivotSelectList(MAP_HC_SPEC, [['Mathematics', 1, 'Spring']]);
    expect(sql).toContain('grade = 1');
    expect(sql).toContain("academic_subject = 'Mathematics'");
  });
  it('disambiguates the Non Migrant / Non-Migrant sqss collision', () => {
    const sql = buildPivotSelectList(SQSS_SPEC,
      [['attendance', 'Non Migrant'], ['attendance', 'Non-Migrant']]);
    expect(sql).toContain('`attendance_Non_Migrant_percent`');
    expect(sql).toContain('`attendance_Non_Migrant_percent_2`');
  });
});

describe('buildVitalsCtes', () => {
  const sps = buildVitalsCtes(17001);
  it('applies the exact-percentile fix in place of the array columns', () => {
    expect(sps).toContain('AS class_teacher_exp_50pctile');
    expect(sps).toContain('AS class_teacher_exp_80pctile');
    expect(sps).toContain('AS principal_exp_50pctile');
    expect(sps).not.toContain('AS class_teacher_exp_years'); // column replaced
    expect(sps).not.toContain('AS principal_exp_years');
    expect(sps).toContain('CEIL(50 / 100.0 * ARRAY_LENGTH(');
  });
  it('parameterizes project + ccddd and drops the trailing ORDER BY', () => {
    expect(sps).toContain('sps-btn-data.ospi.rc_enrollment');
    expect(sps).not.toContain('{project}');
    expect(sps).not.toMatch(/ORDER BY\s+school_code,\s*class_of/);
    expect(buildVitalsCtes(27010)).toContain('ccddd = 27010');
  });
  it('computes spend groups with COALESCE and dummies in the vitals branch', () => {
    expect(sps).toContain('COALESCE(vo.spend_gen_ed_per_pupil, 0)');
    expect(sps).toContain("IF(vo.type = 'K-8', 1, 0) AS K_8");
    expect(sps).toContain('AS OtherSchool');
  });
  it('includes region/ms dummies only for SPS', () => {
    expect(sps).toContain('AS r_Central');
    expect(sps).toContain('IF(vo.ms_assignment_code = 5485, 1, 0) AS m_Meany');
    const other = buildVitalsCtes(27010);
    expect(other).not.toContain('AS r_Central');
    expect(other).not.toContain('AS m_Meany');
    expect(other).toContain('AS OtherSchool'); // type dummies stay
  });
});

describe('buildAssessmentFilteredSql', () => {
  it('drops null logical keys and all-four-null value rows', () => {
    const sql = buildAssessmentFilteredSql(17001);
    expect(sql).toContain('test_administration IS NOT NULL');
    expect(sql).toContain('pct_alternative IS NULL');   // participates in filter
    expect(sql).toContain('pct_met_standard_numeric_nodat IS NULL');
  });
});

describe('assembleBigsheetSql', () => {
  const combos = {
    assessment: [['EOC', 'Biology', 'All Students']] as Combo[],
    mapHc: [['Mathematics', 1, 'Spring']] as Combo[],
    mapNonhc: [['Mathematics', 1, 'Fall']] as Combo[],
    sqss: [['attendance', 'All Students']] as Combo[],
  };
  it('lifts the five key columns to the front in the golden order', () => {
    const sql = assembleBigsheetSql(17001, combos);
    expect(sql).toContain('m.school_name, m.type, m.is_regular');
    expect(sql).toContain('m.* EXCEPT(class_of, school_name, type, is_regular, school_code)');
    expect(sql).toContain('ORDER BY class_of, school_code');
    expect(sql).toContain('-- BIGSHEET_SQL_VERSION:');
  });
  it('includes SPS-only families for 17001 and omits them otherwise', () => {
    const sps = assembleBigsheetSql(17001, combos);
    expect(sps).toContain('map_hc_wide AS');
    expect(sps).toContain('sqss_wide AS');
    expect(sps).toContain('bldg_staff_net_churn');
    expect(sps).toContain('ms_assignment_code_normalized');
    const other = assembleBigsheetSql(27010, { assessment: combos.assessment });
    expect(other).not.toContain('map_hc_wide AS');
    expect(other).not.toContain('sqss_wide AS');
    expect(other).not.toContain('bldg_staff_net_churn');
    expect(other).not.toContain('ms_assignment_code_normalized');
    expect(other).toContain('assessment_wide AS'); // district-general
  });
  it('uses IEEE_DIVIDE for the per-pupil / normalized divisions', () => {
    const sql = assembleBigsheetSql(17001, combos);
    expect(sql).toContain('IEEE_DIVIDE(m.class_teacher_fte, m.all_students)');
    expect(sql).toContain('IEEE_DIVIDE(m.all_students, MAX(m.all_students) OVER ())');
  });
  it('uses null-safe join conditions', () => {
    const sql = assembleBigsheetSql(17001, combos);
    expect(sql).toContain('vb.school_code IS NULL AND a.school_code IS NULL');
  });
});

describe('comboQueryAssessment', () => {
  it('orders combos by first appearance (ROW_NUMBER over the source order)', () => {
    const q = comboQueryAssessment(17001);
    expect(q).toContain('ROW_NUMBER() OVER (ORDER BY class_of, school_code');
    expect(q).toContain('ORDER BY MIN(rn)');
  });
});
