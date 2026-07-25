# Pivot column ordering rule (empirically determined)

`reference/regress/pivot_order_experiment.py` (data-tools) reproduced the real
pandas pivots and tested three ordering hypotheses. Result for ALL four pivots
(assessment, map_hc, map_nonhc, sqss):

- (A) per-level first-appearance lexicographic: **False**
- (B) sorted-value lexicographic: **False**
- (C) full-tuple first-appearance in source row order: **TRUE**

## Rule

Within the `values=[...]` list order (outer level), the pivoted columns are
ordered by the **first appearance of the full `(columns...)` tuple** as the
source rows are scanned in their pre-pivot order.

## Source row order per pivot

- **assessment**: `assessment.sql` ends with
  `ORDER BY class_of, school_code, test_administration, test_subject, student_group`,
  then `select_assessments` drops rows (order preserved). SQL reproduction:
  `ROW_NUMBER() OVER (ORDER BY class_of, school_code, test_administration,
  test_subject, student_group)` on the filtered rows; enumerate combos
  `GROUP BY (admin,subject,group) ORDER BY MIN(rn)`.
- **map_hc / map_nonhc / sqss**: read straight from CSV with `pd.read_csv`, **no
  sort** → the pivot order is the CSV's *physical row order*. BigQuery external
  tables do NOT preserve/expose CSV row order, so the publish step injects a
  0-based `_csv_row` column into these three CSVs; enumerate combos
  `ORDER BY MIN(_csv_row)`.

Value-level order (top level): the `values` list as written:
- assessment: `pct_noscore, pct_met_standard_numeric, pct_met_standard_numeric_nodat`
- map_hc: `Average of RITScore, StdDev of RITScore`
- map_nonhc: `Average RIT Score, Std Deviation, Number of Students`
- sqss: `percent, numerator, denominator`

## Output column name (legacy, migration policy)

`rotateLeftColumnName((value, lvlA, lvlB, ...))` = `(lvlA, lvlB, ..., value)`,
joined with `_`, then `sanitizeName`. Prefixes: `hc_`, `nonhc_`, none, none.
