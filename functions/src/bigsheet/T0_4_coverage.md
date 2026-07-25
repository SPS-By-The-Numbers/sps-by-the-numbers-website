# T0.4 — Non-SPS District Coverage Investigation

Question: Does the bigsheet migration's district-generalization assumption hold
for non-Seattle districts? Specifically, does `sps-btn-data.safs_domains.d_school`
have rows for non-SPS districts, and are the SPS-specific dimension columns
(`type`, `region`, `ms_assignment_code`) populated?

Districts checked (chosen from top of `ospi.rc_enrollment` by row count):
- 17001 = Seattle (SPS, baseline)
- 27010 = Tacoma
- 32081 = (non-SPS)
- 17414 = (non-SPS)

Note: `ccddd` is an INT64 in these tables (query with integer literals, not strings).

## Findings

### 1. `d_school` rows exist for non-SPS districts — YES.

| ccddd | n_rows | school | type | region | ms_assignment_code | is_regular |
|-------|--------|--------|------|--------|--------------------|------------|
| 17001 (Seattle) | 113 | 113 | 113 | 113 | 113 | 113 |
| 27010 (Tacoma)  | 73  | 73  | 0   | 0     | 0                 | 0          |
| 32081           | 71  | 71  | 0   | 0     | 0                 | 0          |
| 17414           | 60  | 60  | 0   | 0     | 0                 | 0          |

`d_school` DOES contain rows for the non-SPS districts, and `school` (name) is
fully populated. But `type`, `region`, `ms_assignment_code`, and `is_regular`
are entirely NULL (0 non-null) for every non-SPS district. Only Seattle (17001)
has these columns populated — they are SPS-curated fields.

### 2. `rc_enrollment` "All Grades" rows (drives bigsheet row count per district).

| ccddd | All Grades rows |
|-------|-----------------|
| 17001 (Seattle) | 1185 |
| 27010 (Tacoma)  | 700  |
| 32081           | 680  |
| 17414           | 611  |

Every district has a healthy count of `grade = 'All Grades'` enrollment rows.

### 3. `rc_assessment` for Tacoma (27010), `grade_level = 'All Grades'`: 58,221 rows.

Assessment data is present for the non-SPS district as well.

## Implication

The district-generalization assumption holds with one expected caveat:

- **`d_school` coverage is fine** — non-SPS districts have school rows with names,
  so the join key and school labels work.
- **`type` is NULL for non-SPS districts.** Per the plan this is acceptable: the
  type dummy columns simply come out all-zero for those rows. No error, just
  no type signal.
- **`region` is NULL for non-SPS districts, which is also fine** — region dummies
  are SPS-only by design and are not expected to carry meaning outside Seattle.
- **`ms_assignment_code` / `is_regular` are likewise NULL** for non-SPS districts;
  any logic keyed on them will treat those rows as unset/false, consistent with
  the all-zero-dummy behavior.

Net: the migration generalizes to non-SPS districts. Enrollment and assessment
data are present and produce reasonable per-district row counts; the only
difference is that SPS-specific dimensional attributes (`type`, `region`,
`ms_assignment_code`, `is_regular`) are absent and degrade gracefully to
zero/false rather than producing gaps or errors.
