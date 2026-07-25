# Bigsheet → Cloud Function migration plan (SQL-only)

**Goal:** Move `data-tools/marts/bigsheet.py` (the ~1,240-column per-school joined
sheet) into this website as a Cloud Function endpoint that matches the
`functions/src/finance.ts` pattern exactly: the function **builds one BigQuery
SQL string** and runs `EXPORT DATA` to produce a DEFLATE-compressed AVRO in the
public cache bucket; the client fetches the AVRO and only converts to CSV for
download. **All join/derivation logic lives in SQL** — no Arquero, no avsc, no
server-side compute beyond string assembly. Generalized to any WA district by
`ccddd`, with SPS-only column families dropped for districts other than Seattle
(`17001`). After verification, Python `bigsheet.py` is frozen as provenance in
data-tools.

A **post-migration follow-up** (Phase 5) renames every output column to clean
programmatic identifiers and produces a data dictionary. During the migration
itself, legacy column names are kept (mechanically sanitized only where AVRO
requires it) so the golden diff stays meaningful.

**Repos involved:**
- Website (this repo): `/Users/albert/src/sps/sps-by-the-numbers-website`
- data-tools: `/Users/albert/src/sps/data-tools`

**Orchestrator notes:** Work on a branch in each repo. Phases are ordered;
tasks within a phase marked ⟂ are independent and can run as parallel subagents.
Every task lists acceptance criteria — a task is not done until they pass.
The single hard gate for the whole migration is the **golden diff** (Phase 3):
the SQL pipeline must reproduce the Python output for Seattle value-for-value.
When in doubt about semantics, the golden file is the arbiter, not this document.
Phase 5 starts only after Phase 4 is complete.

---

## 1. Target architecture

### Server (`functions/src/bigsheet.ts` + `functions/src/bigsheet/*`)

New HTTP function `bigsheet`, declared with `jsonOnRequest` like `finance`
(`{cors: true, region: [Constants.GCP_REGION]}` — no memory/timeout overrides
needed; BigQuery does all the heavy lifting).

`GET ?ccddd=NNNNN` flow:

1. Validate `ccddd`: must parse as an integer, 4–5 digits. **Interpolate only
   the parsed integer into SQL, never the raw string** (finance.ts interpolates
   raw query params — do not copy that; fixing finance.ts itself is out of
   scope).
2. **Enumerate pivot columns** (the one thing BQ SQL cannot do dynamically —
   `PIVOT` needs static column lists). Run small `SELECT DISTINCT` queries,
   each with a deterministic `ORDER BY`:
   - assessment combos: (`test_administration`, `test_subject`,
     `student_group`) from `ospi.rc_assessment` for this ccddd (same row
     filter as the assessment CTE);
   - SPS only: MAP combos (subject, grade, season) from the two MAP external
     tables; SQSS combos (measure, student_group) from the sqss external table.
   These run on every request, cache hit or not (~1–2s each, in parallel);
   that is the price of the property below. Optional later optimization:
   memoize per-ccddd in module scope with a short TTL.
3. **Assemble the full SQL** from the static CTE template (section 2) + the
   enumerated pivot SELECT lists + `ccddd`. SPS-only blocks are included only
   for `ccddd === 17001`.
4. Cache key = `sha256(assembledSql)` via the shared helpers, path
   `cache/scratch/<ccddd>/bigsheet/<hash8>__000000000000.avro` in
   `sps-by-the-numbers-public` — identical scheme to finance. Because the SQL
   text embeds the enumerated pivot columns, **the cache invalidates
   automatically when new years, test administrations, or student groups land
   upstream** — no version constant needed for data changes (keep a small
   `BIGSHEET_SQL_VERSION` comment line inside the generated SQL to force
   invalidation on pure logic fixes).
5. If the cache file `.exists()` → return its public URL. Otherwise run
   `prefixWithExport(gsExportPath, assembledSql)` (the existing EXPORT
   DATA/AVRO/DEFLATE/`LIMIT`-forces-one-file wrapper) via
   `bigqueryClient.query`, then return the URL.
6. Response JSON identical in shape to finance:
   `makeResponseJson(true, "ok", {dataUrl, format: 'AVRO', compression: 'DEFLATE'})`.

Shared helpers: extract `sha256`/`makeCachePaths`/`cacheExists`/
`prefixWithExport` out of `finance.ts` into `functions/src/cache.ts` and import
from both `finance.ts` and `bigsheet.ts`. Behavior of the finance endpoints
must not change — same salt, same paths, so existing cache files stay valid
(assert one known hash in a test). A stale `functions/src/.finance.ts.swp`
exists; editing finance.ts is fine, just flag the swap file to the owner.

