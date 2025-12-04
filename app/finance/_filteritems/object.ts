import { Filter, makeInternalNode, makeLeafNode } from "utilities/filter";

const OBJ_2 = makeLeafNode("obj", 2, "Certificated");
const OBJ_3 = makeLeafNode("obj", 3, "Classified");
const OBJ_4 = makeLeafNode("obj", 4, "Benefits + Payroll Taxes");
const OBJ_5 = makeLeafNode("obj", 5, "Supplies");
const OBJ_7 = makeLeafNode("obj", 7, "Purchased Services");
const OBJ_8 = makeLeafNode("obj", 8, "Travel");
const OBJ_9 = makeLeafNode("obj", 9, "Capital Outlay");
const OBJ_0 = makeLeafNode("obj", 0, "Debit Transfer");
const OBJ_1 = makeLeafNode("obj", 1, "Credit Transfer");

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

const ObjectFilter = new Filter(ObjectFilterTree);

export default ObjectFilter;
