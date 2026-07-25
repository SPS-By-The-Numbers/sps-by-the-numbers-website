// Unit tests for the bigsheet SQL generator (pure string building, no BQ).

import {
  slugify, studentGroupSlug, assertUniqueNames, sanitizeName,
} from './names';
import {
  assessmentColumns, mapColumns, sqssColumns, renderPivotSelectList,
  comboQueryAssessment, comboQuerySqss,
  MAP_HC_VALUES, MAP_NONHC_VALUES, Combo,
} from './pivots';
import { scalarColumns, BEX_COLUMNS } from './columns';
import { buildVitalsCtes, buildAssessmentFilteredSql } from './staticSql';
import { assembleBigsheetSql, buildBigsheetPlan, BigsheetCombos } from './assemble';
import { buildDictionary } from './dictionary';

const COMBOS: BigsheetCombos = {
  assessment: [
    ['SBAC', 'ELA', 'All Students'],
    ['SBAC', 'ELA', 'Low-Income'],
    ['EOC', 'Biology', 'Female'],
    ['ELPA', 'ELPA', 'All Students'],
  ] as Combo[],
  mapHc: [['Mathematics', 1, 'Spring'], ['Reading', 1, 'Fall']] as Combo[],
  mapNonhc: [['Mathematics', 2, 'Fall']] as Combo[],
  sqss: [
    ['Regular Attendance', 'All Students'],
    ['Regular Attendance', 'Non Migrant'],
    ['Regular Attendance', 'Non-Migrant'],
    ['Dual Credit', 'Low Income'],
    ['Dual Credit', 'Low-Income'],
    ['Not A Real Measure', 'All Students'],
  ] as Combo[],
};

describe('slugify / studentGroupSlug', () => {
  it('lowercases and collapses non-alphanumerics', () => {
    expect(slugify('Non-Migrant')).toBe('non_migrant');
    expect(slugify('Non Migrant')).toBe('non_migrant');
    expect(slugify('Gender X')).toBe('gender_x');
    expect(slugify('K-8')).toBe('k_8');
  });
  it('maps canonical student groups, falls back to slugify', () => {
    expect(studentGroupSlug('All Students')).toBe('all');
    expect(studentGroupSlug('Black/ African American')).toBe('black_african_american');
    expect(studentGroupSlug('Black/African American')).toBe('black_african_american');
    expect(studentGroupSlug('Hispanic/ Latino of any race(s)'))
        .toBe('hispanic_latino_of_any_race');
    expect(studentGroupSlug('Non-Students with Disabilities'))
        .toBe('students_without_disabilities');
    expect(studentGroupSlug('Students without Disabilities'))
        .toBe('students_without_disabilities');
    expect(studentGroupSlug('Some Future Group')).toBe('some_future_group');
  });
});

describe('sanitizeName (external-table header contract)', () => {
  it('matches the Python copy used to create the bigsheet_inputs tables', () => {
    expect(sanitizeName('2012 Composite Score')).toBe('_2012_Composite_Score');
    expect(sanitizeName('Min-Max Normalization (1-5 Scale)2'))
        .toBe('Min_Max_Normalization_1_5_Scale_2');
    expect(sanitizeName('Health, Safety, Security & Building Condition - Raw Score'))
        .toBe('Health_Safety_Security_Building_Condition_Raw_Score');
  });
  it('BEX mapping keys are valid sanitized headers', () => {
    for (const c of BEX_COLUMNS) {
      expect(c.from).toBe(sanitizeName(c.from));
    }
  });
});

describe('assertUniqueNames', () => {
  it('throws on duplicates', () => {
    expect(() => assertUniqueNames(['a', 'b', 'a'])).toThrow(/duplicate/);
    expect(() => assertUniqueNames(['a', 'b'])).not.toThrow();
  });
});

describe('assessmentColumns', () => {
  const cols = assessmentColumns(COMBOS.assessment);
  it('names asmt_<admin>_<subject>_<group>_<metric>, collapsing ELPA/ELPA', () => {
    const names = cols.map((c) => c.name);
    expect(names).toContain('asmt_sbac_ela_all_pct_met');
    expect(names).toContain('asmt_sbac_ela_low_income_pct_met_exact');
    expect(names).toContain('asmt_eoc_biology_female_pct_noscore');
    expect(names).toContain('asmt_elpa_all_pct_met');
    expect(names).not.toContain('asmt_elpa_elpa_all_pct_met');
  });
  it('orders by admin, subject, group with metrics adjacent', () => {
    const names = cols.map((c) => c.name);
    // sbac before eoc before elpa (canonical admin order)
    expect(names.indexOf('asmt_sbac_ela_all_pct_met'))
        .toBeLessThan(names.indexOf('asmt_eoc_biology_female_pct_met'));
    expect(names.indexOf('asmt_eoc_biology_female_pct_met'))
        .toBeLessThan(names.indexOf('asmt_elpa_all_pct_met'));
    // metrics for one combo are adjacent (combo-major, metric-minor)
    const i = names.indexOf('asmt_sbac_ela_all_pct_met');
    expect(names[i + 1]).toBe('asmt_sbac_ela_all_pct_met_exact');
    expect(names[i + 2]).toBe('asmt_sbac_ela_all_pct_noscore');
  });
});

