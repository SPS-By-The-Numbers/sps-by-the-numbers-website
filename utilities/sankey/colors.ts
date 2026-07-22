// Color palette + node coloring for the Sankey compute engine.
//
// The palette is the validated one from the playground (SANKEY_PLAY.md Locked
// decision 11). `colorForNode` maps a (level, code) to a hex color.

import type { Level } from "utilities/sankey/types";

export const SANKEY_COLORS = {
  state: "#4285F4",
  federal: "#34A853",
  localTaxes: "#FF6D00",
  localNonTax: "#FFB300",
  otherEntities: "#8D6E63",
  otherFinancing: "#5D4037",
  otherResources: "#9AA0A6",
  program: "#F4B400",
  activity: "#00897B",
  fundBalance: "#B71C1C",
  nces: "#3949AB",
  school: "#E65100",
  object: {
    2: "#7B1FA2",
    3: "#8E24AA",
    4: "#9C27B0",
    5: "#AB47BC",
    7: "#BA68C8",
    8: "#CE93D8",
    9: "#E1BEE7",
    default: "#BA68C8",
  } as Record<number | "default", string>,
  filteredOut: "#BDBDBD",
};

// Presentation colors for the interactive flow view. These are intentionally
// separate from the semantic palette above, which the compute engine still
// attaches to each node for non-visual uses.
//
// The base color of every node/band reflects budget vs actuals, matching the
// bar charts' styled-mode palette in styles/highcharts-base.scss (actuals =
// --highcharts-color-1, budget = --highcharts-color-2). A single accent color
// is revealed only on hover (FlowDashboard's `states.hover`), and the Fund
// Balance nodes are always red.
export const SANKEY_ACTUALS_COLOR = "#006aa3"; // blue (matches color-1)
export const SANKEY_BUDGET_COLOR = "#cccccc"; // grey (matches color-2)
export const SANKEY_FUND_BALANCE_COLOR = SANKEY_COLORS.fundBalance; // red
export const SANKEY_HIGHLIGHT = "#1976D2";

// The Fund Balance Drawdown node id (emitted by the compute engine) and the CSS
// class applied to bands flowing OUT of it, so drawdown-funded flow carries a
// thin light-red border wherever it goes (rule in styles/highcharts-base.scss).
export const SANKEY_DRAWDOWN_NODE_ID = "fb:drawdown";
export const SANKEY_DRAWDOWN_LINK_CLASS = "sankey-drawdown-link";

export type FlowDataType = "actuals" | "budget";

// Base band/node color for the flow view given the data type.
export function flowBaseColor(dataType: FlowDataType): string {
  return dataType === "budget" ? SANKEY_BUDGET_COLOR : SANKEY_ACTUALS_COLOR;
}

// Display color for a node: Fund Balance nodes (drawdown / growth) are always
// red; every other node uses the budget/actuals base color.
export function flowNodeColor(
  level: Level | "fundBalance" | "filtered",
  dataType: FlowDataType,
): string {
  return level === "fundBalance"
    ? SANKEY_FUND_BALANCE_COLOR
    : flowBaseColor(dataType);
}

// Map a revenue category (or the category a revenue account rolls up to) to its
// source-band color. The bucket is derived from the code's leading thousands
// digit so it works for both category codes (e.g. 3000) and account codes (e.g.
// 4121 -> 4000): categories 3000/4000 share the state color, 5000/6000 the
// federal color, etc.
function colorForSource(code: number): string {
  const bucket = Math.floor(code / 1000) * 1000;
  switch (bucket) {
    case 1000:
      return SANKEY_COLORS.localTaxes;
    case 2000:
      return SANKEY_COLORS.localNonTax;
    case 3000:
    case 4000:
      return SANKEY_COLORS.state;
    case 5000:
    case 6000:
      return SANKEY_COLORS.federal;
    case 7000:
    case 8000:
      return SANKEY_COLORS.otherEntities;
    case 9000:
      return SANKEY_COLORS.otherFinancing;
    default:
      return SANKEY_COLORS.otherResources;
  }
}

export function colorForNode(
  level: Level | "fundBalance" | "filtered",
  code: number | null,
): string {
  switch (level) {
    case "source":
      return colorForSource(code ?? 0);
    case "program":
      return SANKEY_COLORS.program;
    case "activity":
      return SANKEY_COLORS.activity;
    case "object":
      return SANKEY_COLORS.object[code ?? -1] ?? SANKEY_COLORS.object.default;
    case "nces":
      return SANKEY_COLORS.nces;
    case "school":
      return SANKEY_COLORS.school;
    case "fundBalance":
      return SANKEY_COLORS.fundBalance;
    case "filtered":
      return SANKEY_COLORS.filteredOut;
    default:
      return SANKEY_COLORS.otherResources;
  }
}
