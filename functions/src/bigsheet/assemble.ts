// Assembles the full bigsheet SQL: the vitals CTE fragment + rename layer +
// join/pivot CTEs + an explicit, ordered final SELECT. Column names, order
// and documentation all come from columns.ts and the pivot generators, so
// the SQL, the data dictionary and the tests cannot drift apart.
//
// CTE chain: vitals fragment (upstream names) -> vitals_named (renames +
// computed vitals features) -> [SPS-only: map/bex/bldg/income/churn/sqss
// CTEs] -> vitals_branch (LEFT JOINs) -> merged (FULL OUTER assessment +
// post-join derived) -> merged_norm (windowed features over the pre-sqss
// frame) -> final SELECT (source-grouped column order; FULL OUTER sqss).
//
// Output rows: one per (class_of, school_code), including district-total
// rows (NULL school_code), plus assessment-/sqss-only rows from the outer
// joins. Output columns group by data source (see columns.ts) because the
// sources refresh on independent cadences.

import { buildVitalsCtes, buildAssessmentFilteredSql, SEATTLE_CCDDD, INPUTS } from './staticSql';
import { assertUniqueNames, SQSS_MEASURES } from './names';
import {
  scalarColumns, BEX_COLUMNS, BLDG_COLUMNS, INCOME_COLUMNS, CHURN_COLUMNS,
  SourceKey,
} from './columns';
import {
  Combo, PivotColumn, renderPivotSelectList,
  assessmentColumns, mapColumns, sqssColumns,
  MAP_HC_VALUES, MAP_NONHC_VALUES,
} from './pivots';

// Bump to force cache invalidation on a pure logic fix (combo changes already
// invalidate via the enumerated pivot columns embedded in the SQL text).
export const BIGSHEET_SQL_VERSION = '2026-07-25.2';

export interface BigsheetCombos {
  assessment: Combo[];
  mapHc?: Combo[];
  mapNonhc?: Combo[];
  sqss?: Combo[];
}

export interface OutputColumn {
  name: string;
  source: SourceKey;
  doc: string;
}

export interface BigsheetPlan {
  sql: string;
  columns: OutputColumn[];
}

/** null-safe equality (district-total rows have NULL school_code; a plain `=`
 * would drop them from every join). */
function nse(a: string, b: string): string {
  return `(${a} = ${b} OR (${a} IS NULL AND ${b} IS NULL))`;
}

