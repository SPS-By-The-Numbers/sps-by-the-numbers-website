import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
const ITEM_PREFIX = "prog";

const PROG_1 = makeLeafNode(ITEM_PREFIX, 1, "Basic Education");
const PROG_2 = makeLeafNode(
  ITEM_PREFIX,
  2,
  "Basic Education - Alternative learning Experience",
);
const PROG_3 = makeLeafNode(
  ITEM_PREFIX,
  3,
  "Basic Education - Dropout Reengagement",
);
const PROG_75 = makeLeafNode(ITEM_PREFIX, 75, "Professional Development - State");
const PROG_21 = makeLeafNode(
  ITEM_PREFIX,
  21,
  "Special Education - Supplemental - State",
);
const PROG_23 = makeLeafNode(
  ITEM_PREFIX,
  23,
  "Special Edication - ARP - IDEA - Federal",
);
const PROG_24 = makeLeafNode(
  ITEM_PREFIX,
  24,
  "Special Education - Supplemental - Federal",
);
const PROG_22 = makeLeafNode(
  ITEM_PREFIX,
  22,
  "Special Education - Infants and Toddlers - State",
);
const PROG_25 = makeLeafNode(
  ITEM_PREFIX,
  25,
  "Special Education - Infants and Toddlers - Federal",
);
const PROG_26 = makeLeafNode(
  ITEM_PREFIX,
  26,
  "Special Education - Institutions - State",
);
const PROG_29 = makeLeafNode(ITEM_PREFIX, 29, "Special Education - Other - Federal");
const PROG_51 = makeLeafNode(ITEM_PREFIX, 51, "ESEA Disadvantaged - Federal");
const PROG_52 = makeLeafNode(
  ITEM_PREFIX,
  52,
  "Other Title Grants Under ESEA (School Improvement)",
);
const PROG_53 = makeLeafNode(ITEM_PREFIX, 53, "ESEA Migrant - Federal");
const PROG_56 = makeLeafNode(
  ITEM_PREFIX,
  56,
  "State Institutions, Centers, and Homes - Delinquent",
);
const PROG_57 = makeLeafNode(
  ITEM_PREFIX,
  57,
  "State Institutions - Neglected and Delinquent - Federal",
);
const PROG_58 = makeLeafNode(ITEM_PREFIX, 58, "Special and Pilot Programs - State");
const PROG_61 = makeLeafNode(ITEM_PREFIX, 61, "Head Start - Federal");
const PROG_64 = makeLeafNode(
  ITEM_PREFIX,
  64,
  "Limited English Proficiency - Federal",
);
const PROG_68 = makeLeafNode(ITEM_PREFIX, 68, "Indian Education - Federal - ED");
const PROG_69 = makeLeafNode(ITEM_PREFIX, 69, "Compensatory - Other");
const PROG_54 = makeLeafNode(ITEM_PREFIX, 54, "Reading First - Federal");
const PROG_59 = makeLeafNode(
  ITEM_PREFIX,
  59,
  "Institutions - Juveniles in Adult Jails",
);
const PROG_62 = makeLeafNode(
  ITEM_PREFIX,
  62,
  "Math and Science - Professional Development - Federal",
);
const PROG_67 = makeLeafNode(ITEM_PREFIX, 67, "Indian Education - Federal - JOM");
const PROG_97 = makeLeafNode(ITEM_PREFIX, 97, "Districtwide Support");
const PROG_99 = makeLeafNode(ITEM_PREFIX, 99, "Pupil Transportation");
const PROG_98 = makeLeafNode(ITEM_PREFIX, 98, "School Food Services");
const PROG_55 = makeLeafNode(
  ITEM_PREFIX,
  55,
  "Learning Assistance Program (LAP) - State",
);
const PROG_76 = makeLeafNode(ITEM_PREFIX, 76, "Targeted Assistance - Federal");
const PROG_9 = makeLeafNode(ITEM_PREFIX, 9, "Transition to Kindergarten");
const PROG_65 = makeLeafNode(ITEM_PREFIX, 65, "Transitional Bilingual - State");
const PROG_0 = makeLeafNode(ITEM_PREFIX, 0, "[pseudo] Unrestricted");
const PROG_18 = makeLeafNode(ITEM_PREFIX, 18, "Special Purpose - Reserved");
const PROG_11 = makeLeafNode(
  ITEM_PREFIX,
  11,
  "Special Purpose - SLFRF Enrollment Stabilization",
);
const PROG_12 = makeLeafNode(ITEM_PREFIX, 12, "Special Purpose - ESSER II");
const PROG_13 = makeLeafNode(ITEM_PREFIX, 13, "Special Purpose - ESSER III");
const PROG_14 = makeLeafNode(
  ITEM_PREFIX,
  14,
  "Special Purpose - ESSER III - Learning Loss",
);
const PROG_19 = makeLeafNode(ITEM_PREFIX, 19, "Special Purpose - CARES Act Other");
const PROG_81 = makeLeafNode(ITEM_PREFIX, 81, "Public Radio and Television");
const PROG_89 = makeLeafNode(ITEM_PREFIX, 89, "Other Community Services");
const PROG_88 = makeLeafNode(ITEM_PREFIX, 88, "Child Care");
const PROG_86 = makeLeafNode(ITEM_PREFIX, 86, "Community Schools");
const PROG_73 = makeLeafNode(ITEM_PREFIX, 73, "Summer School");
const PROG_74 = makeLeafNode(ITEM_PREFIX, 74, "Highly Capable");
const PROG_79 = makeLeafNode(ITEM_PREFIX, 79, "Instructional Programs - Other");
const PROG_71 = makeLeafNode(ITEM_PREFIX, 71, "Traffic Safety");
const PROG_45 = makeLeafNode(ITEM_PREFIX, 45, "Skills Center - Basic - State");
const PROG_46 = makeLeafNode(ITEM_PREFIX, 46, "Skills Center - Federal");
const PROG_47 = makeLeafNode(ITEM_PREFIX, 47, "Skills Center - Facility Upgrades");
const PROG_31 = makeLeafNode(ITEM_PREFIX, 31, "Vocational - Basic - State");
const PROG_34 = makeLeafNode(
  ITEM_PREFIX,
  34,
  "Middle School Career and Technical Education - State",
);
const PROG_39 = makeLeafNode(ITEM_PREFIX, 39, "Vocational - Other Categorical");
const PROG_38 = makeLeafNode(ITEM_PREFIX, 38, "Vocational - Federal");
const PROG_78 = makeLeafNode(ITEM_PREFIX, 78, "Youth Training Programs - Federal");
const PROG_83 = makeLeafNode(
  ITEM_PREFIX,
  83,
  "Adult Education, Basic, State - deleted FY 00-01",
);
const PROG_84 = makeLeafNode(
  ITEM_PREFIX,
  84,
  "Adult Basic Education, Federal - deleted FY 00-01",
);
const PROG_85 = makeLeafNode(
  ITEM_PREFIX,
  85,
  "Adult Job Training, Federal - deleted FY 00-01",
);
const PROG_92 = makeLeafNode(ITEM_PREFIX, 92, "Debt Service - deleted FY 00-01");
const PROG_27 = makeLeafNode(ITEM_PREFIX, 27, "Deleted");
const PROG_28 = makeLeafNode(ITEM_PREFIX, 28, "Deleted");
const PROG_77 = makeLeafNode(
  ITEM_PREFIX,
  77,
  "Eisenhower Professional Development, Federal -deleted FY 05-06",
);
const PROG_94 = makeLeafNode(
  ITEM_PREFIX,
  94,
  "Instruction Support - deleted FY 00-01",
);
const PROG_63 = makeLeafNode(
  ITEM_PREFIX,
  63,
  "Promoting Academic Success Added FY 05-06 F-196 (formerly Better Schools-Staff Dev.)-State - added FY 00-01 - deleted FY 02-03",
);
const PROG_41 = makeLeafNode(
  ITEM_PREFIX,
  41,
  "Skill Center Projects - deleted FY 00-01",
);
const PROG_49 = makeLeafNode(
  ITEM_PREFIX,
  49,
  "Skill Center, Other Categorical - deleted FY 02-03",
);
const PROG_66 = makeLeafNode(
  ITEM_PREFIX,
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

const ProgramFilter = new Filter(ProgramFilterTree, ITEM_PREFIX);

export default ProgramFilter;
