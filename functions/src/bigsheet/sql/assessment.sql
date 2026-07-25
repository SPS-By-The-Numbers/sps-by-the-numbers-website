-- Assessment source for the bigsheet endpoint: OSPI report-card assessment
-- results, district-wide 'All Grades' rows only, one row per (class_of,
-- school_code, test_administration, test_subject, student_group).
-- Placeholders: {project}, {ccddd}.
--
-- The two derived columns are recomputed from the pct_met_standard string:
--   pct_met_standard_numeric       -- percent as a fraction; bounded markers
--                                     ("<10%", ">90%") ARE converted, using the
--                                     bound itself. NULL for suppression
--                                     markers ("Suppressed: N<10", "N<10",
--                                     "No Students", "N<10 (Count Protected)").
--   pct_met_standard_numeric_nodat -- same, but bounded markers are ALSO NULL,
--                                     so only exact percentages survive.
SELECT
  class_of,
  school_code,
  test_administration,
  test_subject,
  student_group,
  pct_noscore,
  pct_alternative,
  SAFE_CAST(REGEXP_EXTRACT(TRIM(pct_met_standard),
                           r'^[<>]?\s*([0-9]+(?:\.[0-9]+)?)\s*%$')
            AS FLOAT64) / 100 AS pct_met_standard_numeric,
  SAFE_CAST(REGEXP_EXTRACT(TRIM(pct_met_standard),
                           r'^([0-9]+(?:\.[0-9]+)?)\s*%$')
            AS FLOAT64) / 100 AS pct_met_standard_numeric_nodat
FROM {project}.ospi.rc_assessment
WHERE ccddd = {ccddd}
  AND grade_level = 'All Grades'