describe('mapColumns', () => {
  it('names map_<cohort>_<subject>_g<grade>_<season>_<metric>', () => {
    const names = mapColumns('map_hc', MAP_HC_VALUES, COMBOS.mapHc!)
        .map((c) => c.name);
    expect(names).toEqual([
      'map_hc_math_g1_spring_rit_avg', 'map_hc_math_g1_spring_rit_sd',
      'map_hc_reading_g1_fall_rit_avg', 'map_hc_reading_g1_fall_rit_sd',
    ]);
    const nonhc = mapColumns('map_nonhc', MAP_NONHC_VALUES, COMBOS.mapNonhc!)
        .map((c) => c.name);
    expect(nonhc).toEqual([
      'map_nonhc_math_g2_fall_rit_avg', 'map_nonhc_math_g2_fall_rit_sd',
      'map_nonhc_math_g2_fall_n_students',
    ]);
  });
});

describe('sqssColumns', () => {
  const cols = sqssColumns(COMBOS.sqss!);
  it('merges spelling variants into one column matching every spelling', () => {
    const nonMigrant = cols.find((c) => c.name === 'sqss_attendance_non_migrant_pct');
    expect(nonMigrant).toBeDefined();
    expect(nonMigrant!.condition).toContain("student_group = 'Non Migrant'");
    expect(nonMigrant!.condition).toContain("student_group = 'Non-Migrant'");
    const lowIncome = cols.find((c) => c.name === 'sqss_dual_credit_low_income_pct');
    expect(lowIncome!.condition).toContain("student_group = 'Low Income'");
    expect(lowIncome!.condition).toContain("student_group = 'Low-Income'");
    // no _2-style disambiguated duplicates
    expect(cols.filter((c) => c.name.includes('non_migrant')).map((c) => c.name))
        .toEqual(['sqss_attendance_non_migrant_pct', 'sqss_attendance_non_migrant_num',
                  'sqss_attendance_non_migrant_den']);
  });
  it('drops measures outside the whitelist', () => {
    expect(cols.some((c) => c.name.includes('not_a_real_measure'))).toBe(false);
  });
});

describe('renderPivotSelectList', () => {
  it('emits MAX(IF(...)) cells with escaped literals and bare numbers', () => {
    const sql = renderPivotSelectList(
        mapColumns('map_hc', MAP_HC_VALUES, [['Mathematics', 1, 'Spring']]));
    expect(sql).toContain(
      "MAX(IF(academic_subject = 'Mathematics' AND grade = 1 AND " +
      "season = 'Spring', avg_rit_score, NULL)) AS map_hc_math_g1_spring_rit_avg");
  });
});

