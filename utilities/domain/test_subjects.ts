export type TestSubjectInfo = {
  test_subject_code: number;
  test_subject: string;
};

const ALL_TEST_SUBJECTS : Array<TestSubjectInfo> = [
  {
    test_subject_code: 1,
    test_subject: "ELA",
  },
  {
    test_subject_code: 2,
    test_subject: "Math",
  },
  {
    test_subject_code: 3,
    test_subject: "Science",
  },
  {
    test_subject_code: 4,
    test_subject: "Biology",
  },
  {
    test_subject_code: 5,
    test_subject: "ELPA",
  },
  {
    test_subject_code: 6,
    test_subject: "WIDA",
  },
  {
    test_subject_code: 7,
    test_subject: "WIDAACC",
  },
];

export default ALL_TEST_SUBJECTS;
