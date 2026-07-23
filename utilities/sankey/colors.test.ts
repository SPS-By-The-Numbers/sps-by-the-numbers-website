import { expect } from "@jest/globals";

import {
  flowLinkClass,
  flowNodeClass,
  sizeBuckets,
  FLOW_ACTUALS_CLASS,
  FLOW_BUDGET_CLASS,
  FLOW_DRAWDOWN_CLASS,
  FLOW_FILTERED_CLASS,
  FLOW_GROWTH_CLASS,
  FLOW_PTA_CLASS,
  DRAWDOWN_NODE_ID,
  GROWTH_NODE_ID,
  PTA_SOURCE_NODE_ID,
} from "utilities/sankey/colors";

import type { SankeyNode } from "utilities/sankey/types";

function node(
  id: string,
  level: SankeyNode["custom"]["level"],
): Pick<SankeyNode, "id" | "custom"> {
  return { id, custom: { level, code: null } };
}

describe("flow presentation classes", () => {
  it("colors nodes: drawdown red, growth green, filtered grey, else base", () => {
    expect(
      flowNodeClass(node(DRAWDOWN_NODE_ID, "fundBalance"), "actuals"),
    ).toBe(FLOW_DRAWDOWN_CLASS);
    expect(flowNodeClass(node(GROWTH_NODE_ID, "fundBalance"), "budget")).toBe(
      FLOW_GROWTH_CLASS,
    );
    expect(flowNodeClass(node("flt:1", "filtered"), "actuals")).toBe(
      FLOW_FILTERED_CLASS,
    );
    expect(flowNodeClass(node("prog:10", "program"), "actuals")).toBe(
      FLOW_ACTUALS_CLASS,
    );
    expect(flowNodeClass(node("src:1000", "source"), "budget")).toBe(
      FLOW_BUDGET_CLASS,
    );
  });

  it("colors links: drawdown OUTflow red, growth INflow green, else base", () => {
    expect(flowLinkClass(DRAWDOWN_NODE_ID, "prog:10", "actuals")).toBe(
      FLOW_DRAWDOWN_CLASS,
    );
    expect(flowLinkClass("src:1000", GROWTH_NODE_ID, "budget")).toBe(
      FLOW_GROWTH_CLASS,
    );
    expect(flowLinkClass("prog:10", "act:27", "actuals")).toBe(
      FLOW_ACTUALS_CLASS,
    );
    expect(flowLinkClass("prog:10", "act:27", "budget")).toBe(
      FLOW_BUDGET_CLASS,
    );
    // Bands touching a Filtered Out node are the filtered class (de-emphasized).
    expect(flowLinkClass("prog:10", "flt:1", "actuals")).toBe(
      FLOW_FILTERED_CLASS,
    );
    expect(flowLinkClass("flt:1", "flt:2", "budget")).toBe(FLOW_FILTERED_CLASS);
  });

  it("highlights the PTA-funding source only when the flag is on", () => {
    const pta = node(PTA_SOURCE_NODE_ID, "source");
    // Off (default): the PTA source is just a normal base node/band.
    expect(flowNodeClass(pta, "actuals")).toBe(FLOW_ACTUALS_CLASS);
    expect(flowLinkClass(PTA_SOURCE_NODE_ID, "prog:10", "actuals")).toBe(
      FLOW_ACTUALS_CLASS,
    );
    // On: the PTA source node and its outflow bands get the highlight class.
    expect(flowNodeClass(pta, "actuals", true)).toBe(FLOW_PTA_CLASS);
    expect(flowLinkClass(PTA_SOURCE_NODE_ID, "prog:10", "budget", true)).toBe(
      FLOW_PTA_CLASS,
    );
    // Other nodes are unaffected by the flag.
    expect(flowNodeClass(node("prog:10", "program"), "actuals", true)).toBe(
      FLOW_ACTUALS_CLASS,
    );
  });

  it("sizeBuckets ranks ids into ascending-size quantiles", () => {
    // 7 ids, sizes 10..70; 7 buckets => one per bucket, smallest = 0.
    const sizes = new Map<string, number>([
      ["c", 30],
      ["a", 10],
      ["g", 70],
      ["b", 20],
      ["e", 50],
      ["d", 40],
      ["f", 60],
    ]);
    const b = sizeBuckets(sizes, 7);
    expect(b.get("a")).toBe(0); // smallest
    expect(b.get("g")).toBe(6); // largest
    expect(b.get("d")).toBe(3); // middle

    // Fewer ids than buckets: each still lands in range, largest gets the top.
    const b2 = sizeBuckets(
      new Map([
        ["x", 5],
        ["y", 9],
      ]),
      7,
    );
    expect(b2.get("x")).toBe(0);
    expect(b2.get("y")).toBe(6);

    // Single id -> top bucket; empty -> empty.
    expect(sizeBuckets(new Map([["only", 1]]), 7).get("only")).toBe(6);
    expect(sizeBuckets(new Map(), 7).size).toBe(0);
  });
});
