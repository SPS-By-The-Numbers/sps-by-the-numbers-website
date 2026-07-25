// Pivot generators for the bigsheet endpoint. BigQuery PIVOT needs static
// column lists, so the endpoint runs small combo-enumeration queries first,
// then this module turns the returned combos into conditional-aggregation
// SELECT lists. Combo order reproduces pandas' pivot column order = full-tuple
// first appearance in the source row order (see PIVOT_ORDERING.md).

import { sanitizeUnique } from './names';
import {
  INPUTS, buildAssessmentFilteredSql, sqssWithMeasureClean,
} from './staticSql';

/** A pivot combo = the ordered list of level values (aligned to spec.levelCols). */
export type Combo = Array<string | number>;

export interface PivotValue { label: string; col: string; }

export interface PivotSpec {
  key: string;
  prefix: string;          // 'hc_' | 'nonhc_' | ''
  levelCols: string[];     // source columns for the combo levels
  values: PivotValue[];    // pandas values=[...] (order = value-major output)
}

export const ASSESSMENT_SPEC: PivotSpec = {
  key: 'assessment',
  prefix: '',
  levelCols: ['test_administration', 'test_subject', 'student_group'],
  values: [
    { label: 'pct_noscore', col: 'pct_noscore' },
    { label: 'pct_met_standard_numeric', col: 'pct_met_standard_numeric' },
    { label: 'pct_met_standard_numeric_nodat', col: 'pct_met_standard_numeric_nodat' },
  ],
};

export const MAP_HC_SPEC: PivotSpec = {
  key: 'map_hc',
  prefix: 'hc_',
  levelCols: ['academic_subject', 'grade', 'season'],
  values: [
    { label: 'Average of RITScore', col: 'avg_rit_score' },
    { label: 'StdDev of RITScore', col: 'stddev_rit_score' },
  ],
};

export const MAP_NONHC_SPEC: PivotSpec = {
  key: 'map_nonhc',
  prefix: 'nonhc_',
  levelCols: ['academic_subject', 'grade', 'season'],
  values: [
    { label: 'Average RIT Score', col: 'avg_rit_score' },
    { label: 'Std Deviation', col: 'stddev' },
    { label: 'Number of Students', col: 'number_of_students' },
  ],
};

export const SQSS_SPEC: PivotSpec = {
  key: 'sqss',
  prefix: '',
  levelCols: ['measure_clean', 'student_group'],
  values: [
    { label: 'percent', col: 'percent' },
    { label: 'numerator', col: 'numerator' },
    { label: 'denominator', col: 'denominator' },
  ],
};

/** SQL literal for a level value: numbers bare, strings single-quoted+escaped. */
function lit(v: string | number): string {
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

// ---- Combo-enumeration queries (each with a deterministic ORDER BY) ----------

export function comboQueryAssessment(ccddd: number): string {
  return `WITH filtered AS (\n${buildAssessmentFilteredSql(ccddd)}\n),\n` +
    `ordered AS (\n` +
    `  SELECT test_administration, test_subject, student_group,\n` +
    `    ROW_NUMBER() OVER (ORDER BY class_of, school_code,\n` +
    `      test_administration, test_subject, student_group) AS rn\n` +
    `  FROM filtered\n)\n` +
    `SELECT test_administration, test_subject, student_group\n` +
    `FROM ordered\nGROUP BY 1, 2, 3\nORDER BY MIN(rn)`;
}

export function comboQueryMap(table: 'map_hc' | 'map_nonhc'): string {
  return `SELECT academic_subject, grade, season\n` +
    `FROM ${INPUTS}.${table}\nGROUP BY 1, 2, 3\nORDER BY MIN(_csv_row)`;
}

export function comboQuerySqss(): string {
  return `SELECT measure_clean, student_group\nFROM (\n${sqssWithMeasureClean()}\n)\n` +
    `WHERE measure_clean IS NOT NULL\nGROUP BY 1, 2\nORDER BY MIN(_csv_row)`;
}

/**
 * The conditional-aggregation SELECT list for a pivot, value-major then
 * combo-order (reproducing pandas' `values=[...]` outer level). Each output
 * column is MAX(IF(<level match>, <value col>, NULL)) since the (index,
 * columns) grain is unique. Names are made unique via sanitizeUnique (see the
 * "Non Migrant"/"Non-Migrant" note there); disambiguations are logged.
 */
export function buildPivotSelectList(spec: PivotSpec, combos: Combo[]): string {
  const conds: string[] = [];
  const valCols: string[] = [];
  const rawNames: string[] = [];
  for (const value of spec.values) {
    for (const combo of combos) {
      conds.push(spec.levelCols.map((c, i) => `${c} = ${lit(combo[i])}`).join(' AND '));
      valCols.push(value.col);
      rawNames.push(spec.prefix +
        [...combo, value.label].map((p) => String(p)).filter((p) => p !== '').join('_'));
    }
  }
  const { names, collisions } = sanitizeUnique(rawNames);
  if (collisions.length) {
    console.warn(`bigsheet pivot ${spec.key}: disambiguated ${collisions.length} ` +
      `name collision(s), e.g. ${collisions.slice(0, 3).map((c) => c.join('->')).join(', ')}`);
  }
  return conds.map((cond, i) =>
    `MAX(IF(${cond}, ${valCols[i]}, NULL)) AS \`${names[i]}\``).join(',\n    ');
}
