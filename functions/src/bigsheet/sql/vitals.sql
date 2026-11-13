-- Vitals CTE chain for the bigsheet endpoint: per-school enrollment &
-- demographics (OSPI report card, K-12), per-program spend (SAFS F-196) and
-- staffing/salary/experience (SAFS S-275), one row per (school_code,
-- class_of) including the district-total rows (NULL school_code).
--
-- This is a CTE FRAGMENT: no leading WITH, no trailing ORDER BY; it ends with
-- the vitals_org CTE and is spliced into the WITH clause by assemble.ts.
-- Placeholders: {project} (GCP project), {ccddd} (county+district code).
-- Columns keep their upstream names here; the final SELECT renames them (see
-- columns.ts, the single source of output naming).
--
-- Provenance: descends from data-tools marts/vitals.sql (itself an inlining
-- of vitals_org.sql, expenditures_by_school.sql, s275_school_summary.sql),
-- with two deliberate fixes over the original queries:
--   1. Vocational spend (programs 31, 34, 38, 39, 45, 46, 47) is included;
--      the original dropped the category on the floor, understating
--      comp_amount / non_comp_amount / total_spend.
--   2. Experience percentiles are the exact order statistic — the
--      ceil(q/100*n)-th smallest observation (the smallest value whose
--      empirical CDF reaches q) — not APPROX_QUANTILES, whose sketch returns
--      a neighbouring order statistic on some group sizes.

-- ========================= enrollment (OSPI report card) ===================
-- OSPI's "All Grades" row INCLUDES PK. Every enrollment column the sheet
-- exposes is K-12: OSPI's row minus the PK row, column by column. The two
-- rollups get the same suppression treatment, so the subtraction stays
-- consistent across every column (a sum of per-grade rows would not). A
-- school with no PK row has K-12 = PK-12; a PK row with a suppressed (NULL)
-- cell yields NULL for that cell. The PK-12 headcount survives as
-- all_students_pk12.

enrollment_rows AS (
  SELECT *
  FROM {project}.ospi.rc_enrollment
  WHERE ccddd = {ccddd}
),

enrollment_k12 AS (
  SELECT
    ag.ccddd,
    ag.school_code,
    ag.school_name,
    ag.school_year,
    ag.class_of,
    ag.all_students AS all_students_pk12,
    IF(pk.class_of IS NULL, ag.all_students, ag.all_students - pk.all_students) AS all_students_k12,
    IF(pk.class_of IS NULL, ag.military_parent, ag.military_parent - pk.military_parent) AS military_parent_k12,
    IF(pk.class_of IS NULL, ag.migrant, ag.migrant - pk.migrant) AS migrant_k12,
    IF(pk.class_of IS NULL, ag.low_income, ag.low_income - pk.low_income) AS low_income_k12,
    IF(pk.class_of IS NULL, ag.homeless, ag.homeless - pk.homeless) AS homeless_k12,
    IF(pk.class_of IS NULL, ag.foster_care, ag.foster_care - pk.foster_care) AS foster_care_k12,
    IF(pk.class_of IS NULL, ag.mobile, ag.mobile - pk.mobile) AS mobile_k12,
    IF(pk.class_of IS NULL, ag.section_504, ag.section_504 - pk.section_504) AS section_504_k12,
    IF(pk.class_of IS NULL, ag.highly_capable, ag.highly_capable - pk.highly_capable) AS highly_capable_k12,
    IF(pk.class_of IS NULL, ag.english_language_learners, ag.english_language_learners - pk.english_language_learners) AS english_language_learners_k12,
    IF(pk.class_of IS NULL, ag.students_with_disabilities, ag.students_with_disabilities - pk.students_with_disabilities) AS students_with_disabilities_k12,
    IF(pk.class_of IS NULL, ag.female, ag.female - pk.female) AS female_k12,
    IF(pk.class_of IS NULL, ag.male, ag.male - pk.male) AS male_k12,
    IF(pk.class_of IS NULL, ag.gender_x, ag.gender_x - pk.gender_x) AS gender_x_k12,
    IF(pk.class_of IS NULL, ag.white, ag.white - pk.white) AS white_k12,
    IF(pk.class_of IS NULL, ag.black_african_american, ag.black_african_american - pk.black_african_american) AS black_african_american_k12,
    IF(pk.class_of IS NULL, ag.native_hawaiian_other_pacific, ag.native_hawaiian_other_pacific - pk.native_hawaiian_other_pacific) AS native_hawaiian_other_pacific_k12,
    IF(pk.class_of IS NULL, ag.hispanic_latino_of_any_race, ag.hispanic_latino_of_any_race - pk.hispanic_latino_of_any_race) AS hispanic_latino_of_any_race_k12,
    IF(pk.class_of IS NULL, ag.american_indian_alaskan_native, ag.american_indian_alaskan_native - pk.american_indian_alaskan_native) AS american_indian_alaskan_native_k12,
    IF(pk.class_of IS NULL, ag.asian, ag.asian - pk.asian) AS asian_k12,
    IF(pk.class_of IS NULL, ag.two_or_more_races, ag.two_or_more_races - pk.two_or_more_races) AS two_or_more_races_k12,
  FROM enrollment_rows ag
  LEFT JOIN enrollment_rows pk
    ON (pk.grade = 'PK'
        AND pk.class_of = ag.class_of
        AND (pk.school_code = ag.school_code
             OR (pk.school_code IS NULL AND ag.school_code IS NULL)))
  WHERE ag.grade = 'All Grades'
),

