export type GradeLevelInfo = {
  grade_level_code: number;
  db_grade_level_code: string;
  grade_level: string;
};

// Grade-span rollup codes. OSPI publishes one "All Grades" row per school,
// and in the ENROLLMENT file that row includes PK, so the enrollment data
// never exposes it under that name: functions/src/finance.ts getEnrollment()
// relabels OSPI's row "PK-12" and derives a "K-12" row by subtracting the PK
// row from it. The ASSESSMENT "All Grades" row spans the tested grades only
// (there are no PK tests), so it keeps OSPI's name and its own code.
export const GRADE_LEVEL_CODE_K12 = 96;
export const GRADE_LEVEL_CODE_PK12 = 95;
export const GRADE_LEVEL_CODE_ALL_GRADES = 99;

const GRADE_ROLLUP_CODES = new Set<number>([
  GRADE_LEVEL_CODE_K12,
  GRADE_LEVEL_CODE_PK12,
  GRADE_LEVEL_CODE_ALL_GRADES,
]);

/** True for the grade-span rollup rows (K-12, PK-12, assessment All Grades),
 * which must never be summed alongside the per-grade rows. */
export function isGradeRollupCode(code: number | null | undefined): boolean {
  return code !== null && code !== undefined && GRADE_ROLLUP_CODES.has(code);
}

// Keep in sync with the CASE statements in functions/src/finance.ts
// getEnrollment() and getAssessment().
const ALL_GRADE_LEVELS : Array<GradeLevelInfo> = [
  {
    // Assessments only: OSPI's rollup over the tested grades.
    grade_level_code: GRADE_LEVEL_CODE_ALL_GRADES,
    db_grade_level_code: "All Grades",
    grade_level: "All Grades",
  },
  {
    // Enrollment only, synthetic: OSPI's All Grades row minus its PK row.
    grade_level_code: GRADE_LEVEL_CODE_K12,
    db_grade_level_code: "K-12",
    grade_level: "K-12",
  },
  {
    // Enrollment only: OSPI's All Grades row as published (includes PK).
    grade_level_code: GRADE_LEVEL_CODE_PK12,
    db_grade_level_code: "PK-12",
    grade_level: "PK-12",
  },
  {
    grade_level_code: 98,
    db_grade_level_code: "KG",
    grade_level: "K",
  },
  {
    grade_level_code: 97,
    db_grade_level_code: "PK",
    grade_level: "PK",
  },
  {
    grade_level_code: 1,
    db_grade_level_code: "01",
    grade_level: "1",
  },
  {
    grade_level_code: 2,
    db_grade_level_code: "02",
    grade_level: "2",
  },
  {
    grade_level_code: 3,
    db_grade_level_code: "03",
    grade_level: "3",
  },
  {
    grade_level_code: 4,
    db_grade_level_code: "04",
    grade_level: "4",
  },
  {
    grade_level_code: 5,
    db_grade_level_code: "05",
    grade_level: "5",
  },
  {
    grade_level_code: 6,
    db_grade_level_code: "06",
    grade_level: "6",
  },
  {
    grade_level_code: 7,
    db_grade_level_code: "07",
    grade_level: "7",
  },
  {
    grade_level_code: 8,
    db_grade_level_code: "08",
    grade_level: "8",
  },
  {
    grade_level_code: 9,
    db_grade_level_code: "09",
    grade_level: "9",
  },
  {
    grade_level_code: 10,
    db_grade_level_code: "10",
    grade_level: "10",
  },
  {
    grade_level_code: 11,
    db_grade_level_code: "11",
    grade_level: "11",
  },
  {
    grade_level_code: 12,
    db_grade_level_code: "12",
    grade_level: "12",
  },
];

export default ALL_GRADE_LEVELS;
