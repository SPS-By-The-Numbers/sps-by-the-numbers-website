export type StudentGroupInfo = {
  student_group_code: number;
  student_group_type: string;
  student_group: string;
};

const ALL_STUDENT_GROUPS : Array<StudentGroupInfo> = [
  {
    student_group_code: 1,
    student_group_type: "All",
    student_group: "All Students",
  },
  {
    student_group_code: 2,
    student_group_type: "Race",
    student_group: "American Indian/ Alaskan Native",
  },
  {
    student_group_code: 3,
    student_group_type: "Race",
    student_group: "Asian",
  },
  {
    student_group_code: 4,
    student_group_type: "Race",
    student_group: "Black/ African American",
  },
  {
    student_group_code: 5,
    student_group_type: "Race",
    student_group: "Hispanic/ Latino of any race(s)",
  },
  {
    student_group_code: 6,
    student_group_type: "Race",
    student_group: "Native Hawaiian/ Other Pacific Islander",
  },
  {
    student_group_code: 7,
    student_group_type: "Race",
    student_group: "Two Or More Races",
  },
  {
    student_group_code: 8,
    student_group_type: "Race",
    student_group: "White",
  },
  {
    student_group_code: 9,
    student_group_type: "Gender",
    student_group: "Female",
  },
  {
    student_group_code: 10,
    student_group_type: "Gender",
    student_group: "Gender X",
  },
  {
    student_group_code: 11,
    student_group_type: "Gender",
    student_group: "Male",
  },
  {
    student_group_code: 12,
    student_group_type: "ELL",
    student_group: "English Language Learners",
  },
  {
    student_group_code: 13,
    student_group_type: "ELL",
    student_group: "Non-English Language Learners",
  },
  {
    student_group_code: 14,
    student_group_type: "FRL",
    student_group: "Low-Income",
  },
  {
    student_group_code: 15,
    student_group_type: "FRL",
    student_group: "Non-Low-Income",
  },
  {
    student_group_code: 16,
    student_group_type: "SWD",
    student_group: "Students with Disabilities",
  },
  {
    student_group_code: 17,
    student_group_type: "SWD",
    student_group: "Non-Students with Disabilities",
  },
  {
    student_group_code: 18,
    student_group_type: "s504",
    student_group: "Section 504",
  },
  {
    student_group_code: 19,
    student_group_type: "s504",
    student_group: "Non-Section 504",
  },
  {
    student_group_code: 20,
    student_group_type: "Foster",
    student_group: "Foster Care",
  },
  {
    student_group_code: 21,
    student_group_type: "Foster",
    student_group: "Non-Foster Care",
  },
  {
    student_group_code: 22,
    student_group_type: "homeless",
    student_group: "Homeless",
  },
  {
    student_group_code: 23,
    student_group_type: "homeless",
    student_group: "Non-Homeless",
  },
  {
    student_group_code: 24,
    student_group_type: "Migrant",
    student_group: "Migrant",
  },
  {
    student_group_code: 25,
    student_group_type: "Migrant",
    student_group: "Non-Migrant",
  },
  {
    student_group_code: 26,
    student_group_type: "Military",
    student_group: "Military Parent",
  },
  {
    student_group_code: 27,
    student_group_type: "Military",
    student_group: "Non-Military Parent",
  },
  {
    student_group_code: 28,
    student_group_type: "Military",
    student_group: "Unknown",
  },
];

export default ALL_STUDENT_GROUPS;
