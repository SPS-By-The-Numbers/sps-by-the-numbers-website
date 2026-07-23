import { expect } from "@jest/globals";

import {
  flowLinkClass,
  flowNodeClass,
  FLOW_ACTUALS_CLASS,
  FLOW_BUDGET_CLASS,
  FLOW_DRAWDOWN_CLASS,
  FLOW_FILTERED_CLASS,
  FLOW_GROWTH_CLASS,
  DRAWDOWN_NODE_ID,
  GROWTH_NODE_ID,
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
  });
});
