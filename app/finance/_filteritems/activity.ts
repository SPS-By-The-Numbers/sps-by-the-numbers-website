import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import * as DistrictData from "utilities/DistrictData";
const ITEM_PREFIX = "act";

const ACT_11 = makeLeafNode(ITEM_PREFIX, 11, "Board of Directors");
const ACT_12 = makeLeafNode(ITEM_PREFIX, 12, "Superintendent's Office");
const ACT_13 = makeLeafNode(ITEM_PREFIX, 13, "Business Office");
const ACT_14 = makeLeafNode(ITEM_PREFIX, 14, "Human Resources");
const ACT_15 = makeLeafNode(ITEM_PREFIX, 15, "Public Relations");
const ACT_21 = makeLeafNode(ITEM_PREFIX, 21, "Supervision - Instruction");
const ACT_41 = makeLeafNode(ITEM_PREFIX, 41, "Supervision - Food Service");
const ACT_51 = makeLeafNode(ITEM_PREFIX, 51, "Supervision - Transportation");
const ACT_61 = makeLeafNode(
  ITEM_PREFIX,
  61,
  "Supervision - Maintenance and Operations",
);
const ACT_42 = makeLeafNode(ITEM_PREFIX, 42, "Food");
const ACT_44 = makeLeafNode(ITEM_PREFIX, 44, "Operations - Food Service");
const ACT_52 = makeLeafNode(ITEM_PREFIX, 52, "Operations - Transportation");
const ACT_58 = makeLeafNode(ITEM_PREFIX, 58, "Remote Learning Operations");
const ACT_59 = makeLeafNode(ITEM_PREFIX, 59, "Transfers - Transportation");
const ACT_62 = makeLeafNode(ITEM_PREFIX, 62, "Grounds Maintenance");
const ACT_63 = makeLeafNode(ITEM_PREFIX, 63, "Operations of Buildings");
const ACT_64 = makeLeafNode(ITEM_PREFIX, 64, "Maintenance");
const ACT_65 = makeLeafNode(ITEM_PREFIX, 65, "Utilities");
const ACT_67 = makeLeafNode(ITEM_PREFIX, 67, "Building and Property Security");
const ACT_68 = makeLeafNode(
  ITEM_PREFIX,
  68,
  "Insurance - Maintenance and Operations",
);
const ACT_72 = makeLeafNode(ITEM_PREFIX, 72, "Informational Systems");
const ACT_73 = makeLeafNode(ITEM_PREFIX, 73, "Printing");
const ACT_74 = makeLeafNode(ITEM_PREFIX, 74, "Warehousing and Distribution");
const ACT_75 = makeLeafNode(ITEM_PREFIX, 75, "Motor pool");
const ACT_91 = makeLeafNode(ITEM_PREFIX, 91, "Public Activities");
const ACT_9991 = makeLeafNode(ITEM_PREFIX, DistrictData.SYNTH_ACT_CODE_PRINCIPAL_OFFICE, DistrictData.SYNTH_ACT_PRINCPAL_OFFICE);
const ACT_9990 = makeLeafNode(ITEM_PREFIX, DistrictData.SYNTH_ACT_CODE_TEACHING, DistrictData.SYNTH_ACT_TEACHING);
const ACT_28 = makeLeafNode(ITEM_PREFIX, 28, "Extracurricular");
const ACT_22 = makeLeafNode(ITEM_PREFIX, 22, "Learning Resources");
const ACT_24 = makeLeafNode(ITEM_PREFIX, 24, "Guidance and Counseling");
const ACT_25 = makeLeafNode(ITEM_PREFIX, 25, "Pupil Management and Safety");
const ACT_26 = makeLeafNode(ITEM_PREFIX, 26, "Health and Related Services");
const ACT_31 = makeLeafNode(
  ITEM_PREFIX,
  31,
  "Instructional Professional Development",
);
const ACT_32 = makeLeafNode(ITEM_PREFIX, 32, "Instructional Technology");
const ACT_33 = makeLeafNode(ITEM_PREFIX, 33, "Curriculum");
const ACT_34 = makeLeafNode(ITEM_PREFIX, 34, "Professional Learning - State");
const ACT_35 = makeLeafNode(ITEM_PREFIX, 35, "Pupil Safety");
const ACT_85 = makeLeafNode(ITEM_PREFIX, 85, "Debt Service");
const ACT_56 = makeLeafNode(ITEM_PREFIX, 56, "Insurance - Transportation");
const ACT_83 = makeLeafNode(ITEM_PREFIX, 83, "Interest");
const ACT_53 = makeLeafNode(ITEM_PREFIX, 53, "Maintenance - Transportation");
const ACT_29 = makeLeafNode(ITEM_PREFIX, 29, "Payments to School Districts");
const ACT_49 = makeLeafNode(ITEM_PREFIX, 49, "Transfers - Food Service");

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

const ActivityFilter = new Filter(ActivityFilterTree, ITEM_PREFIX);
const SpsActivityFilter = new Filter(SpsActivityFilterTree, ITEM_PREFIX);

export default ActivityFilter;
