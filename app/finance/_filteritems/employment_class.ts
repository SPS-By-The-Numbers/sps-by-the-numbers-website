import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
import {
  CERTIFICATED_CLASS_CODE,
  CLASSIFIED_CLASS_CODE,
} from "utilities/domain/duty_roots";

// Certificated vs classified employment class, determined from the S-275 duty
// ROOT code per OSPI's definition (see `employmentClassForDutyRoot` in
// utilities/domain/duty_roots). This replaces the old "Contract Type" (duty
// SUFFIX) filter, which grouped base/supplemental vs time/non-time contract
// types and did NOT reliably encode certificated vs classified.
//
// The codes (1 = certificated, 2 = classified) come from the domain so the
// filter and the derived `employment_class_code` data column stay in lockstep.
const ITEM_PREFIX = "emp";

const EmploymentClassFilterTree = makeInternalNode(
  "all",
  "All Employment Classes",
  [
    makeLeafNode(ITEM_PREFIX, CERTIFICATED_CLASS_CODE, "Certificated"),
    makeLeafNode(ITEM_PREFIX, CLASSIFIED_CLASS_CODE, "Classified"),
  ],
);

const EmploymentClassFilter = new Filter(
  EmploymentClassFilterTree,
  ITEM_PREFIX,
);

export default EmploymentClassFilter;

// Single-class code sets, for narrowing (e.g. flow deep links that open Staffing
// for a certificated- or classified-salary compensation object).
export const CERTIFICATED_CLASS_CODES = new Set([CERTIFICATED_CLASS_CODE]);
export const CLASSIFIED_CLASS_CODES = new Set([CLASSIFIED_CLASS_CODE]);