demographics_by_school AS (
  SELECT
    t.*,

    -- Living situation
    t.military_parent_k12 / NULLIF(t.all_students_k12, 0) pct_military_parent_k12,
    t.migrant_k12 / NULLIF(t.all_students_k12, 0) pct_migrant_k12,
    t.low_income_k12 / NULLIF(t.all_students_k12, 0) pct_low_income_k12,
    t.homeless_k12 / NULLIF(t.all_students_k12, 0) pct_homeless_k12,
    t.foster_care_k12 / NULLIF(t.all_students_k12, 0) pct_foster_care_k12,
    t.mobile_k12 / NULLIF(t.all_students_k12, 0) pct_mobile_k12,
    t.section_504_k12 / NULLIF(t.all_students_k12, 0) pct_section_504_k12,

    -- Learning type
    t.highly_capable_k12 / NULLIF(t.all_students_k12, 0) pct_highly_capable_k12,
    t.english_language_learners_k12 / NULLIF(t.all_students_k12, 0) pct_english_language_learners_k12,
    t.students_with_disabilities_k12 / NULLIF(t.all_students_k12, 0) pct_students_with_disabilities_k12,

    -- Gender
    t.female_k12 / NULLIF(t.all_students_k12, 0) pct_female_k12,
    t.male_k12 / NULLIF(t.all_students_k12, 0) pct_male_k12,
    t.gender_x_k12 / NULLIF(t.all_students_k12, 0) pct_gender_x_k12,

    -- Race
    t.white_k12 / NULLIF(t.all_students_k12, 0) pct_white_k12,
    t.black_african_american_k12 / NULLIF(t.all_students_k12, 0) pct_black_african_american_k12,
    t.native_hawaiian_other_pacific_k12 / NULLIF(t.all_students_k12, 0) pct_native_hawaiian_other_pacific_k12,
    t.hispanic_latino_of_any_race_k12 / NULLIF(t.all_students_k12, 0) pct_hispanic_latino_of_any_race_k12,
    t.american_indian_alaskan_native_k12 / NULLIF(t.all_students_k12, 0) pct_american_indian_alaskan_native_k12,
    t.asian_k12 / NULLIF(t.all_students_k12, 0) pct_asian_k12,
    t.two_or_more_races_k12 / NULLIF(t.all_students_k12, 0) pct_two_or_more_races_k12,
  FROM enrollment_k12 t
),

-- ===================== per-program spend (SAFS F-196) ======================

