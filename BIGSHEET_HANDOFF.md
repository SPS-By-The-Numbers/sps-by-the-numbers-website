# Bigsheet — session handoff

Status as of **2026-07-25** (evening). Companion to
`BIGSHEET_MIGRATION_PLAN.md` (the migration record) and
`functions/src/bigsheet/NAMING.md` (the rename design).

## TL;DR

Two stages, both complete on branches:

1. **Migration** (branch `bigsheet-migration`, PR #28): SQL-only Cloud
   Function port of data-tools `marts/bigsheet.py`, proven value-for-value
   against a frozen Python golden. Merged history — see the plan doc.
2. **Rename + de-goldening** (branch `bigsheet-rename`, this session): the
   golden gate and every piece of "replicate pandas exactly" machinery are
   **deleted**, and all ~1,240 legacy columns were replaced by ~1,170 clean,
   source-prefixed identifiers (66 spelling-variant column pairs merged, 5
   junk columns dropped). The golden CSV no longer constrains anything.

## What the rename changed

- **Names**: every column is now `[a-z][a-z0-9_]*` with a data-source family
  prefix (`enroll_`, `spend_`, `staff_`, `churn_`, `map_hc_`, `map_nonhc_`,
  `bex_`, `bldg_`, `income_`, `asmt_`, `sqss_`; identity block unprefixed).
  Sources refresh on independent cadences, so the prefix = "these columns
  update together". Full design + patterns: `functions/src/bigsheet/NAMING.md`.
  Complete legacy→new mapping: `functions/src/bigsheet/COLUMN_MAPPING.csv`.
- **Structure**: source-grouped column order; pivot columns in canonical
  semantic order (test → subject → group → metric), not pandas
  first-appearance order. Metrics renamed (`pct_met`, `pct_met_exact`).
- **Merges**: dual spellings of one student group ("Non Migrant"/"Non-
  Migrant", 66 legacy collision columns) are one column matching every
  spelling; verified lossless against sqss.csv (no grain co-occurrence).
- **Dropped**: pandas index, duplicate `school`/`school_1`, constant
  `grade`/`grade_level`.
- **SAFE_DIVIDE** replaces IEEE_DIVIDE: ratios at zero enrollment are NULL,
  not inf (deliberate semantic change vs numpy).
- **Single source of truth**: `columns.ts` + the pivot generators produce the
  SQL select list, the column order, AND the data dictionary
  (`dictionary.ts`, `buildDictionary`/`dictionaryCsv`) — a unit test locks
  them 1:1.

## Deleted (do not resurrect)

- `functions/scripts/golden_diff.ts`, `functions/GOLDEN_DIFF_RESULT.md`,
  `functions/src/bigsheet/PIVOT_ORDERING.md`, `T0_4_coverage.md`.
- `sanitizeUnique` `_2`-suffix collision disambiguation; rotate-left legacy
  pivot naming; `ROW_NUMBER()`/`MIN(_csv_row)` first-appearance ordering.
- `_csv_row` injection in data-tools `scripts/bigsheet_inputs_lib.py` (the
  live external tables still carry the column until the owner republishes;
  the queries no longer reference it either way).
- The regex surgery in `staticSql.ts` — `sql/vitals.sql` and
  `sql/assessment.sql` are now owned, parameterized sources ({project},
  {ccddd}); regenerate the embedded `*Sql.ts` with
  `node scripts/gen_sql_modules.js` after editing them.

## The checks (all green as of this session)

From `functions/` with ADC for project `sps-btn-data`:

```
npm run test:unit                      # 25 unit tests (generator + cache)
npm run build                          # tsc + esbuild
npx tsx scripts/dryrun_check.ts 17001  # live combos + BQ dry run (zero cost)
                                       # -> 1170 columns, schema matches plan 1:1
npx tsx scripts/dryrun_check.ts 27010  # -> 711 columns, schema matches plan 1:1
npx tsx scripts/nonsps_smoke.ts 27010  # actually runs the query (costs a query)
```

Root: `npm run build`, `npm run test` (client CSV download consumes AVRO
field order generically — no column-name coupling).

## Remaining (owner)

1. **Deploy** both stages together: `cd functions && npm run deploy`, then
   root `npm run deploy`. `BIGSHEET_SQL_VERSION` was bumped to
   `2026-07-25.2`, so caches regenerate on first hit.
2. **Republish the static inputs** (optional but tidy — drops `_csv_row`
   from the seven external tables): in data-tools,
   `scripts/publish_bigsheet_inputs.sh` then
   `scripts/create_bigsheet_input_tables.sh` (in that order — schemas are
   positional over the CSVs).
3. The Python side is **deleted** (data-tools PR #4): `marts/` holds only a
   pointer README; this repo is the single source of truth for the bigsheet.
   The golden CSV under data-tools `reference/regress/` is untracked human
   reference and constrains nothing.
4. Emulator smoke (`cd functions && npm run test`) still never ran — port
   5001 was busy in the migration session; not retried here.

## Gotchas that still matter

- **Exact order-statistic percentiles** (`ceil(q/100*n)`-th smallest) are a
  semantic choice, not a golden artifact — deterministic, unlike
  APPROX_QUANTILES. Keep.
- **Null-safe joins** on school_code: district-total rows have NULL
  school_code and must not be dropped/split.
- **`map_nonhc` value columns are STRING** — `"n<10"` suppression markers
  are data; kept verbatim.
- **Static-input CSV edits do NOT auto-invalidate the cache** — republish +
  bump `BIGSHEET_SQL_VERSION`. Combo (year/group) changes self-invalidate
  via the SQL text hash.
- Cache salt `2026-05-01` in `cache.ts` is load-bearing for existing finance
  caches; `cache.test.ts` locks it.
- New test administrations / student groups / SQSS measures: unknown values
  slugify generically; SQSS measures outside the whitelist in `names.ts` are
  excluded (extend `SQSS_MEASURES` to admit one). A real name collision
  throws at generation time — add a vocabulary entry, don't suffix.
