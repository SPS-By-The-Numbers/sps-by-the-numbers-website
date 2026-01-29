import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";
const ITEM_PREFIX = "obj";

const OBJ_2 = makeLeafNode(ITEM_PREFIX, 2, "Certificated");
const OBJ_3 = makeLeafNode(ITEM_PREFIX, 3, "Classified");
const OBJ_4 = makeLeafNode(ITEM_PREFIX, 4, "Benefits + Payroll Taxes");
const OBJ_5 = makeLeafNode(ITEM_PREFIX, 5, "Supplies");
const OBJ_7 = makeLeafNode(ITEM_PREFIX, 7, "Purchased Services");
const OBJ_8 = makeLeafNode(ITEM_PREFIX, 8, "Travel");
const OBJ_9 = makeLeafNode(ITEM_PREFIX, 9, "Capital Outlay");
const OBJ_0 = makeLeafNode(ITEM_PREFIX, 0, "Debit Transfer");
const OBJ_1 = makeLeafNode(ITEM_PREFIX, 1, "Credit Transfer");

const ObjectFilterTree = makeInternalNode("object", "All Objects", [
  makeInternalNode("compensation", "Compensation", [
    makeInternalNode("at-salary", "Salary", [OBJ_2, OBJ_3]),
    OBJ_4,
  ]),
  makeInternalNode("non-comp", "Non-Compensation", [
    OBJ_5,
    OBJ_7,
    OBJ_8,
    OBJ_9,
  ]),
  makeInternalNode("transfers", "Transfers*", [OBJ_0, OBJ_1]),
]);

const ObjectFilter = new Filter(ObjectFilterTree, ITEM_PREFIX);

export default ObjectFilter;
