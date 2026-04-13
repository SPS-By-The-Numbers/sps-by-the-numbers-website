export type AssessmentTypeInfo = {
  test_administration_code: number;
  test_administration: string;
};

const ALL_ASSESSMENT_TYPES : Array<AssessmentTypeInfo> = [
  {
    test_administration_code: 1,
    test_administration: "SBAC",
  },
  {
    test_administration_code: 2,
    test_administration: "AIM",
  },
  {
    test_administration_code: 3,
    test_administration: "ELPA",
  },
  {
    test_administration_code: 4,
    test_administration: "EOC",
  },
  {
    test_administration_code: 5,
    test_administration: "MSPHSPE",
  },
  {
    test_administration_code: 6,
    test_administration: "WCAS",
  },
  {
    test_administration_code: 7,
    test_administration: "WIDA",
  },
  {
    test_administration_code: 8,
    test_administration: "WIDAACC",
  },
];

export default ALL_ASSESSMENT_TYPES;
