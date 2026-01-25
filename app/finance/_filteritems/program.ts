import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";

const PROG_1 = makeLeafNode("prog", 1, "Basic Education");
const PROG_2 = makeLeafNode(
  "prog",
  2,
  "Basic Education - Alternative learning Experience",
);
const PROG_3 = makeLeafNode(
  "prog",
  3,
  "Basic Education - Dropout Reengagement",
);
const PROG_75 = makeLeafNode("prog", 75, "Professional Development - State");
const PROG_21 = makeLeafNode(
  "prog",
  21,
  "Special Education - Supplemental - State",
);
const PROG_23 = makeLeafNode(
  "prog",
  23,
  "Special Edication - ARP - IDEA - Federal",
);
const PROG_24 = makeLeafNode(
  "prog",
  24,
  "Special Education - Supplemental - Federal",
);
const PROG_22 = makeLeafNode(
  "prog",
  22,
  "Special Education - Infants and Toddlers - State",
);
const PROG_25 = makeLeafNode(
  "prog",
  25,
  "Special Education - Infants and Toddlers - Federal",
);
const PROG_26 = makeLeafNode(
  "prog",
  26,
  "Special Education - Institutions - State",
);
const PROG_29 = makeLeafNode("prog", 29, "Special Education - Other - Federal");
const PROG_51 = makeLeafNode("prog", 51, "ESEA Disadvantaged - Federal");
const PROG_52 = makeLeafNode(
  "prog",
  52,
  "Other Title Grants Under ESEA (School Improvement)",
);
const PROG_53 = makeLeafNode("prog", 53, "ESEA Migrant - Federal");
const PROG_56 = makeLeafNode(
  "prog",
  56,
  "State Institutions, Centers, and Homes - Delinquent",
);
const PROG_57 = makeLeafNode(
  "prog",
  57,
  "State Institutions - Neglected and Delinquent - Federal",
);
const PROG_58 = makeLeafNode("prog", 58, "Special and Pilot Programs - State");
const PROG_61 = makeLeafNode("prog", 61, "Head Start - Federal");
const PROG_64 = makeLeafNode(
  "prog",
  64,
  "Limited English Proficiency - Federal",
);
const PROG_68 = makeLeafNode("prog", 68, "Indian Education - Federal - ED");
const PROG_69 = makeLeafNode("prog", 69, "Compensatory - Other");
const PROG_54 = makeLeafNode("prog", 54, "Reading First - Federal");
const PROG_59 = makeLeafNode(
  "prog",
  59,
  "Institutions - Juveniles in Adult Jails",
);
const PROG_62 = makeLeafNode(
  "prog",
  62,
  "Math and Science - Professional Development - Federal",
);
const PROG_67 = makeLeafNode("prog", 67, "Indian Education - Federal - JOM");
const PROG_97 = makeLeafNode("prog", 97, "Districtwide Support");
const PROG_99 = makeLeafNode("prog", 99, "Pupil Transportation");
const PROG_98 = makeLeafNode("prog", 98, "School Food Services");
const PROG_55 = makeLeafNode(
  "prog",
  55,
  "Learning Assistance Program (LAP) - State",
);
const PROG_76 = makeLeafNode("prog", 76, "Targeted Assistance - Federal");
const PROG_9 = makeLeafNode("prog", 9, "Transition to Kindergarten");
const PROG_65 = makeLeafNode("prog", 65, "Transitional Bilingual - State");
const PROG_0 = makeLeafNode("prog", 0, "[pseudo] Unrestricted");
const PROG_18 = makeLeafNode("prog", 18, "Special Purpose - Reserved");
const PROG_11 = makeLeafNode(
  "prog",
  11,
  "Special Purpose - SLFRF Enrollment Stabilization",
);
const PROG_12 = makeLeafNode("prog", 12, "Special Purpose - ESSER II");
const PROG_13 = makeLeafNode("prog", 13, "Special Purpose - ESSER III");
const PROG_14 = makeLeafNode(
  "prog",
  14,
  "Special Purpose - ESSER III - Learning Loss",
);
const PROG_19 = makeLeafNode("prog", 19, "Special Purpose - CARES Act Other");
const PROG_81 = makeLeafNode("prog", 81, "Public Radio and Television");
const PROG_89 = makeLeafNode("prog", 89, "Other Community Services");
const PROG_88 = makeLeafNode("prog", 88, "Child Care");
const PROG_86 = makeLeafNode("prog", 86, "Community Schools");
const PROG_73 = makeLeafNode("prog", 73, "Summer School");
const PROG_74 = makeLeafNode("prog", 74, "Highly Capable");
const PROG_79 = makeLeafNode("prog", 79, "Instructional Programs - Other");
const PROG_71 = makeLeafNode("prog", 71, "Traffic Safety");
const PROG_45 = makeLeafNode("prog", 45, "Skills Center - Basic - State");
const PROG_46 = makeLeafNode("prog", 46, "Skills Center - Federal");
const PROG_47 = makeLeafNode("prog", 47, "Skills Center - Facility Upgrades");
const PROG_31 = makeLeafNode("prog", 31, "Vocational - Basic - State");
const PROG_34 = makeLeafNode(
  "prog",
  34,
  "Middle School Career and Technical Education - State",
);
const PROG_39 = makeLeafNode("prog", 39, "Vocational - Other Categorical");
const PROG_38 = makeLeafNode("prog", 38, "Vocational - Federal");
const PROG_78 = makeLeafNode("prog", 78, "Youth Training Programs - Federal");
const PROG_83 = makeLeafNode(
  "prog",
  83,
  "Adult Education, Basic, State - deleted FY 00-01",
);
const PROG_84 = makeLeafNode(
  "prog",
  84,
  "Adult Basic Education, Federal - deleted FY 00-01",
);
const PROG_85 = makeLeafNode(
  "prog",
  85,
  "Adult Job Training, Federal - deleted FY 00-01",
);
const PROG_92 = makeLeafNode("prog", 92, "Debt Service - deleted FY 00-01");
const PROG_27 = makeLeafNode("prog", 27, "Deleted");
const PROG_28 = makeLeafNode("prog", 28, "Deleted");
const PROG_77 = makeLeafNode(
  "prog",
  77,
  "Eisenhower Professional Development, Federal -deleted FY 05-06",
);
const PROG_94 = makeLeafNode(
  "prog",
  94,
  "Instruction Support - deleted FY 00-01",
);
const PROG_63 = makeLeafNode(
  "prog",
  63,
  "Promoting Academic Success Added FY 05-06 F-196 (formerly Better Schools-Staff Dev.)-State - added FY 00-01 - deleted FY 02-03",
);
const PROG_41 = makeLeafNode(
  "prog",
  41,
  "Skill Center Projects - deleted FY 00-01",
);
const PROG_49 = makeLeafNode(
  "prog",
  49,
  "Skill Center, Other Categorical - deleted FY 02-03",
);
const PROG_66 = makeLeafNode(
  "prog",
  66,
  "Student Achievement-State - added FY 01-02 - Deleted 13-14",
);

