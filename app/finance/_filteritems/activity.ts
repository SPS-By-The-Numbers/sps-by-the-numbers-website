import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";

const ACT_11 = makeLeafNode("act", 11, "Board of Directors");
const ACT_12 = makeLeafNode("act", 12, "Superintendent's Office");
const ACT_13 = makeLeafNode("act", 13, "Business Office");
const ACT_14 = makeLeafNode("act", 14, "Human Resources");
const ACT_15 = makeLeafNode("act", 15, "Public Relations");
const ACT_21 = makeLeafNode("act", 21, "Supervision - Instruction");
const ACT_41 = makeLeafNode("act", 41, "Supervision - Food Service");
const ACT_51 = makeLeafNode("act", 51, "Supervision - Transportation");
const ACT_61 = makeLeafNode(
  "act",
  61,
  "Supervision - Maintenance and Operations",
);
const ACT_42 = makeLeafNode("act", 42, "Food");
const ACT_44 = makeLeafNode("act", 44, "Operations - Food Service");
const ACT_52 = makeLeafNode("act", 52, "Operations - Transportation");
const ACT_58 = makeLeafNode("act", 58, "Remote Learning Operations");
const ACT_59 = makeLeafNode("act", 59, "Transfers - Transportation");
const ACT_62 = makeLeafNode("act", 62, "Grounds Maintenance");
const ACT_63 = makeLeafNode("act", 63, "Operations of Buildings");
const ACT_64 = makeLeafNode("act", 64, "Maintenance");
const ACT_65 = makeLeafNode("act", 65, "Utilities");
const ACT_67 = makeLeafNode("act", 67, "Building and Property Security");
const ACT_68 = makeLeafNode(
  "act",
  68,
  "Insurance - Maintenance and Operations",
);
const ACT_72 = makeLeafNode("act", 72, "Informational Systems");
const ACT_73 = makeLeafNode("act", 73, "Printing");
const ACT_74 = makeLeafNode("act", 74, "Warehousing and Distribution");
const ACT_75 = makeLeafNode("act", 75, "Motor pool");
const ACT_91 = makeLeafNode("act", 91, "Public Activities");
const ACT_9991 = makeLeafNode("act", 9991, "Principal's Office / Principal");
const ACT_9990 = makeLeafNode("act", 9990, "Teaching / Professional Learning");
const ACT_28 = makeLeafNode("act", 28, "Extracurricular");
const ACT_22 = makeLeafNode("act", 22, "Learning Resources");
const ACT_24 = makeLeafNode("act", 24, "Guidance and Counseling");
const ACT_25 = makeLeafNode("act", 25, "Pupil Management and Safety");
const ACT_26 = makeLeafNode("act", 26, "Health and Related Services");
const ACT_31 = makeLeafNode(
  "act",
  31,
  "Instructional Professional Development",
);
const ACT_32 = makeLeafNode("act", 32, "Instructional Technology");
const ACT_33 = makeLeafNode("act", 33, "Curriculum");
const ACT_34 = makeLeafNode("act", 34, "Professional Learning - State");
const ACT_35 = makeLeafNode("act", 35, "Pupil Safety");
const ACT_85 = makeLeafNode("act", 85, "Debt Service");
const ACT_56 = makeLeafNode("act", 56, "Insurance - Transportation");
const ACT_83 = makeLeafNode("act", 83, "Interest");
const ACT_53 = makeLeafNode("act", 53, "Maintenance - Transportation");
const ACT_29 = makeLeafNode("act", 29, "Payments to School Districts");
const ACT_49 = makeLeafNode("act", 49, "Transfers - Food Service");

const ActivityFilterTree = makeInternalNode("activity", "All Activities", [
  makeInternalNode("teaching", "Teaching", [ACT_9990, ACT_28]),
  makeInternalNode("student-support", "Student Support", [
    ACT_9991,
    ACT_24,
    ACT_25,
    ACT_26,
    ACT_35,
  ]),
  makeInternalNode("building-support", "Building Support", [
    ACT_62,
    ACT_63,
    ACT_64,
    ACT_65,
    ACT_67,
    ACT_68,
  ]),
  makeInternalNode("other", "Other", [
    makeInternalNode("central-admin", "Central Administration", [
      ACT_11,
      ACT_12,
      ACT_13,
      ACT_14,
      ACT_15,
      ACT_21,
      ACT_61,
    ]),
    makeInternalNode("technology", "Technology", [ACT_32, ACT_72]),
    makeInternalNode("classroom-resources", "Classroom Resources", [
      ACT_22,
      ACT_33,
    ]),
    makeInternalNode("teaching-support", "Teacher Training", [ACT_31, ACT_34]),
    makeInternalNode("food", "Food Services", [ACT_41, ACT_42, ACT_44]),
    makeInternalNode("transportation", "Transportation", [
      ACT_51,
      ACT_52,
      ACT_59,
    ]),
    makeInternalNode("other-support", "Other Support Activities", [
      ACT_58,
      ACT_73,
      ACT_74,
      ACT_75,
      ACT_91,
    ]),
    makeInternalNode("uncat", "[uncat] - Debt Service", [
      ACT_85,
      ACT_56,
      ACT_83,
      ACT_53,
      ACT_29,
      ACT_49,
    ]),
  ]),
]);

const SpsActivityFilterTree = makeInternalNode("activity", "All Activities", [
  makeInternalNode("central-admin", "Central Administration", [
    ACT_11,
    ACT_12,
    ACT_13,
    ACT_14,
    ACT_15,
    ACT_21,
    ACT_41,
    ACT_51,
    ACT_61,
  ]),
  makeInternalNode("other-support", "Other Support Activities", [
    ACT_42,
    ACT_44,
    ACT_52,
    ACT_58,
    ACT_59,
    ACT_62,
    ACT_63,
    ACT_64,
    ACT_65,
    ACT_67,
    ACT_68,
    ACT_72,
    ACT_73,
    ACT_74,
    ACT_75,
    ACT_91,
  ]),
  ACT_9991,
  makeInternalNode("teaching", "Teaching", [ACT_9990, ACT_28]),
  makeInternalNode("teaching-support", "Teaching Support", [
    ACT_22,
    ACT_24,
    ACT_25,
    ACT_26,
    ACT_31,
    ACT_32,
    ACT_33,
    ACT_34,
    ACT_35,
  ]),
  makeInternalNode("other", "[uncat] - Debt Service", [
    ACT_85,
    ACT_56,
    ACT_83,
    ACT_53,
    ACT_29,
    ACT_49,
  ]),
]);

const ActivityFilter = new Filter(ActivityFilterTree);
const SpsActivityFilter = new Filter(SpsActivityFilterTree);

export default ActivityFilter;