export function buildBigsheetPlan(
    ccddd: number, combos: BigsheetCombos): BigsheetPlan {
  const isSps = ccddd === SEATTLE_CCDDD;
  const scalars = scalarColumns(isSps);
  const asmtCols = assessmentColumns(combos.assessment);
  const mapHcCols = isSps ? mapColumns('map_hc', MAP_HC_VALUES, combos.mapHc || []) : [];
  const mapNonhcCols = isSps ? mapColumns('map_nonhc', MAP_NONHC_VALUES, combos.mapNonhc || []) : [];
  const sqssCols = isSps ? sqssColumns(combos.sqss || []) : [];

  const ctes: string[] = [buildVitalsCtes(ccddd)];

  // ---- vitals_named: rename layer + features computed from vitals_org ------
  const vitalsSelect = scalars
      .filter((c) => c.from || c.vitalsExpr)
      .map((c) => c.from ? `vo.${c.from} AS ${c.name}` : `${c.vitalsExpr} AS ${c.name}`);
  ctes.push(`vitals_named AS (\n  SELECT\n    ${vitalsSelect.join(',\n    ')}\n` +
    `  FROM vitals_org vo\n)`);

  // ---- SPS-only join/pivot CTEs --------------------------------------------
  if (isSps) {
    ctes.push(`map_hc_wide AS (\n  SELECT school_code,\n    ` +
      renderPivotSelectList(mapHcCols) +
      `\n  FROM ${INPUTS}.map_hc\n  GROUP BY school_code\n)`);
    ctes.push(`map_nonhc_wide AS (\n  SELECT school_code,\n    ` +
      renderPivotSelectList(mapNonhcCols) +
      `\n  FROM ${INPUTS}.map_nonhc\n  GROUP BY school_code\n)`);
    ctes.push(`bex_named AS (\n  SELECT school_code,\n    ` +
      BEX_COLUMNS.map((c) => `\`${c.from}\` AS ${c.name}`).join(',\n    ') +
      `\n  FROM ${INPUTS}.bex\n)`);
    ctes.push(`bldg_named AS (\n  SELECT school_code,\n    ` +
      BLDG_COLUMNS.map((c) => `\`${c.from}\` AS ${c.name}`).join(',\n    ') +
      `\n  FROM ${INPUTS}.utilization_condition\n)`);
    ctes.push(`income_named AS (\n  SELECT school_code,\n    ` +
      INCOME_COLUMNS.map((c) => `\`${c.from}\` AS ${c.name}`).join(',\n    ') +
      `\n  FROM ${INPUTS}.income_by_school\n)`);
    ctes.push(`churn AS (\n  SELECT class_of, school_code,\n    ` +
      CHURN_COLUMNS.map((c) => `${c.expr} AS ${c.name}`).join(',\n    ') +
      `\n  FROM ${INPUTS}.building_transitions\n  GROUP BY class_of, school_code\n)`);
    const measures = [...SQSS_MEASURES.keys()]
        .map((m) => `'${m.replace(/'/g, "''")}'`).join(', ');
    ctes.push(`sqss_wide AS (\n  SELECT class_of, school_code,\n    ` +
      renderPivotSelectList(sqssCols) +
      `\n  FROM ${INPUTS}.sqss\n  WHERE measure IN (${measures})\n` +
      `  GROUP BY class_of, school_code\n)`);
  }

  // ---- assessment (district-general) ---------------------------------------
  ctes.push(`assessment_wide AS (\n  SELECT class_of, school_code,\n    ` +
    renderPivotSelectList(asmtCols) +
    `\n  FROM (\n${buildAssessmentFilteredSql(ccddd)}\n  )\n` +
    `  GROUP BY class_of, school_code\n)`);

  // ---- vitals_branch: vitals_named + SPS join families ---------------------
  const branchCols: string[] = ['va.*'];
  const branchJoins: string[] = [];
  if (isSps) {
    branchCols.push('mh.* EXCEPT(school_code)', 'mn.* EXCEPT(school_code)',
      'bex.* EXCEPT(school_code)', 'bldg.* EXCEPT(school_code)',
      'income.* EXCEPT(school_code)', 'ch.* EXCEPT(class_of, school_code)');
    branchJoins.push(
      `  LEFT JOIN map_hc_wide mh ON ${nse('va.school_code', 'mh.school_code')}`,
      `  LEFT JOIN map_nonhc_wide mn ON ${nse('va.school_code', 'mn.school_code')}`,
      `  LEFT JOIN bex_named bex ON ${nse('va.school_code', 'bex.school_code')}`,
      `  LEFT JOIN bldg_named bldg ON ${nse('va.school_code', 'bldg.school_code')}`,
      `  LEFT JOIN income_named income ON ${nse('va.school_code', 'income.school_code')}`,
      `  LEFT JOIN churn ch ON va.class_of = ch.class_of AND ${nse('va.school_code', 'ch.school_code')}`);
  }
  ctes.push(`vitals_branch AS (\n  SELECT\n    ${branchCols.join(',\n    ')}\n` +
    `  FROM vitals_named va\n${branchJoins.join('\n')}${branchJoins.length ? '\n' : ''})`);

  // ---- merged: FULL OUTER assessment + post-join derived -------------------
  const mergedComputed = scalars.filter((c) => c.mergedExpr)
      .map((c) => `${c.mergedExpr} AS ${c.name}`);
  ctes.push(`merged AS (\n  SELECT\n` +
    `    COALESCE(vb.class_of, a.class_of) AS class_of,\n` +
    `    COALESCE(vb.school_code, a.school_code) AS school_code,\n` +
    `    vb.* EXCEPT(class_of, school_code),\n` +
    `    a.* EXCEPT(class_of, school_code),\n` +
    `    ${mergedComputed.join(',\n    ')}\n` +
    `  FROM vitals_branch vb\n` +
    `  FULL OUTER JOIN assessment_wide a\n` +
    `    ON vb.class_of = a.class_of AND ${nse('vb.school_code', 'a.school_code')}\n)`);

  // ---- merged_norm: windowed features over the pre-sqss frame --------------
  // (sqss joins after, so sqss-only rows keep NULL for these — the window max
  // is taken over the frame that actually has the underlying values.)
  const normComputed = scalars.filter((c) => c.normExpr)
      .map((c) => `${c.normExpr} AS ${c.name}`);
  ctes.push(`merged_norm AS (\n  SELECT m.*,\n    ${normComputed.join(',\n    ')}\n` +
    `  FROM merged m\n)`);

  // ---- final SELECT: source-grouped column order ---------------------------
  const columns: OutputColumn[] = [
    ...scalars.map((c) => ({ name: c.name, source: c.source, doc: c.doc })),
    ...(isSps ? CHURN_COLUMNS.map((c) => ({ name: c.name, source: 'churn' as SourceKey, doc: c.doc })) : []),
    ...mapHcCols.map((c: PivotColumn) => ({ name: c.name, source: 'map_hc' as SourceKey, doc: c.doc })),
    ...mapNonhcCols.map((c: PivotColumn) => ({ name: c.name, source: 'map_nonhc' as SourceKey, doc: c.doc })),
    ...(isSps ? BEX_COLUMNS.map((c) => ({ name: c.name, source: 'bex' as SourceKey, doc: c.doc })) : []),
    ...(isSps ? BLDG_COLUMNS.map((c) => ({ name: c.name, source: 'bldg' as SourceKey, doc: c.doc })) : []),
    ...(isSps ? INCOME_COLUMNS.map((c) => ({ name: c.name, source: 'income' as SourceKey, doc: c.doc })) : []),
    ...asmtCols.map((c) => ({ name: c.name, source: 'asmt' as SourceKey, doc: c.doc })),
    ...sqssCols.map((c) => ({ name: c.name, source: 'sqss' as SourceKey, doc: c.doc })),
  ];
  assertUniqueNames(columns.map((c) => c.name));

  const sqssNames = new Set(sqssCols.map((c) => c.name));
  const selectItems = columns.map((c) => {
    if (c.name === 'class_of' && isSps) return 'COALESCE(m.class_of, s.class_of) AS class_of';
    if (c.name === 'school_code' && isSps) return 'COALESCE(m.school_code, s.school_code) AS school_code';
    if (sqssNames.has(c.name)) return `s.${c.name}`;
    return `m.${c.name}`;
  });
  const finalSelect = `SELECT\n  ${selectItems.join(',\n  ')}\n` +
    `FROM merged_norm m\n` +
    (isSps ?
      `FULL OUTER JOIN sqss_wide s\n` +
      `  ON ${nse('m.class_of', 's.class_of')} AND ${nse('m.school_code', 's.school_code')}\n` : '') +
    `ORDER BY class_of, school_code`;

  const sql = `-- BIGSHEET_SQL_VERSION: ${BIGSHEET_SQL_VERSION}\n` +
    `WITH\n\n${ctes.join(',\n\n')}\n\n${finalSelect}\n`;
  return { sql, columns };
}

export function assembleBigsheetSql(
    ccddd: number, combos: BigsheetCombos): string {
  return buildBigsheetPlan(ccddd, combos).sql;
}
