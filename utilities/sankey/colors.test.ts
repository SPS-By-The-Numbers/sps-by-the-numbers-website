import { expect } from "@jest/globals";

import {
  flowBaseClass,
  flowNodeClass,
  FLOW_ACTUALS_CLASS,
  FLOW_BUDGET_CLASS,
  FLOW_FUND_BALANCE_CLASS,
  SANKEY_DRAWDOWN_NODE_ID,
} from "utilities/sankey/colors";

describe("flow presentation classes", () => {
  it("uses the actuals class for actuals and the budget class for budget", () => {
    expect(flowBaseClass("actuals")).toBe(FLOW_ACTUALS_CLASS);
    expect(flowBaseClass("budget")).toBe(FLOW_BUDGET_CLASS);
  });

  it("classes Fund Balance nodes as fund-balance regardless of data type", () => {
    expect(flowNodeClass("fundBalance", "actuals")).toBe(
      FLOW_FUND_BALANCE_CLASS,
    );
    expect(flowNodeClass("fundBalance", "budget")).toBe(
      FLOW_FUND_BALANCE_CLASS,
    );
  });

  it("classes every other node with the budget/actuals base class", () => {
    expect(flowNodeClass("program", "actuals")).toBe(FLOW_ACTUALS_CLASS);
    expect(flowNodeClass("source", "budget")).toBe(FLOW_BUDGET_CLASS);
    expect(flowNodeClass("activity", "actuals")).toBe(FLOW_ACTUALS_CLASS);
    // Filtered-out nodes are not Fund Balance, so they follow the base class.
    expect(flowNodeClass("filtered", "budget")).toBe(FLOW_BUDGET_CLASS);
  });

  it("pins the drawdown node id the engine actually emits", () => {
    // Guards against drift between the compute engine's node id and the
    // id FlowDashboard checks to add the red border class.
    expect(SANKEY_DRAWDOWN_NODE_ID).toBe("fb:drawdown");
  });
});
