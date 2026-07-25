// Static (non-pivot) SQL fragments for the bigsheet endpoint: the vitals CTE
// fragment (sql/vitals.sql) and the assessment source (sql/assessment.sql),
// parameterized by {project}/{ccddd} placeholder substitution. All naming of
// output columns happens in columns.ts / assemble.ts.

import { RAW_VITALS_SQL } from './sql/vitalsSql';
import { RAW_ASSESSMENT_SQL } from './sql/assessmentSql';

export const SEATTLE_CCDDD = 17001;
export const PROJECT = 'sps-btn-data';
export const INPUTS = `${PROJECT}.bigsheet_inputs`;

function substitute(sql: string, ccddd: number): string {
  return sql
      .replace(/\{project\}/g, PROJECT)
      .replace(/\{ccddd\}/g, String(ccddd));
}

/** The vitals CTE fragment ending in the vitals_org CTE (no leading WITH, no
 * trailing comma — assemble.ts owns the WITH clause). */
export function buildVitalsCtes(ccddd: number): string {
  return substitute(RAW_VITALS_SQL, ccddd).trim();
}

/** assessment.sql, parameterized. */
export function buildAssessmentRawSql(ccddd: number): string {
  return substitute(RAW_ASSESSMENT_SQL, ccddd).trim();
}

/**
 * assessment.sql plus the row filters the mart applied: drop rows with an
 * incomplete logical key; drop rows where all four value columns are NULL
 * (pct_alternative participates in this filter but is NOT pivoted).
 */
export function buildAssessmentFilteredSql(ccddd: number): string {
  return `SELECT * FROM (\n${buildAssessmentRawSql(ccddd)}\n)\n` +
    `WHERE class_of IS NOT NULL AND school_code IS NOT NULL\n` +
    `  AND test_administration IS NOT NULL\n` +
    `  AND test_subject IS NOT NULL AND student_group IS NOT NULL\n` +
    `  AND NOT (pct_noscore IS NULL AND pct_alternative IS NULL\n` +
    `           AND pct_met_standard_numeric IS NULL\n` +
    `           AND pct_met_standard_numeric_nodat IS NULL)`;
}
