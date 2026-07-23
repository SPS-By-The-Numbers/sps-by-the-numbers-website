import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";

// The S-275 "duty suffix" is the employee CONTRACT TYPE: Certificated
// (base / supplemental) vs Classified (time / non-time). It is the
// `duty_contract_type` column of the s275 assignment domain, keyed by
// `duty_suffix_code`. Observed codes in the data are 0, 1, 3; code 2
// ("Classified, time") is the standard fourth even where a district reports
// none. Grouped so the UI (and deep links) can select "Certificated" or
// "Classified" as a whole.
const ITEM_PREFIX = "dsuf";

const CERT_BASE = makeLeafNode(ITEM_PREFIX, 0, "Base");
const CERT_SUPP = makeLeafNode(ITEM_PREFIX, 1, "Supplemental");
const CLASS_TIME = makeLeafNode(ITEM_PREFIX, 2, "Time");
const CLASS_NONTIME = makeLeafNode(ITEM_PREFIX, 3, "Non-time");

const DutySuffixFilterTree = makeInternalNode("all", "All Contract Types", [
  makeInternalNode("certificated", "Certificated", [CERT_BASE, CERT_SUPP]),
  makeInternalNode("classified", "Classified", [CLASS_TIME, CLASS_NONTIME]),
]);

const DutySuffixFilter = new Filter(DutySuffixFilterTree, ITEM_PREFIX);

export default DutySuffixFilter;

// The suffix codes for each contract type, for narrowing (e.g. flow deep links
// that open Staffing for a certificated- or classified-salary compensation
// object).
export const CERTIFICATED_SUFFIX_CODES = new Set([0, 1]);
export const CLASSIFIED_SUFFIX_CODES = new Set([2, 3]);
