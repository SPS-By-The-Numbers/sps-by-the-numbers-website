import { expect } from "@jest/globals";
import {
  codesForNode,
  focusUpdateForBand,
  focusUpdateForNode,
} from "utilities/sankey/focus";

import type { SankeyNode } from "utilities/sankey/types";

function node(
  id: string,
  level: SankeyNode["custom"]["level"],
  code: number | null,
  members?: NonNullable<SankeyNode["custom"]["members"]>,
): SankeyNode {
  return {
    id,
    name: id,
    color: "#000",
    column: 0,
    custom: members ? { level, code, members } : { level, code },
  };
}

describe("codesForNode", () => {
  it("returns the node's own code", () => {
    expect(codesForNode(node("act:27", "activity", 27))).toEqual(new Set([27]));
  });

  it("returns a coalesced node's member codes", () => {
    const other = node("other:2", "activity", null, [
      { name: "Tiny A", weight: 2, code: 31 },
      { name: "Tiny B", weight: 2, code: 32 },
    ]);
    expect(codesForNode(other)).toEqual(new Set([31, 32]));
  });

  it("flattens a member that is itself a group", () => {
    // "Other Schools" built from school AGGREGATES (which have no code of their
    // own) plus one ordinary school: focus must reach every leaf.
    const other = node("other:3", "school", null, [
      {
        name: "Schools · 47–172 headcount",
        weight: 10,
        code: null,
        codes: [101, 102],
      },
      { name: "Residential Consortium", weight: 5, code: 200 },
    ]);
    expect(codesForNode(other)).toEqual(new Set([101, 102, 200]));
  });

  it("returns null when there is nothing behind the node", () => {
    expect(codesForNode(node("fb:drawdown", "fundBalance", null))).toBeNull();
    expect(codesForNode(node("flt:2", "filtered", null))).toBeNull();
    // A group whose members carry no codes (e.g. nested aggregates).
    expect(
      codesForNode(
        node("other:2", "activity", null, [
          { name: "x", weight: 1, code: null },
        ]),
      ),
    ).toBeNull();
  });
});

describe("focusUpdateForNode", () => {
  it("narrows an expenditure level to the node's code", () => {
    expect(
      focusUpdateForNode(node("prog:10", "program", 10), "category"),
    ).toEqual({ programCodes: new Set([10]) });
    expect(focusUpdateForNode(node("obj:2", "object", 2), "category")).toEqual({
      objectCodes: new Set([2]),
    });
    expect(
      focusUpdateForNode(node("sch:100", "school", 100), "category"),
    ).toEqual({ schoolCodes: new Set([100]) });
  });

  it("narrows a coalesced node to all of its members", () => {
    const other = node("other:2", "activity", null, [
      { name: "Tiny A", weight: 2, code: 31 },
      { name: "Tiny B", weight: 2, code: 32 },
    ]);
    expect(focusUpdateForNode(other, "category")).toEqual({
      activityCodes: new Set([31, 32]),
    });
  });

  it("narrows a source by category in category mode", () => {
    expect(
      focusUpdateForNode(node("src:3000", "source", 3000), "category"),
    ).toEqual({ revenueCategoryCodes: new Set([3000]) });
  });

  it("narrows a source by account in account mode", () => {
    expect(
      focusUpdateForNode(node("src:4121", "source", 4121), "account"),
    ).toEqual({ revenueCodes: new Set([4121]), sourceMode: "account" });
  });

  it("switches a never-combine account to account granularity", () => {
    // 2500 (Gifts, Grants, Donations) is drawn as its own ACCOUNT node even in
    // category mode, so narrowing its category would leave that category's
    // other accounts on screen. Focus switches the view instead.
    expect(
      focusUpdateForNode(node("src:2500", "source", 2500), "category"),
    ).toEqual({ revenueCodes: new Set([2500]), sourceMode: "account" });
  });

  it("refuses Fund Balance and Filtered Out nodes", () => {
    expect(
      focusUpdateForNode(node("fb:drawdown", "fundBalance", null), "category"),
    ).toBeNull();
    expect(
      focusUpdateForNode(node("flt:2", "filtered", null), "category"),
    ).toBeNull();
  });
});

describe("focusUpdateForBand", () => {
  it("narrows BOTH endpoints so only that band survives", () => {
    expect(
      focusUpdateForBand(
        node("prog:10", "program", 10),
        node("act:27", "activity", 27),
        "category",
      ),
    ).toEqual({
      programCodes: new Set([10]),
      activityCodes: new Set([27]),
    });
  });

  it("narrows the source end too", () => {
    expect(
      focusUpdateForBand(
        node("src:3000", "source", 3000),
        node("prog:10", "program", 10),
        "category",
      ),
    ).toEqual({
      revenueCategoryCodes: new Set([3000]),
      programCodes: new Set([10]),
    });
  });

  it("narrows only the filterable end of a Fund Balance band", () => {
    // Nothing can select "the drawdown"; the program end is the best available.
    expect(
      focusUpdateForBand(
        node("fb:drawdown", "fundBalance", null),
        node("prog:10", "program", 10),
        "category",
      ),
    ).toEqual({ programCodes: new Set([10]) });
  });

  it("refuses a band touching Filtered Out", () => {
    expect(
      focusUpdateForBand(
        node("prog:10", "program", 10),
        node("flt:2", "filtered", null),
        "category",
      ),
    ).toBeNull();
    expect(
      focusUpdateForBand(
        node("flt:1", "filtered", null),
        node("flt:2", "filtered", null),
        "category",
      ),
    ).toBeNull();
  });

  it("refuses a band with nothing filterable at either end", () => {
    expect(
      focusUpdateForBand(
        node("fb:drawdown", "fundBalance", null),
        node("fb:growth", "fundBalance", null),
        "category",
      ),
    ).toBeNull();
  });
});
