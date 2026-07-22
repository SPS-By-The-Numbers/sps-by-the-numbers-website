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