// Groupings match the OSPI Accounting Manual.
const ProgramFilterTree = makeInternalNode("program", "All Programs", [
  makeInternalNode("regular-instruction", "Regular Instruction", [
    PROG_1,
    PROG_2,
    PROG_3,
    PROG_9,
    PROG_75,
  ]),
  makeInternalNode("special-education-sps", "Special Education", [
    PROG_21,
    PROG_22,
    PROG_23,
    PROG_24,
    PROG_25,
    PROG_26,
    PROG_29,
  ]),
  makeInternalNode("vocational-sps", "Vocational", [
    PROG_31,
    PROG_34,
    PROG_38,
    PROG_39,
  ]),
  makeInternalNode("skills-center-sps", "Skills Center", [
    PROG_45,
    PROG_46,
    PROG_47,
  ]),
  makeInternalNode("compensatory", "Compensatory Education Instruction", [
    PROG_51,
    PROG_52,
    PROG_53,
    PROG_54,
    PROG_55,
    PROG_56,
    PROG_57,
    PROG_58,
    PROG_59,
    PROG_61,
    PROG_62,
    PROG_64,
    PROG_65,
    PROG_68,
    PROG_67,
    PROG_69,
  ]),
  makeInternalNode("other-instructional", "Other Instructional Program", [
    PROG_71,
    PROG_73,
    PROG_74,
    PROG_76,
    PROG_78,
    PROG_79,
  ]),
  makeInternalNode("community_services", "Community Services", [
    PROG_81,
    PROG_86,
    PROG_88,
    PROG_89,
  ]),
  makeInternalNode("support", "Support Services", [PROG_97, PROG_99, PROG_98]),
  makeInternalNode("misc", "Unrestricted, Reserved, Covid", [
    PROG_0,
    PROG_18,
    makeInternalNode("covid", "Covid", [
      PROG_11,
      PROG_12,
      PROG_13,
      PROG_14,
      PROG_19,
    ]),
  ]),
  makeInternalNode("obsolete", "Obsolete", [
    PROG_83,
    PROG_84,
    PROG_85,
    PROG_92,
    PROG_27,
    PROG_28,
    PROG_77,
    PROG_94,
    PROG_63,
    PROG_41,
    PROG_49,
    PROG_66,
  ]),
]);

const ProgramFilter = new Filter(ProgramFilterTree);

export default ProgramFilter;
