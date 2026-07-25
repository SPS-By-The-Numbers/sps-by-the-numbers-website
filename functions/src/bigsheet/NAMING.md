# Bigsheet column naming & structure

Design note for the 2026-07 rename (the former "Phase 5"). The legacy sheet
carried mechanically-sanitized pandas headers
(`hc_Mathematics_1_Spring_Average_of_RITScore`,
`SBAC_ELA_Non-Low-Income_pct_met_standard_numeric`, raw Excel titles like
`2020 Composite Score? (2021 FMPU)`); this scheme replaces all of them with
programmatic identifiers. The complete legacy→new mapping (generated from the
naming code itself against the last Python-era Seattle header) is in
`COLUMN_MAPPING.csv`. The machine-readable dictionary is generated from the
same column plan the SQL is rendered from (`dictionary.ts`), so it cannot
drift.

## Principles

1. **Every name is `[a-z][a-z0-9_]*`** — valid SQL/AVRO identifiers, no
   quoting ever needed.
2. **The first path segment is the data source.** The sources feeding the
   sheet refresh on independent cadences (report-card releases, F-196 fiscal
   closes, S-275 personnel snapshots, one-off SPS files), so data streams in
   over time in chunks. The prefix tells a consumer which columns arrived
   together and which will change together on the next refresh. Column order
   in the sheet is also grouped source-by-source for the same reason.
3. **One population, one slug, everywhere.** Student groups use the same
   canonical slug in `enroll_*`, `asmt_*` and `sqss_*` columns (matching the
   `rc_enrollment` column names where those exist). Distinct source
   spellings of the same group ("Non Migrant"/"Non-Migrant", "Hispanic/
   Latino…"/"Hispanic/Latino…", "Low Income"/"Low-Income" — 66 legacy
   collision columns) are **merged into one column**; the pivot condition
   matches every spelling. The legacy sheet kept both spellings as separate
   mostly-NULL columns; that was an upstream data-quality wart, not
   information.
4. **Structure is positional and regular**: `family_dimension1_dimension2_…_metric`,
   metrics innermost, so lexicographic prefix matching selects coherent
   slices (`asmt_sbac_ela_*`, `map_hc_math_*`, `spend_*_per_pupil`).
5. **Unknown future values degrade gracefully** — a new test administration
   or student group slugifies generically instead of failing; a genuine name
   collision throws at generation time.

## Family reference

| Prefix | Source (refresh unit) | Pattern |
|---|---|---|
| *(none)* | school identity (report card + SPS `d_school`) | `class_of`, `school_code`, `school_name`, `school_year`, `type`, `is_regular`, `region`, `ms_assignment[_code]`, dummies `type_*`, `region_*`, `ms_<school>`, derived `at_or_after_2021`, `*_normalized` |
| `enroll_` | OSPI report-card enrollment | `enroll_total`, `enroll_<group>`, `enroll_pct_<group>`, `enroll_log_total`, `enroll_total_normalized` |
| `spend_` | SAFS F-196 expenditures | `spend_<category>_{total,comp,noncomp,per_pupil}`; all-category `spend_{total,comp,noncomp,per_pupil}`; groups `spend_grp_*_per_pupil` |
| `staff_` | SAFS S-275 personnel | `staff_<role>_{salary,fte,est_compensation,est_final_salary}`; teacher/principal stats `staff_<role>_{exp_p50,exp_p80,exp_avg,count[,_bachelors,_masters,_doctors]}`; derived `*_per_pupil`, `pct_ge/gt_bachelors` |
| `churn_` | staff building transitions (S-275 derivative CSV) | `churn_{transfer_in,transfer_out,hire,depart,added,lost,net}` |
| `map_hc_`, `map_nonhc_` | SPS MAP extracts | `map_<cohort>_<subject>_g<grade>_<season>_{rit_avg,rit_sd,n_students}` |
| `bex_` | SPS BEX-VI building scores | `bex_composite_score_<year>`, `bex_bca_score_<year>`, `bex_<dimension>_{raw,scaled}`, … |
| `bldg_` | SPS utilization/condition | `bldg_utilization_pct_2025`, `bldg_condition_*`, `bldg_learning_env_score` |
| `income_` | area income by school zone | `income_es_zone`, `income_area_*` |
| `asmt_` | OSPI report-card assessments | `asmt_<test>_<group>_{pct_met,pct_met_exact,pct_noscore}`; `<test>` = `<admin>_<subject>` collapsed when identical (`elpa`, `widaacc`) |
| `sqss_` | OSPI SQSS measures | `sqss_<measure>_<group>_{pct,num,den}`; measures `attendance`, `dual_credit`, `ninth_grade_on_track` |

Metric renames worth knowing: legacy `pct_met_standard_numeric` →
`pct_met` (bounded markers "<10%"/">90%" converted using the bound);
`pct_met_standard_numeric_nodat` → `pct_met_exact` (bounded markers NULL, so
only exact percentages survive).

## Column order

Blocks in source order: identity → `enroll_` → `spend_` → `staff_` →
`churn_` → `map_hc_` → `map_nonhc_` → `bex_` → `bldg_` → `income_` →
`asmt_` → `sqss_`. Within pivot families the order is canonical-semantic
(test admin → subject → student group → metric; subject → grade → season →
metric), not source-row-appearance. Rows stay ordered by
(`class_of`, `school_code`).

## Dropped columns (vs the legacy sheet)

- the pandas row index (unnamed first CSV column)
- `school`, `school_1` — join-duplicated school-name columns; `school_name`
  is the survivor
- `grade`, `grade_level` — constant `'All Grades'` by construction

## Semantics changed on purpose

- **Spelling-variant merge** (above): merged columns coalesce the variant
  cells via `MAX(IF(...))`; verified against the current sqss.csv that no two
  spellings of one group ever co-occur at the same (year, school, measure)
  grain (0 of 21,228 cells), so the merge is lossless.
- **`SAFE_DIVIDE` everywhere** for derived ratios: division by zero (one
  Seattle row has `enroll_total = 0`) now yields NULL instead of the
  legacy numpy `inf`.
- Everything else is value-identical to the migrated pipeline: exact
  order-statistic experience percentiles, null-safe joins for district-total
  rows, vocational-spend inclusion, verbatim `"n<10"` suppression markers in
  `map_nonhc_*` (STRING columns).

## What got deleted with the golden gate

The Python-fidelity machinery is gone: the golden-diff harness, the
`_csv_row` physical-order columns in the `bigsheet_inputs` external tables
(and their `ROW_NUMBER()`/`MIN(_csv_row)` first-appearance pivot ordering),
the rotate-left pandas name builder, and `sanitizeUnique`'s `_2` collision
suffixes. `scripts/dryrun_check.ts` (zero-cost BigQuery dry run, live combos,
schema-vs-plan 1:1 check) and `scripts/nonsps_smoke.ts` are the remaining
harnesses.