describe('buildVitalsCtes', () => {
  const sps = buildVitalsCtes(17001);
  it('parameterizes project + ccddd and ends with the vitals_org CTE', () => {
    expect(sps).toContain('sps-btn-data.ospi.rc_enrollment');
    expect(sps).not.toContain('{project}');
    expect(sps).not.toContain('{ccddd}');
    expect(sps).toMatch(/vitals_org AS \(/);
    expect(sps).not.toMatch(/ORDER BY\s+school_code,\s*class_of\s*$/);
    expect(buildVitalsCtes(27010)).toContain('ccddd = 27010');
  });
  it('computes exact order-statistic experience percentiles', () => {
    expect(sps).toContain('AS class_teacher_exp_p50');
    expect(sps).toContain('AS principal_exp_p80');
    expect(sps).toContain('CEIL(50 / 100.0 * ARRAY_LENGTH(');
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

describe('scalarColumns', () => {
  it('gates SPS-only columns', () => {
    const sps = scalarColumns(true).map((c) => c.name);
    const other = scalarColumns(false).map((c) => c.name);
    expect(sps).toContain('region_central');
    expect(sps).toContain('ms_meany');
    expect(sps).toContain('ms_assignment_code_normalized');
    expect(other).not.toContain('region_central');
    expect(other).not.toContain('ms_meany');
    expect(other).not.toContain('ms_assignment_code_normalized');
    expect(other).toContain('type_k8'); // type dummies are district-general
  });
  it('has unique names with exactly one definition kind each', () => {
    const cols = scalarColumns(true);
    assertUniqueNames(cols.map((c) => c.name));
    for (const c of cols) {
      const kinds = [c.from, c.vitalsExpr, c.mergedExpr, c.normExpr]
          .filter((k) => k !== undefined);
      expect(kinds.length).toBe(1);
    }
  });
});

describe('buildBigsheetPlan / assembleBigsheetSql', () => {
  const plan = buildBigsheetPlan(17001, COMBOS);
  it('orders output by source family', () => {
    const names = plan.columns.map((c) => c.name);
    expect(names[0]).toBe('class_of');
    expect(names[1]).toBe('school_code');
    expect(names[2]).toBe('school_name');
    const firstOf = (prefix: string) =>
      names.findIndex((n) => n.startsWith(prefix));
    // enroll < spend < staff < churn < map < bex < asmt < sqss
    expect(firstOf('enroll_')).toBeLessThan(firstOf('spend_'));
    expect(firstOf('spend_')).toBeLessThan(firstOf('staff_'));
    expect(firstOf('staff_')).toBeLessThan(firstOf('churn_'));
    expect(firstOf('churn_')).toBeLessThan(firstOf('map_hc_'));
    expect(firstOf('map_hc_')).toBeLessThan(firstOf('bex_'));
    expect(firstOf('bex_')).toBeLessThan(firstOf('asmt_'));
    expect(firstOf('asmt_')).toBeLessThan(firstOf('sqss_'));
  });
  it('emits every planned column exactly once in the final SELECT', () => {
    const finalSelect = plan.sql.slice(plan.sql.lastIndexOf('SELECT'));
    for (const c of plan.columns.slice(0, 5)) {
      expect(finalSelect).toContain(c.name);
    }
    assertUniqueNames(plan.columns.map((c) => c.name));
  });
  it('includes SPS-only families for 17001 and omits them otherwise', () => {
    const sps = plan.sql;
    expect(sps).toContain('map_hc_wide AS');
    expect(sps).toContain('sqss_wide AS');
    expect(sps).toContain('churn_net');
    expect(sps).toContain('bex_composite_score_2024');
    const other = buildBigsheetPlan(27010, { assessment: COMBOS.assessment });
    expect(other.sql).not.toContain('map_hc_wide AS');
    expect(other.sql).not.toContain('sqss_wide AS');
    expect(other.sql).not.toContain('churn_net');
    expect(other.sql).not.toContain('bex_composite_score_2024');
    expect(other.sql).toContain('assessment_wide AS'); // district-general
    expect(other.columns.every((c) =>
      !['churn', 'map_hc', 'map_nonhc', 'bex', 'bldg', 'income', 'sqss']
          .includes(c.source))).toBe(true);
  });
  it('uses SAFE_DIVIDE (NULL, not inf, on zero denominators)', () => {
    expect(plan.sql).toContain('SAFE_DIVIDE(m.staff_class_teacher_fte, m.enroll_total)');
    expect(plan.sql).toContain('SAFE_DIVIDE(m.enroll_total, MAX(m.enroll_total) OVER ())');
    expect(plan.sql).not.toContain('IEEE_DIVIDE');
  });
  it('uses null-safe join conditions and versions the SQL', () => {
    expect(plan.sql).toContain('vb.school_code IS NULL AND a.school_code IS NULL');
    expect(plan.sql).toContain('-- BIGSHEET_SQL_VERSION:');
    expect(assembleBigsheetSql(17001, COMBOS)).toBe(plan.sql);
  });
});

describe('buildDictionary', () => {
  it('is 1:1 with the generated output columns', () => {
    const plan = buildBigsheetPlan(17001, COMBOS);
    const dict = buildDictionary(17001, COMBOS);
    expect(dict.map((e) => e.name)).toEqual(plan.columns.map((c) => c.name));
    for (const e of dict) {
      expect(e.doc.length).toBeGreaterThan(0);
      expect(e.sourceLabel.length).toBeGreaterThan(0);
    }
  });
});

describe('combo queries', () => {
  it('are plain DISTINCT enumerations (no source-order machinery)', () => {
    const q = comboQueryAssessment(17001);
    expect(q).toContain('SELECT DISTINCT');
    expect(q).not.toContain('ROW_NUMBER');
    expect(q).not.toContain('_csv_row');
    expect(comboQuerySqss()).not.toContain('_csv_row');
  });
});
