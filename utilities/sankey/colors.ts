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

// Presentation classes for the interactive flow view.
//
// The flow view is colored via CSS CLASSES, not the fill attribute. The app
// loads Highcharts' styled-mode CSS (highcharts/css/highcharts.css), whose
// `.highcharts-color-N { fill: var(--highcharts-color-N) }` rules override any
// inline fill attribute (CSS beats SVG presentation attributes) -- so setting
// `color` on a node/link does nothing; the band renders as --highcharts-color-0
// (a blue). Instead we assign a class and let styles/highcharts-base.scss set
// the fill with higher specificity.
//
// Almost everything uses the base class (Actuals = blue, Budget = grey, reusing
// the bar charts' --highcharts-color-1/2). The exceptions are the two
// fund-balance flows, filled to stand out: the General Fund Balance Drawdown
// node and its outflow bands are RED; the General Fund Balance Growth node and
// its inflow bands are GREEN. Filtered Out nodes are a neutral grey.
export const FLOW_ACTUALS_CLASS = "flow-actuals";
export const FLOW_BUDGET_CLASS = "flow-budget";
export const FLOW_DRAWDOWN_CLASS = "flow-drawdown"; // red
export const FLOW_GROWTH_CLASS = "flow-growth"; // green
export const FLOW_FILTERED_CLASS = "flow-filtered"; // neutral grey

// Node ids for the two synthetic fund-balance nodes (emitted by the engine).
export const DRAWDOWN_NODE_ID = "fb:drawdown";
export const GROWTH_NODE_ID = "fb:growth";

export type FlowDataType = "actuals" | "budget";

// Base band/node CSS class for the flow view given the data type.
export function flowBaseClass(dataType: FlowDataType): string {
  return dataType === "budget" ? FLOW_BUDGET_CLASS : FLOW_ACTUALS_CLASS;
}

// CSS class for a node: the drawdown node is red, the growth node green,
// Filtered Out nodes neutral grey, everything else the budget/actuals base.
export function flowNodeClass(
  node: { id: string; custom: { level: Level | "fundBalance" | "filtered" } },
  dataType: FlowDataType,
): string {
  if (node.id === DRAWDOWN_NODE_ID) {
    return FLOW_DRAWDOWN_CLASS;
  }
  if (node.id === GROWTH_NODE_ID) {
    return FLOW_GROWTH_CLASS;
  }
  if (node.custom.level === "filtered") {
    return FLOW_FILTERED_CLASS;
  }
  return flowBaseClass(dataType);
}

// CSS class for a link (band): bands flowing OUT of the drawdown node are red,
// bands flowing INTO the growth node are green, everything else the base class.
export function flowLinkClass(
  from: string,
  to: string,
  dataType: FlowDataType,
): string {
  if (from === DRAWDOWN_NODE_ID) {
    return FLOW_DRAWDOWN_CLASS;
  }
  if (to === GROWTH_NODE_ID) {
    return FLOW_GROWTH_CLASS;
  }
  return flowBaseClass(dataType);
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