exp_simplified AS (
  SELECT
    class_of,
    school_code,
    object_code,
    amount,
    CASE
      WHEN program_code in (1, 2, 3, 9, 75) THEN "gen_ed"
      WHEN program_code in (79) THEN "instr_other"
      WHEN program_code in (97) THEN "district_support"
      WHEN program_code in (54, 56, 57, 58, 59, 61, 62, 67, 68, 69) THEN "compensatory"
      WHEN program_code in (64, 65) THEN "ble"
      WHEN program_code in (55) THEN "lap"
      WHEN program_code in (21, 22, 23, 24, 25, 26, 29) THEN "spec_ed"
      WHEN program_code in (51, 52, 53) THEN "title1"
      WHEN program_code in (31, 34, 38, 39, 45, 46, 47) THEN "voc"
      ELSE "other"
    END prog_category
  FROM {project}.safs_f19x.general_fund_expenditures
  WHERE ccddd = {ccddd}
    AND data_type = "actuals"
    AND has_school = TRUE
    AND school_code IS NOT NULL
),

exp_pivoted AS (
  -- Within a category that has rows, compensation is object_code 2/3/4 and
  -- everything else is non-compensation, each defaulting to 0; a category
  -- with no rows at all stays NULL.
  SELECT
    class_of,
    school_code,
    SUM(IF(prog_category = "gen_ed", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_gen_ed,
    SUM(IF(prog_category = "gen_ed", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_gen_ed,
    SUM(IF(prog_category = "spec_ed", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_spec_ed,
    SUM(IF(prog_category = "spec_ed", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_spec_ed,
    SUM(IF(prog_category = "compensatory", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_compensatory,
    SUM(IF(prog_category = "compensatory", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_compensatory,
    SUM(IF(prog_category = "lap", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_lap,
    SUM(IF(prog_category = "lap", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_lap,
    SUM(IF(prog_category = "title1", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_title1,
    SUM(IF(prog_category = "title1", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_title1,
    SUM(IF(prog_category = "ble", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_ble,
    SUM(IF(prog_category = "ble", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_ble,
    SUM(IF(prog_category = "instr_other", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_instr_other,
    SUM(IF(prog_category = "instr_other", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_instr_other,
    SUM(IF(prog_category = "district_support", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_district_support,
    SUM(IF(prog_category = "district_support", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_district_support,
    SUM(IF(prog_category = "other", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_other,
    SUM(IF(prog_category = "other", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_other,
    SUM(IF(prog_category = "voc", IF(object_code IN (2,3,4), amount, 0), NULL)) comp_amount_voc,
    SUM(IF(prog_category = "voc", IF(object_code IN (2,3,4), 0, amount), NULL)) non_comp_amount_voc
  FROM exp_simplified
  GROUP BY class_of, school_code
),

exp_by_school AS (
  SELECT
    *,
    (COALESCE(comp_amount_gen_ed, 0) +
     COALESCE(comp_amount_spec_ed, 0) +
     COALESCE(comp_amount_compensatory, 0) +
     COALESCE(comp_amount_lap, 0) +
     COALESCE(comp_amount_title1, 0) +
     COALESCE(comp_amount_ble, 0) +
     COALESCE(comp_amount_instr_other, 0) +
     COALESCE(comp_amount_district_support, 0) +
     COALESCE(comp_amount_other, 0) +
     COALESCE(comp_amount_voc, 0)
    ) comp_amount,
    (COALESCE(non_comp_amount_gen_ed, 0) +
     COALESCE(non_comp_amount_spec_ed, 0) +
     COALESCE(non_comp_amount_compensatory, 0) +
     COALESCE(non_comp_amount_lap, 0) +
     COALESCE(non_comp_amount_title1, 0) +
     COALESCE(non_comp_amount_ble, 0) +
     COALESCE(non_comp_amount_instr_other, 0) +
     COALESCE(non_comp_amount_district_support, 0) +
     COALESCE(non_comp_amount_other, 0) +
     COALESCE(non_comp_amount_voc, 0)
    ) non_comp_amount
  FROM exp_pivoted
),

-- ================ staffing / salary / experience (SAFS S-275) ==============

duty_summary AS (
  SELECT
    r.class_of,
    a.school_code,
    a.duty_root_code,
    a.duty_suffix_code,
    sum(pa.assignment_salary) assignment_salary,
    sum(a.fte_in_assignment) fte,
    sum(pa.c_est_total_compensation) c_est_total_compensation,
    sum(pa.c_est_total_final_salary) c_est_total_final_salary
  FROM {project}.safs_s275.assignment a
  JOIN {project}.safs_s275.report r ON (r.report_id = a.report_id)
  JOIN {project}.safs_s275.private_assignment pa ON (pa.assignment_id = a.assignment_id)
  WHERE r.ccddd = {ccddd}
  GROUP BY r.class_of, a.school_code, a.duty_root_code, a.duty_suffix_code
),

distinct_teachers AS (
  SELECT DISTINCT r.class_of, a.school_code, a.report_employee_id
  FROM {project}.safs_s275.assignment a
  JOIN {project}.safs_s275.report r ON (r.report_id = a.report_id)
  WHERE r.ccddd = {ccddd}
    AND a.duty_root_code in (31, 32)
),

classroom_teacher_stats AS (
  -- Experience percentiles are the exact order statistic over the per-person
  -- experience values: the ceil(q/100*n)-th smallest (empirical-CDF
  -- definition). Deterministic; APPROX_QUANTILES is a sketch and is not.
  SELECT
    t.class_of,
    t.school_code,
    IF(ARRAY_LENGTH(ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years)) = 0, NULL,
       ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years)
         [OFFSET(CAST(CEIL(50 / 100.0 * ARRAY_LENGTH(ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years))) AS INT64) - 1)]
      ) AS class_teacher_exp_p50,
    IF(ARRAY_LENGTH(ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years)) = 0, NULL,
       ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years)
         [OFFSET(CAST(CEIL(80 / 100.0 * ARRAY_LENGTH(ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years))) AS INT64) - 1)]
      ) AS class_teacher_exp_p80,
    AVG(re.experience_years) class_teacher_exp_avg,
    count(t.report_employee_id) num_class_teachers,
    SUM(CASE WHEN re.highest_degree = "B" THEN 1 ELSE 0 END) num_class_teachers_bachelors,
    SUM(CASE WHEN re.highest_degree = "M" THEN 1 ELSE 0 END) num_class_teachers_masters,
    SUM(CASE WHEN re.highest_degree = "D" THEN 1 ELSE 0 END) num_class_teachers_doctors
  FROM distinct_teachers t
  LEFT JOIN {project}.safs_s275.report_employee re
    ON (re.report_employee_id = t.report_employee_id)
  GROUP BY t.class_of, t.school_code
),

class_teacher AS (
  SELECT
    t.class_of, t.school_code,
    sum(t.assignment_salary) class_teacher_assignment_salary,
    sum(t.fte) class_teacher_fte,
    sum(t.c_est_total_compensation) class_teacher_c_est_total_compensation,
    sum(t.c_est_total_final_salary) class_teacher_c_est_total_final_salary
  FROM duty_summary t
  WHERE t.duty_root_code in (31, 32)
  GROUP BY t.class_of, t.school_code
),

aides AS (
  SELECT
    t.class_of, t.school_code,
    sum(t.assignment_salary) aide_assignment_salary,
    sum(t.fte) aide_fte,
    sum(t.c_est_total_compensation) aide_c_est_total_compensation,
    sum(t.c_est_total_final_salary) aide_c_est_total_final_salary
  FROM duty_summary t
  WHERE t.duty_root_code in (91)
  GROUP BY t.class_of, t.school_code
),

other_teacher AS (
  SELECT
    t.class_of, t.school_code,
    sum(t.assignment_salary) other_teacher_assignment_salary,
    sum(t.fte) other_teacher_fte,
    sum(t.c_est_total_compensation) other_teacher_c_est_total_compensation,
    sum(t.c_est_total_final_salary) other_teacher_c_est_total_final_salary
  FROM duty_summary t
  WHERE t.duty_root_code in (33, 34)
  GROUP BY t.class_of, t.school_code
),

principal AS (
  SELECT
    t.class_of, t.school_code,
    sum(t.assignment_salary) principal_assignment_salary,
    sum(t.c_est_total_compensation) principal_c_est_total_compensation,
    sum(t.c_est_total_final_salary) principal_c_est_total_final_salary
  FROM duty_summary t
  WHERE t.duty_root_code in (21, 23)
  GROUP BY t.class_of, t.school_code
),

distinct_principals AS (
  SELECT DISTINCT r.class_of, a.school_code, a.report_employee_id
  FROM {project}.safs_s275.assignment a
  JOIN {project}.safs_s275.report r ON (r.report_id = a.report_id)
  WHERE r.ccddd = {ccddd}
    AND a.duty_root_code in (21, 23)
),

principal_stats AS (
  SELECT
    t.class_of,
    t.school_code,
    IF(ARRAY_LENGTH(ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years)) = 0, NULL,
       ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years)
         [OFFSET(CAST(CEIL(50 / 100.0 * ARRAY_LENGTH(ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years))) AS INT64) - 1)]
      ) AS principal_exp_p50,
    IF(ARRAY_LENGTH(ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years)) = 0, NULL,
       ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years)
         [OFFSET(CAST(CEIL(80 / 100.0 * ARRAY_LENGTH(ARRAY_AGG(re.experience_years IGNORE NULLS ORDER BY re.experience_years))) AS INT64) - 1)]
      ) AS principal_exp_p80,
    AVG(re.experience_years) principal_exp_avg,
    count(t.report_employee_id) num_principal,
    SUM(CASE WHEN re.highest_degree = "B" THEN 1 ELSE 0 END) num_principal_bachelors,
    SUM(CASE WHEN re.highest_degree = "M" THEN 1 ELSE 0 END) num_principal_masters,
    SUM(CASE WHEN re.highest_degree = "D" THEN 1 ELSE 0 END) num_principal_doctors
  FROM distinct_principals t
  LEFT JOIN {project}.safs_s275.report_employee re
    ON (re.report_employee_id = t.report_employee_id)
  GROUP BY t.class_of, t.school_code
),

assistant_principal AS (
  SELECT
    t.class_of, t.school_code,
    sum(t.assignment_salary) asst_principal_assignment_salary,
    sum(t.fte) asst_principal_fte,
    sum(t.c_est_total_compensation) asst_principal_c_est_total_compensation,
    sum(t.c_est_total_final_salary) asst_principal_c_est_total_final_salary
  FROM duty_summary t
  WHERE t.duty_root_code in (22, 24)
  GROUP BY t.class_of, t.school_code
),

counselor AS (
  SELECT
    t.class_of, t.school_code,
    sum(t.assignment_salary) counselor_assignment_salary,
    sum(t.fte) counselor_fte,
    sum(t.c_est_total_compensation) counselor_c_est_total_compensation,
    sum(t.c_est_total_final_salary) counselor_c_est_total_final_salary
  FROM duty_summary t
  WHERE t.duty_root_code in (42, 44)
  GROUP BY t.class_of, t.school_code
),

librarian AS (
  SELECT
    t.class_of, t.school_code,
    sum(t.assignment_salary) librarian_assignment_salary,
    sum(t.fte) librarian_fte,
    sum(t.c_est_total_compensation) librarian_c_est_total_compensation,
    sum(t.c_est_total_final_salary) librarian_c_est_total_final_salary
  FROM duty_summary t
  WHERE t.duty_root_code in (41)
  GROUP BY t.class_of, t.school_code
),

all_roles AS (
  SELECT
    t.class_of, t.school_code,
    sum(t.assignment_salary) assignment_salary,
    sum(t.fte) fte,
    sum(t.c_est_total_compensation) c_est_total_compensation,
    sum(t.c_est_total_final_salary) c_est_total_final_salary
  FROM duty_summary t
  GROUP BY t.class_of, t.school_code
),

s275_school_summary AS (
  SELECT
    t.*,
    c.* EXCEPT (class_of, school_code),
    dts.* EXCEPT (class_of, school_code),
    a.* EXCEPT (class_of, school_code),
    o.* EXCEPT (class_of, school_code),
    p.* EXCEPT (class_of, school_code),
    ps.* EXCEPT (class_of, school_code),
    ap.* EXCEPT (class_of, school_code),
    co.* EXCEPT (class_of, school_code),
    l.* EXCEPT (class_of, school_code)
  FROM all_roles t
  LEFT OUTER JOIN class_teacher c ON (t.class_of = c.class_of AND t.school_code = c.school_code)
  LEFT OUTER JOIN aides a ON (t.class_of = a.class_of AND t.school_code = a.school_code)
  LEFT OUTER JOIN other_teacher o ON (t.class_of = o.class_of AND t.school_code = o.school_code)
  LEFT OUTER JOIN principal p ON (t.class_of = p.class_of AND t.school_code = p.school_code)
  LEFT OUTER JOIN assistant_principal ap ON (t.class_of = ap.class_of AND t.school_code = ap.school_code)
  LEFT OUTER JOIN counselor co ON (t.class_of = co.class_of AND t.school_code = co.school_code)
  LEFT OUTER JOIN librarian l ON (t.class_of = l.class_of AND t.school_code = l.school_code)
  LEFT OUTER JOIN classroom_teacher_stats dts ON (dts.class_of = t.class_of AND dts.school_code = t.school_code)
  LEFT OUTER JOIN principal_stats ps ON (ps.class_of = t.class_of AND ps.school_code = t.school_code)
),

-- ================================ vitals_org ===============================

vitals_org AS (
SELECT
  t.class_of,
  t.school_code,
  ds.type,
  ds.is_regular,
  ds.region,
  ds.ms_assignment_code,
  ds.ms_assignment,

  (e.comp_amount + e.non_comp_amount) total_spend,
  (e.comp_amount_gen_ed + e.non_comp_amount_gen_ed) total_spend_gen_ed,
  (e.comp_amount_spec_ed + e.non_comp_amount_spec_ed) total_spend_spec_ed,
  (e.comp_amount_compensatory + e.non_comp_amount_compensatory) total_spend_compensatory,
  (e.comp_amount_lap + e.non_comp_amount_lap) total_spend_lap,
  (e.comp_amount_title1 + e.non_comp_amount_title1) total_spend_title1,
  (e.comp_amount_ble + e.non_comp_amount_ble) total_spend_ble,
  (e.comp_amount_instr_other + e.non_comp_amount_instr_other) total_spend_instr_other,
  (e.comp_amount_district_support + e.non_comp_amount_district_support) total_spend_district_support,
  (e.comp_amount_other + e.non_comp_amount_other) total_spend_other,
  (e.comp_amount_voc + e.non_comp_amount_voc) total_spend_voc,

  (e.comp_amount + e.non_comp_amount) / NULLIF(t.all_students_k12, 0) spend_per_pupil_k12,
  (e.comp_amount_gen_ed + e.non_comp_amount_gen_ed) / NULLIF(t.all_students_k12, 0) spend_gen_ed_per_pupil_k12,
  (e.comp_amount_spec_ed + e.non_comp_amount_spec_ed) / NULLIF(t.all_students_k12, 0) spend_spec_ed_per_pupil_k12,
  (e.comp_amount_compensatory + e.non_comp_amount_compensatory) / NULLIF(t.all_students_k12, 0) spend_compensatory_per_pupil_k12,
  (e.comp_amount_lap + e.non_comp_amount_lap) / NULLIF(t.all_students_k12, 0) spend_lap_per_pupil_k12,
  (e.comp_amount_title1 + e.non_comp_amount_title1) / NULLIF(t.all_students_k12, 0) spend_title1_per_pupil_k12,
  (e.comp_amount_ble + e.non_comp_amount_ble) / NULLIF(t.all_students_k12, 0) spend_ble_per_pupil_k12,
  (e.comp_amount_instr_other + e.non_comp_amount_instr_other) / NULLIF(t.all_students_k12, 0) spend_instr_other_per_pupil_k12,
  (e.comp_amount_district_support + e.non_comp_amount_district_support) / NULLIF(t.all_students_k12, 0) spend_district_support_per_pupil_k12,
  (e.comp_amount_other + e.non_comp_amount_other) / NULLIF(t.all_students_k12, 0) spend_other_per_pupil_k12,
  (e.comp_amount_voc + e.non_comp_amount_voc) / NULLIF(t.all_students_k12, 0) spend_voc_per_pupil_k12,

  (ss.fte) / NULLIF(t.all_students_k12, 0) fte_per_pupil_k12,
  t.* except (ccddd, school_code, class_of),
  e.* except (school_code, class_of),
  ss.* except (school_code, class_of)

FROM demographics_by_school t

LEFT OUTER JOIN exp_by_school e ON (e.class_of = t.class_of AND e.school_code = t.school_code)
LEFT OUTER JOIN s275_school_summary ss ON (ss.class_of = t.class_of AND ss.school_code = t.school_code)
LEFT OUTER JOIN {project}.safs_domains.d_school ds ON (ds.ccddd = {ccddd} AND ds.school_code = t.school_code)
)
