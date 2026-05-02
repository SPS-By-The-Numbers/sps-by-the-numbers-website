// Maps the wide-format rc_enrollment columns to user-facing student-group
// codes so the dashboard can present them as a checkbox-tree filter.
// Codes are local to enrollment (separate space from the assessment-side
// student-group codes) — see app/finance/_filteritems/enrollment_student_group.ts
// for the filter wiring.
export type EnrollmentStudentGroupInfo = {
  student_group_code: number;
  column: string;
  student_group_type: string;
  student_group: string;
};

const ALL_ENROLLMENT_STUDENT_GROUPS: Array<EnrollmentStudentGroupInfo> = [
  { student_group_code: 1, column: "all_students", student_group_type: "All", student_group: "All Students" },

  { student_group_code: 2, column: "female", student_group_type: "Gender", student_group: "Female" },
  { student_group_code: 3, column: "male", student_group_type: "Gender", student_group: "Male" },
  { student_group_code: 4, column: "gender_x", student_group_type: "Gender", student_group: "Gender X" },

  { student_group_code: 5, column: "american_indian_alaskan_native", student_group_type: "Race", student_group: "American Indian / Alaskan Native" },
  { student_group_code: 6, column: "asian", student_group_type: "Race", student_group: "Asian" },
  { student_group_code: 7, column: "black_african_american", student_group_type: "Race", student_group: "Black / African American" },
  { student_group_code: 8, column: "hispanic_latino_of_any_race", student_group_type: "Race", student_group: "Hispanic / Latino of any race" },
  { student_group_code: 9, column: "native_hawaiian_other_pacific", student_group_type: "Race", student_group: "Native Hawaiian / Other Pacific Islander" },
  { student_group_code: 10, column: "two_or_more_races", student_group_type: "Race", student_group: "Two or More Races" },
  { student_group_code: 11, column: "white", student_group_type: "Race", student_group: "White" },

  { student_group_code: 12, column: "english_language_learners", student_group_type: "Learning Type", student_group: "English Language Learners" },
  { student_group_code: 13, column: "students_with_disabilities", student_group_type: "Learning Type", student_group: "Students With Disabilities" },
  { student_group_code: 14, column: "section_504", student_group_type: "Learning Type", student_group: "Section 504" },
  { student_group_code: 15, column: "highly_capable", student_group_type: "Learning Type", student_group: "Highly Capable" },

  { student_group_code: 16, column: "low_income", student_group_type: "Living Situation", student_group: "Low Income" },
  { student_group_code: 17, column: "homeless", student_group_type: "Living Situation", student_group: "Homeless" },
  { student_group_code: 18, column: "foster_care", student_group_type: "Living Situation", student_group: "Foster Care" },
  { student_group_code: 19, column: "migrant", student_group_type: "Living Situation", student_group: "Migrant" },
  { student_group_code: 20, column: "military_parent", student_group_type: "Living Situation", student_group: "Military Parent" },
  { student_group_code: 21, column: "mobile", student_group_type: "Living Situation", student_group: "Mobile" },
];

export default ALL_ENROLLMENT_STUDENT_GROUPS;
