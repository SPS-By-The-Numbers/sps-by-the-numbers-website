import { expect } from "@jest/globals";

import {
  flowBaseColor,
  flowNodeColor,
  SANKEY_ACTUALS_COLOR,
  SANKEY_BUDGET_COLOR,
  SANKEY_DRAWDOWN_NODE_ID,
  SANKEY_FUND_BALANCE_COLOR,
} from "utilities/sankey/colors";

describe("flow presentation colors", () => {
  it("uses blue for actuals and grey for budget", () => {
    expect(flowBaseColor("actuals")).toBe(SANKEY_ACTUALS_COLOR);
    expect(flowBaseColor("budget")).toBe(SANKEY_BUDGET_COLOR);
  });

  it("colors Fund Balance nodes red regardless of data type", () => {
    expect(flowNodeColor("fundBalance", "actuals")).toBe(
      SANKEY_FUND_BALANCE_COLOR,
    );
    expect(flowNodeColor("fundBalance", "budget")).toBe(
      SANKEY_FUND_BALANCE_COLOR,
    );
  });

  it("colors every other node with the budget/actuals base color", () => {
    expect(flowNodeColor("program", "actuals")).toBe(SANKEY_ACTUALS_COLOR);
    expect(flowNodeColor("source", "budget")).toBe(SANKEY_BUDGET_COLOR);
    expect(flowNodeColor("activity", "actuals")).toBe(SANKEY_ACTUALS_COLOR);
    // Filtered-out nodes are not Fund Balance, so they follow the base color.
    expect(flowNodeColor("filtered", "budget")).toBe(SANKEY_BUDGET_COLOR);
  });

  it("pins the drawdown node id the engine actually emits", () => {
    // Guards against drift between the compute engine's node id and the
    // id FlowDashboard checks to add the red border class.
    expect(SANKEY_DRAWDOWN_NODE_ID).toBe("fb:drawdown");
  });
});