Wiring checklist (all required or the endpoint won't exist):
- `functions/src/index.ts`: `export { bigsheet } from './bigsheet';`
- `config/constants.ts`: `ENDPOINT_NAMES = ["finance", "bigsheet"]` (prod URL
  becomes `https://bigsheet-rdcihhc4la-uw.a.run.app`, emulator URL derived
  automatically).
- No new `functions/` dependencies. (`arquero`/`avsc` stay client-only; the
  esbuild bundling step is untouched.)

### Static inputs (SPS-only) as BigQuery external tables

The seven non-BigQuery inputs are published from data-tools to
`gs://sps-by-the-numbers-public/static/bigsheet-inputs/` and exposed to SQL as
**external tables** in a new dataset `sps-btn-data.bigsheet_inputs` (explicit
schemas, `skip_leading_rows=1`; DDL script lives in data-tools so it is
reproducible). Re-running the publish script updates the sheet contents with no
BQ reload — but note the cache does NOT auto-invalidate on CSV content changes
(only on pivot-combo changes), so the publish script's docs must say "bump
`BIGSHEET_SQL_VERSION` after republishing".

| file | joined on | produces |
|---|---|---|
| `map-score-2017-2024-average-hc.csv` | `school_code` | `hc_*` MAP columns |
| `map-score-2017-2024-average-nonhc.csv` | `school_code` | `nonhc_*` MAP columns |
| `bex-vi-historic-building-scores.csv` | `school_code` | BEX condition columns |
| `utilization_condition.csv` | `school_code` | utilization columns |
| `income_by_school.csv` | `school_code` | income columns |
| `building_transitions.csv` | `school_code`, `class_of` | `bldg_staff_*` churn |
| `sqss.csv` | `school_code`, `class_of` | SQSS pivot columns |

Location constraint: BigQuery requires all datasets in one query to share a
location, and `EXPORT DATA` needs bucket/dataset location compatibility. The
finance endpoints already export from `sps-btn-data` datasets to this bucket,
so create `bigsheet_inputs` in the **same location as the existing
`ospi`/`safs_*` datasets** (check with `bq show`), and verify early with a
cross-dataset join smoke query (Phase 0).

### Column naming during migration (legacy, sanitized)

AVRO/BQ field names must match `[A-Za-z_][A-Za-z0-9_]*`, but legacy headers
include spaces and hyphens (`hc_Math_2_Fall_Average of RITScore`, `K-8`).
Migration policy: keep legacy names, mechanically sanitized — a single shared
`sanitizeName()` (every run of non-`[A-Za-z0-9_]` chars → `_`; prefix `_` if
the result starts with a digit), applied both in the SQL generator and in the
golden-diff harness. The harness verifies the golden-header → sanitized
mapping is **bijective** (fail on collision). Users therefore see slightly
uglified headers between migration and Phase 5's wholesale rename — accepted.
No sidecar header file, no client-side renaming.

### Client

A per-district **"Download all data (CSV)"** button in the finance settings
drawer (`app/finance/_widgets/DatasetSettingsContents.tsx`, which already knows
`settings.ccddd`; the "Add Comparison" button in `SettingsLayout.tsx:273` is the
styling precedent). Click → `fetchEndpoint("bigsheet", "GET", {ccddd})` → fetch
the returned `dataUrl`, decode AVRO exactly as
`utilities/client/FetchData.ts:avroToDf` does (reuse its `DecimalToNumberType`
logical type and `createBlobDecoder` pattern, but capture the **schema field
order** from the `metadata` event) → serialize rows to CSV **with a new pure,
arquero-free writer** (arquero is stub-mocked in root jest, so anything needing
tests must not import it) → `Blob` + `URL.createObjectURL` + anchor click,
filename `bigsheet_<ccddd>.csv`. CSV headers = AVRO field names; column order =
AVRO schema order. The client does **no joining** — only AVRO→CSV.

### District generalization

For `ccddd !== 17001`, these blocks are **omitted from the generated SQL**
(their columns are absent, not null-filled): MAP (`hc_*`, `nonhc_*`),
BEX/building, churn (`bldg_staff_*`), SQSS, region dummies (`r_*`),
middle-school-assignment dummies (`m_*`), and `ms_assignment_code_normalized`.

Everything else (enrollment/demographics, spend buckets, S-275 staffing,
experience percentiles, assessment pivot, type dummies, spend groups, remaining
normalized/derived columns) is district-general — all source tables
(`ospi.rc_enrollment`, `ospi.rc_assessment`,
`safs_f19x.general_fund_expenditures`, `safs_s275.*`, `safs_domains.d_school`)
are statewide. `d_school.type/region` may be null for other districts — Phase 0
T0.4 checks; type dummies then come out all-zero, acceptable for v1.

**Deliberate v1 choice:** SQSS stays sourced from the SPS `sqss.csv` external
table (golden fidelity). Follow-up (Phase 5 candidate): source it from
`ospi.rc_sqss` per-ccddd, making SQSS district-general; values may differ from
the curated CSV, so never swap it before the golden gate passes.

---

## 2. The porting contract (CTE stages; operation order matters)

The generated SQL must replicate `bigsheet.py`'s **operation order**, not just
its formulas — several columns depend on *when* they are computed relative to
the outer joins. Source of truth:
`/Users/albert/src/sps/data-tools/marts/bigsheet.py` (434 lines — the porting
agent must read it in full), `marts/vitals.sql`, `marts/assessment.sql`. Check
verbatim copies of both .sql files into `functions/src/bigsheet/sql/` for
provenance. Stage sequence (each ≈ one CTE or CTE group):

1. **Vitals CTEs** — inline `vitals.sql` wholesale (`{project}` →
   `sps-btn-data`, `17001` → the ccddd parameter in all five places:
   rc_enrollment, general_fund_expenditures, the two S-275 `r.ccddd` filters in
   duty_summary/distinct_teachers, distinct_principals, and the d_school
   join). Drop its trailing `ORDER BY` (ordering is applied once, at the end).
2. **Experience percentiles** — replace the sorted-array columns with exact
   order statistics **at the same column positions**:
   `class_teacher_exp_years` → `class_teacher_exp_50pctile`,
   `class_teacher_exp_80pctile`; then `principal_exp_years` →
   `principal_exp_{50,80}pctile`. Definition (numpy `inverted_cdf`): for the
   sorted ascending array `a` of length `n` (the SQL's `ARRAY_AGG ... IGNORE
   NULLS ORDER BY` already provides it), pctile *q* is
   `a[OFFSET(CAST(CEIL(q/100 * n) AS INT64) - 1)]`; empty/absent array → NULL.
   **Do NOT use `APPROX_QUANTILES` (a sketch — wrong on group sizes 14/28/56)
   or `PERCENTILE_DISC` (different definition — disagrees on 200 rows at
   q=0.8).** The golden diff will catch either mistake: the 65
   Python-corrected rows must match.
3. **Spend groups** (note pandas `fillna(0)` semantics — all-null components
   produce 0, not NULL: `COALESCE` each component):
   `spend_grp_ex_ell_speced_comp = gen_ed + instr_other + district_support +
   other` (each `spend_*_per_pupil`); `spend_grp_spec_ed = spec_ed +
   compensatory`; `spend_grp_title1_lap_ble = title1 + lap + ble`.
4. **Dummies** — computed **in the vitals branch, before the assessment/SQSS
   outer joins** (rows contributed only by those joins must have NULL here,
   NOT 0 — the golden file shows this):
   type: `OtherSchool, K-8, Highschool, Middle, Elementary` (1 iff `type`
   equals the label else 0; null type → 0);
   region (SPS only): `r_Invalid, r_NW, r_NE, r_Central, r_SW, r_SE, r_Other`;
   ms-assignment (SPS only): `m_Meany=5485, m_Eckstein=2729, m_JaneAddams=5351,
   m_Hamilton=2371, m_McClure=3517, m_RESMS=5486, m_Whitman=3277,
   m_AkiKurose=3774, m_Mercer=3095, m_Washington=4064, m_Denny=2839,
   m_Madison=2435`.
5. **MAP join** (SPS only): pivot each external table by `school_code` ×
   (subject, grade, season), values = (avg RIT, stddev[, N for nonhc]) —
   enumerated columns from the combo query, ordered to match pandas' pivot
   ordering (golden header is the arbiter). Legacy naming: tuple
   `(value, subject, grade, season)` rotated left →
   `hc_<subject>_<grade>_<season>_<value>` / `nonhc_...`, then `sanitizeName`.
   LEFT JOIN on `school_code` — MAP is year-invariant, so values repeat across
   a school's `class_of` rows.
6. **BEX join** (SPS only): three LEFT JOINs on `school_code`; columns pass
   through with their (sanitized) CSV headers.
7. **Churn join** (SPS only): aggregate the transitions external table by
   (`class_of`, `school_code`): sum `transfer_in, transfer_out, hire, depart`;
   `added = transfer_in + hire`; `lost = transfer_out + depart`;
   `net_churn = added - lost`; prefix all six with `bldg_staff_`; LEFT JOIN.
8. **Assessment** — inline `assessment.sql` as a CTE (ccddd parameterized;
   its ORDER BY moves into the combo-enumeration query instead). Then: drop
   rows with any NULL in the 6-column logical key; drop rows where **all
   four** values (`pct_noscore`, `pct_alternative`,
   `pct_met_standard_numeric`, `pct_met_standard_numeric_nodat`) are NULL.
   Pivot by (`class_of`, `school_code`, `grade_level`) ×
   (`test_administration`, `test_subject`, `student_group`), values =
   (`pct_noscore`, `pct_met_standard_numeric`,
   `pct_met_standard_numeric_nodat`) — `pct_alternative` participates in the
   null-filter but is NOT pivoted. Legacy naming: rotated →
   `<administration>_<subject>_<group>_<value>`, sanitized. **FULL OUTER**
   join to the vitals branch on (`class_of`, `school_code`) — with an
   explicit null-safe key condition (see grain notes). `grade_level` remains
   an ordinary column (constant `'All Grades'` on assessment rows).
9. **Post-join derived** (after the assessment join, all rows):
   `at_or_after_2021 = IF(class_of >= 2021, 1, 0)`;
   `log_enrollment = IF(all_students > 0, LN(all_students), NULL)`.
10. **Normalized fields** (max over the merged result, `MAX() OVER ()`, nulls
    ignored — BQ default): `num_students_normalized = all_students/max`,
    `class_of_normalized`, `school_code_normalized`,
    `ms_assignment_code_normalized` (SPS only),
    `class_teacher_exp_50pctile_normalized`;
    `pct_class_teacher_ge_bachelors =
    (bachelors+masters+doctors)/num_class_teachers`;
    `pct_class_teacher_gt_bachelors = (masters+doctors)/num_class_teachers`;
    `class_teacher_fte_per_pupil`, `asst_principal_fte_per_pupil`,
    `other_teacher_fte_per_pupil` (each `/ all_students`).
11. **SQSS** (SPS only): from the sqss external table; map `measure` →
    `dual_credit` / `attendance` / `ninth_grade_on_track` (from
    `Dual Credit`, `Regular Attendance`, `Ninth Grade on Track`; unmapped
    measures → NULL and thus excluded from the pivot); pivot by
    (`class_of`, `school_code`) × (`measure_clean`, `student_group`), values =
    (`percent`, `numerator`, `denominator`); rotated names
    `<measure>_<group>_<value>`, sanitized. **FULL OUTER** join on
    (`class_of`, `school_code`), null-safe.
12. **Final SELECT** — column order: `class_of, school_name, type, is_regular,
    school_code`, then everything else in accumulated order (the Python does
    five `moveToFront` calls in reverse). The AVRO schema field order IS the
    column order. Add a deterministic final
    `ORDER BY class_of, school_code` (row order of the golden CSV is
    pandas-merge order and is NOT reproduced; the diff is key-based).
13. **No index column**: `bigsheet.py` writes `to_csv()` with the pandas
    index, so the golden CSV has a leading unnamed 0..N column. The SQL output
    must NOT have it; the diff harness skips golden column 0.

Grain notes: (`class_of`, `school_code`) is unique across the final sheet;
district-total rows have **null `school_code`**, and pandas merges match null
keys while SQL joins don't — every join on `school_code` must use
`(a.school_code = b.school_code OR (a.school_code IS NULL AND b.school_code IS
NULL))` or COALESCE-sentinel keys. After the FULL OUTER joins, emit
`COALESCE(lhs.class_of, rhs.class_of)` etc. for the key columns. ~1,185 vitals
rows for Seattle plus assessment-/SQSS-only rows; record the exact golden row
count in Phase 0.

Type notes: BQ NUMERIC columns export to AVRO as decimal logical types — the
client's existing `DecimalToNumberType` already converts them (this is exactly
how finance datasets flow today). The golden diff compares numerically with
tolerance, so NUMERIC-vs-FLOAT64 representation differences don't matter;
`CAST(... AS FLOAT64)` is allowed where it simplifies, but never required for
its own sake.

---

## 3. Phases and subagent tasks

### Phase 0 — Preflight (all ⟂)

**T0.1 — Generate the golden file** (data-tools; needs BigQuery ADC).
From `/Users/albert/src/sps/data-tools`:
`venv/bin/python3 -m marts.bigsheet -o reference/regress/bigsheet_golden_seattle.csv`
(run from repo root — it reads `data/` relatively).
*Accept:* file exists; record row count, column count, and the exact header
line into `reference/regress/bigsheet_golden_seattle.meta.txt` for later
phases. If BQ auth fails, stop and surface — everything downstream needs this.

**T0.2 — Publish static inputs + external tables** (data-tools; needs gcloud +
bq). Create `scripts/publish_bigsheet_inputs.sh`: copies the seven files from
`data/sps/{map,building,s275,sqss}/` to
`gs://sps-by-the-numbers-public/static/bigsheet-inputs/` (flat, original
basenames). Before uploading, **privacy-check each file**: confirm every file
is school-level aggregate data with no individual-person rows (believed true;
if any contains person-level data, stop and surface instead of uploading).
Create `scripts/create_bigsheet_input_tables.sh` (or a .sql DDL file + runner):
`CREATE OR REPLACE EXTERNAL TABLE sps-btn-data.bigsheet_inputs.<name>` for each
file with **explicit schemas** (column names pre-sanitized to identifier form;
record the original→table-column mapping in a comment). Create the dataset in
the same location as `ospi`/`safs_*` (`bq show --format=prettyjson
sps-btn-data:ospi | grep location` first). Run both scripts.
*Accept:* `curl -sf .../bigsheet-inputs/sqss.csv | head -1` returns a header
for all seven files; a smoke query joining
`bigsheet_inputs.building_transitions` to `safs_domains.d_school` runs; row
counts of each external table match the CSV line counts − 1.

**T0.3 — Cache-helper extraction** (website). Extract
`sha256`/`makeCachePaths`/`cacheExists`/`prefixWithExport` from `finance.ts`
into `functions/src/cache.ts`; finance.ts imports them. Add the first test in
`functions/` asserting a known (query, salt) → hash/path pair computed from the
current code *before* refactoring, so cache compatibility is proven. If the
emulator-wrapped `npm run test` is awkward for pure unit tests, add a
`test:unit` script running bare jest.
*Accept:* `cd functions && npm run build` passes; hash-stability test green.

**T0.4 — d_school coverage check** (either repo; needs bq CLI or ADC).
Query `sps-btn-data.safs_domains.d_school` for 2–3 non-SPS ccddds (e.g. 27010
Tacoma): do rows exist, and are `type`/`region`/`ms_assignment_code`
populated? *Accept:* a short written finding; if d_school has no rows for
other districts, note that the LEFT JOIN yields nulls and type dummies become
all-zero (acceptable; do not change the design without surfacing).

### Phase 1 — SQL generator + endpoint (after Phase 0; T1.1/T1.2/T1.4 ⟂ once the module interfaces below are stubbed)

Module layout (`functions/src/bigsheet/`) — the generator is **pure
string-building functions**, unit-testable without BQ:

```
functions/src/cache.ts        // shared cache helpers (T0.3)
functions/src/bigsheet/
  sql/vitals.sql, sql/assessment.sql   // verbatim provenance copies
  names.ts       // sanitizeName(), rotate-left legacy naming, collision check
  staticSql.ts   // vitals CTEs + percentiles + spend groups + dummies + derived/normalized + final ordering, parameterized by ccddd  [T1.1]
  pivots.ts      // combo-query builders + enumerated pivot SELECT-list builders for assessment/MAP/SQSS  [T1.2]
  assemble.ts    // assembleBigsheetSql(ccddd, combos): full query text, SPS gating, BIGSHEET_SQL_VERSION comment  [T1.3]
bigsheet.ts      // jsonOnRequest endpoint: validate → combo queries → assemble → cache → EXPORT DATA → URL  [T1.3]
functions/scripts/golden_diff.ts  // the gate  [T1.4]
```

**T1.1 — Static SQL.** Port sections 2.1–2.4 and 2.9–2.13: vitals CTEs
(byte-faithful inline of `vitals.sql` modulo the parameterization — write a
test diffing the emitted CTE text against the provenance copy so only the
intended substitutions differ), percentile expressions, spend groups, dummies,
post-join derived, normalized fields, null-safe join conditions, final column
ordering. *Accept:* unit tests green — including percentile-expression
snapshot, dummy placement (in the vitals branch), COALESCE'd spend groups, and
the final-order head (`class_of, school_name, type, is_regular, school_code`).

**T1.2 — Pivot generators.** Combo queries (with deterministic ORDER BY
matching pandas' pivot column ordering — golden header decides; get the
ordering rule from `reference/regress/bigsheet_golden_seattle.meta.txt`'s
header) and SELECT-list generation for assessment/MAP/SQSS per sections 2.5,
2.8, 2.11, using `names.ts`. *Accept:* unit tests green — given fixture combo
lists, generated column lists match the corresponding golden-header slices
exactly (hardcode a few dozen expected names from the golden header in the
test); sanitizer collision check fails loudly on a crafted collision.

**T1.3 — Endpoint assembly.** `assemble.ts` + `bigsheet.ts` per section 1;
wire `functions/src/index.ts` and `config/constants.ts` `ENDPOINT_NAMES`.
*Accept:* `npm run build` (functions) passes; emulator smoke: bad ccddd → 400,
shape of success JSON matches finance; a direct script run with ADC executes
`assembleBigsheetSql(17001, …)` against BQ dry-run (`dryRun: true`) without
SQL errors — the cheapest full-syntax check before Phase 3.

**T1.4 — Golden-diff harness.** `functions/scripts/golden_diff.ts` (tsx/node +
ADC, not jest): takes the golden CSV path; obtains the Seattle result (run the
assembled SQL via BQ into memory, or read the exported AVRO — either); then:
- header mapping: apply `sanitizeName` to golden headers (after dropping
  golden column 0, the pandas index); assert bijectivity;
- column sets equal; column ORDER equal to the sanitized golden header;
- per-cell values keyed by (`class_of`, `school_code` with null→sentinel):
  numerics within relative 1e-6 or absolute 1e-9; empty/NaN/NULL all equal;
  booleans `True`/`true`/`1` normalized;
- row counts equal.
Output: summary + first 50 mismatches with keys and column names.
*Accept:* harness runs end-to-end and produces a report (it will initially
FAIL on real mismatches — that's Phase 3's loop, not this task's).

### Phase 2 — Client (⟂ with Phase 1)

**T2.1 — Pure CSV writer + tests.** `utilities/client/csv.ts`:
`rowsToCsv(fieldNames: string[], rows: object[]): string` — RFC 4180 quoting,
schema-order fields, null/undefined → empty cell, booleans as `true`/`false`.
**Must not import arquero** (root jest stubs it). *Accept:* root jest tests
green, covering quoting, commas, newlines, nulls, unicode.

**T2.2 — Download button.** In `DatasetSettingsContents.tsx` (per-district,
next to the `DistrictSelector`): MUI button "Download all data (CSV)". Handler:
`fetchEndpoint("bigsheet", "GET", {ccddd})` → fetch `dataUrl` → decode with the
`avroToDf`-style `createBlobDecoder` (+ `DecimalToNumberType`), capturing field
order from the `metadata` event (extract this decode into a shared helper in
`FetchData.ts` rather than duplicating the logical-type dance) → `rowsToCsv` →
Blob download as `bigsheet_<ccddd>.csv`. Spinner while running (first
generation per district takes a minute or two — say so in a tooltip) and a
visible error state. *Accept:* root `npm run build` and `npm run lint` pass;
manual click-through happens in Phase 3.

### Phase 3 — Verification (sequential; the hard gate)

**T3.1 — Golden diff loop.** Run T1.4's harness against T0.1's golden. Fix the
generator until: **0 value mismatches, 0 column-set differences, 0 row-count
differences, and column order matches the sanitized golden header.** Expected
trouble spots: pandas pivot column ordering, null-key join rows (district
totals), dummy placement relative to the outer joins, `COALESCE` spend-group
semantics, the assessment all-four-null filter. Iterate as long as needed; if
a golden value is discovered to be a *Python* bug, stop and surface — do not
"fix" the golden. *Accept:* clean pass; commit the harness + a
`GOLDEN_DIFF_RESULT.md` recording the pass (row/col counts, date, golden meta).

**T3.2 — Non-SPS smoke.** Generate for 27010 (Tacoma) and one small district
from T0.4. *Accept:* completes; output has NO `hc_*`, `nonhc_*`,
`bldg_staff_*`, `r_*`, `m_*`, SQSS, or BEX columns; row count plausible vs a
one-off `rc_enrollment` count for that ccddd; spend/staffing columns populated.

**T3.3 — Function + client checks.** `cd functions && npm run test` and
`npm run build`; root `npm run build`, `npm run lint`, `npm run test`.
Emulator: GET with valid/invalid ccddd returns finance-shaped JSON / 400.
*Accept:* all green.

**T3.4 — Deploy + live smoke.** `cd functions && npm run deploy`, then root
`npm run deploy`. Live site: download Seattle (spot-check cells + header
against golden) and Tacoma (reduced columns); second click on the same
district returns fast (cache hit). Optionally pre-warm Seattle with one curl.
*Accept:* both downloads open correctly in a spreadsheet. **If the
orchestrating session lacks deploy permission, stop here and hand the two
deploy commands to the owner — do not force it.**

### Phase 4 — Cleanup and docs (⟂ after Phase 3)

**T4.1 — data-tools.** Mark the Python side frozen-as-provenance (do NOT
delete — this repo keeps originals for provenance; deletion is the owner's
call): note at the top of `marts/README.md` and in `CLAUDE.md`'s Marts section
that bigsheet now lives in the website repo (`functions/src/bigsheet/`) with
this file as the migration record; that `marts/bigsheet.py` + `vitals.sql` +
`assessment.sql` are frozen references and the golden-regression source; and
that `scripts/publish_bigsheet_inputs.sh` must be re-run whenever the seven
`data/sps` inputs change, followed by a `BIGSHEET_SQL_VERSION` bump in the
website functions. *Accept:* docs updated; committed on a branch.

**T4.2 — Website docs.** Update `CLAUDE.md` (Data Flow + Key Directories:
bigsheet endpoint, shared `cache.ts`, the functions tests, the golden-diff
harness) and append an outcome section to this file. *Accept:* docs updated.

**T4.3 — Commits/PRs.** One branch+PR per repo, referencing each other. Commit
messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`;
PR bodies end with the Claude Code attribution line.

### Phase 5 — POST-migration follow-up: wholesale column rename + data dictionary

**Strictly after Phase 4.** Separate branch/PR; the migration must not block
on it, and the rename must be **value-neutral** (names change, values don't).

**T5.1 — Naming scheme design.** Replace all legacy headers with clean
programmatic identifiers: snake_case, `[a-z][a-z0-9_]*`, short but
descriptive, consistent family prefixes (e.g. `map_hc_math_g2_fall_rit_avg`,
`bex_condition_score`, `asmt_sba_ela_all_pct_met`, `sqss_attendance_all_pct`,
`type_k8` instead of `K-8`). Deliverable: a design note + the complete
old→new mapping table, generated programmatically from the generator's column
metadata so nothing is missed. Owner reviews the scheme before implementation
(this is the one Phase-5 step that wants a human eye — surface it rather than
guessing on taste).

**T5.2 — Implement the rename.** The mapping lives in ONE module
(`names.ts`), consumed by the SQL generator; delete the legacy
rotate-left/sanitize path. Bump `BIGSHEET_SQL_VERSION`. Update the golden-diff
harness to compare through the old→new mapping (values must still match the
golden exactly — this is the proof the rename is value-neutral).
*Accept:* golden diff green through the mapping; no legacy-format names remain
in the output.

**T5.3 — Data dictionary.** Machine-readable dictionary
(`functions/src/bigsheet/dictionary.json` or generated at build time) with one
entry per column: name, column family, grain, source (BQ table / static input
file), derivation summary, and provenance notes — including the recorded
gotchas: `other_teacher` = duty 33+34 (2015-16 discontinuity), the vocational
spend fix, the exact-percentile method, FTE = sum of
`assignment.fte_in_assignment`, spend excludes non-school-attributed costs
(e.g. Pupil Transportation). Generate it from the same column metadata the SQL
generator uses so it cannot drift. Render it somewhere reachable: a
`/finance/data-dictionary` page or a `bigsheet_dictionary.csv` published next
to the AVRO caches, plus a link near the download button.
*Accept:* every output column has a dictionary entry (test enforces 1:1 with
generated columns); page/file published.

**T5.4 — Candidates folded in here, not before:** SQSS from `ospi.rc_sqss`
(district-general), and combo-query memoization if endpoint latency on cache
hits annoys.

---

## 4. Known risks

- **Pandas pivot column ordering** is the likeliest golden-diff pain; the
  golden header (T0.1 meta file) is the arbiter — match it empirically, don't
  reason from pandas docs.
- **Quantiles**: only the order-statistic array expression is acceptable —
  `APPROX_QUANTILES` and `PERCENTILE_DISC` are both known-wrong vs the golden
  (sketch error / different definition). The golden's 65 corrected rows are
  the regression test.
- **Null-key joins** (district-total rows): pandas matches NULL=NULL, SQL
  doesn't — every school_code join needs the null-safe condition or the 11
  district-total rows per year silently split into duplicates.
- **Query size**: enumerated pivots put the generated SQL around 100–200KB —
  under BQ's 1MB limit, but log the size; if a future year explodes the combo
  count, the harness will notice before users do.
- **Dataset locations**: `bigsheet_inputs` must be created in the same
  location as `ospi`/`safs_*` or every cross-dataset join fails; checked in
  T0.2.
- **Cache-helper extraction from `finance.ts`** must keep byte-identical hash
  inputs (same salt handling) or every existing finance cache silently
  invalidates; the T0.3 hash-stability test guards this. (A stale
  `.finance.ts.swp` sits next to it — harmless, but flag it to the owner.)
- **Static-input edits don't auto-invalidate the cache** (only pivot-combo
  changes do) — the publish script's docs must pair republishing with a
  `BIGSHEET_SQL_VERSION` bump.
- **`__mocks__/arquero.ts`** stubs arquero for ALL root-jest tests — client
  code that must be tested cannot import arquero (hence the pure CSV writer).
- **First-generation latency** (~a minute or two of BQ) hits whoever clicks
  first per district per cache key; acceptable for v1, noted in the tooltip;
  optional pre-warm of Seattle in the deploy checklist.
- **Interim ugly headers**: between migration and Phase 5, downloads carry
  mechanically sanitized legacy names (`hc_Math_2_Fall_Average_of_RITScore`).
  Accepted trade for keeping the golden diff meaningful; Phase 5 fixes it
  properly.

---

## 5. Migration outcome (2026-07-25)

**Status: Phases 0–4 complete. Golden gate PASSED.** Phase 5 (wholesale rename +
data dictionary) is intentionally deferred to a separate branch/PR.

### The hard gate
`functions/scripts/golden_diff.ts diff <golden> 17001` →
**1240/1240 columns (set + order match), 1185/1185 rows, 0 value mismatches.**
The SQL pipeline reproduces `marts/bigsheet.py`'s Seattle output value-for-value.
Non-SPS smoke (Tacoma 27010): 702 rows, 715 cols, 0 SPS-only columns present,
type dummies + spend/staffing populated, 184 assessment pivot columns.

### What shipped
- **Server:** `functions/src/bigsheet.ts` (endpoint) + `functions/src/bigsheet/`
  (`names.ts`, `staticSql.ts`, `pivots.ts`, `assemble.ts`, verbatim `sql/`
  provenance + generated string modules). Shared `functions/src/cache.ts`
  extracted from `finance.ts` (hash-stability test locks salt `2026-05-01` →
  `36d63bb6…`). Wired: `index.ts` export, `config/constants.ts` ENDPOINT_NAMES.
  20 unit tests (`npm run test:unit`) + emulator-wrapped `npm run test`.
- **Client:** `utilities/client/csv.ts` (pure RFC-4180 writer, 14 tests, no
  arquero) + `avroToRowsAndFields` helper in `FetchData.ts` + a per-district
  "Download all data (CSV)" button in `DatasetSettingsContents.tsx`.
- **data-tools:** `scripts/bigsheet_inputs_lib.py` +
  `publish_bigsheet_inputs.sh` + `create_bigsheet_input_tables.sh` publish the
  seven static inputs to `sps-btn-data.bigsheet_inputs` external tables
  (us-west1). `marts/{bigsheet.py,vitals.sql,assessment.sql}` frozen as
  provenance / golden source.

### Decisions & deviations worth knowing
- **Pivot ordering** (the #1 risk) was determined empirically
  (`reference/regress/pivot_order_experiment.py`): pandas pivot column order =
  **full-tuple first-appearance in source row order** for all four pivots.
  Reproduced via `ROW_NUMBER()` (assessment) and an injected `_csv_row` column
  (MAP/SQSS, whose order is the raw CSV order BigQuery can't otherwise expose).
- **Sanitize is NOT bijective on the real data.** SQSS carries dual spellings
  of the same group ("Non Migrant"/"Non-Migrant", "Hispanic/Latino"/"Hispanic/
  Latino", "Non-Section 504" variants — 66 collisions across 330 SQSS columns).
  The golden keeps both as distinct columns, so instead of failing we
  **disambiguate deterministically** (`sanitizeUnique`: first keeps base, later
  gets `_<k>`), applied identically in the generator and the harness (their
  column order is the same, so names + values line up). This is a genuine
  upstream data-quality finding worth surfacing to the owner; Phase 5's rename
  should give these clean, intentional names.
- **`map_nonhc` value columns are STRING**, not FLOAT — they carry `"n<10"`
  suppression markers, which pandas (and the golden) keep verbatim.
- **`IEEE_DIVIDE`** for per-pupil / normalized columns: one Seattle row has
  `all_students = 0`, and numpy yields inf/nan there (plain SQL `/` errors).

### Not done here (owner action)
- **Deploy (T3.4):** the emulator smoke could not run in this session because
  **port 5001 was already held by another emulator instance**; the endpoint is
  otherwise verified (BQ dry-run + golden diff + non-SPS smoke + unit tests).
  Deploy was **not** run. To ship:
  ```
  cd functions && npm run deploy      # Cloud Function
  cd ..        && npm run deploy       # Hosting (client button)
  ```
  Optionally pre-warm Seattle: `curl -s 'https://bigsheet-rdcihhc4la-uw.a.run.app/?ccddd=17001'`.
- **Root `npm run lint`** has ~8k pre-existing repo-wide prettier errors in
  unrelated files; the new files are lint-clean.

---

## 6. Phase 5 outcome (2026-07-25, branch `bigsheet-rename`)

Phase 5 was executed as a **rename + de-goldening** in one pass; the golden
gate is retired, not just passed. See `BIGSHEET_HANDOFF.md` (current state)
and `functions/src/bigsheet/NAMING.md` (design) for details.

- All legacy headers replaced by source-prefixed snake_case identifiers;
  1,241 legacy columns → 1,170 new (66 spelling-variant pairs **merged** —
  verified lossless against sqss.csv — and 5 junk columns dropped: pandas
  index, `school`/`school_1` duplicates, constant `grade`/`grade_level`).
  Legacy→new mapping: `functions/src/bigsheet/COLUMN_MAPPING.csv`.
- Golden-fidelity machinery deleted: `golden_diff.ts`, `_csv_row` +
  first-appearance pivot ordering, `sanitizeUnique`, rotate-left naming,
  `staticSql.ts` regex surgery (the `sql/` files are owned sources now).
- Data dictionary (`dictionary.ts`) generates from the same column plan as
  the SQL; a test enforces 1:1.
- `IEEE_DIVIDE` → `SAFE_DIVIDE` (NULL, not inf, at zero denominators) — the
  one deliberate value-level change.
- Verified: 25 unit tests; functions + root builds; BigQuery dry runs for
  17001 (1,170 cols) and 27010 (711 cols) with result schema matching the
  plan 1:1. `BIGSHEET_SQL_VERSION = 2026-07-25.2`.
