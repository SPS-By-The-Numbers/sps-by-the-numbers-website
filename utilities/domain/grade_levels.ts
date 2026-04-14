export type GradeLevelInfo = {
  grade_level_code: number;
  db_grade_level_code: string;
  grade_level: string;
};

// Keep in sync with CASE statement in functions/src/finance.ts getAssessment()
const ALL_GRADE_LEVELS : Array<GradeLevelInfo> = [
  {
    grade_level_code: 99,
    db_grade_level_code: "All Grades",
    grade_level: "All Grades",
  },
  {
    grade_level_code: 98,
    db_grade_level_code: "KG",
    grade_level: "K",
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
