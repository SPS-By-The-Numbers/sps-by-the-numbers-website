// "Focus on this": narrow the flow view's OWN filters so only the clicked node
// or band is left drawn. This is the in-place counterpart to deepLinks.ts --
// that module builds a URL into ANOTHER dashboard, this one rewrites the flow's
// filter settings.
//
// A NODE narrows its own level to its code (or, for a coalesced "Other" node,
// to its members' codes). A BAND narrows BOTH endpoints' levels, which leaves
// exactly that band: a flow survives only if it passes through both.
//
// Everything the filters cannot express is reported by returning null:
//   - Filtered Out nodes/bands. They are the flow a filter already removed;
//     "focus" on them is meaningless (and there is no code to narrow to).
//   - Fund Balance nodes (Drawdown / Growth). They are synthetic, with no
//     filter behind them. A band with ONE fund-balance endpoint still narrows
//     its other endpoint -- the best the filters can do -- rather than nothing.
//   - A coalesced node whose members carry no codes.
//
// Note the Source column asymmetry: in Category mode the source filter holds
// CATEGORY codes, but a never-combine account (Gifts/Grants/Donations) is drawn
// as its own ACCOUNT node. Narrowing its category would leave that category's
// other accounts on screen, so focusing such a node also switches the view to
// Account granularity, where the filter can name it exactly.

import { NEVER_COMBINE_REVENUE_CODES } from "utilities/sankey/attribution";

import type { SankeyNode, SourceMode } from "utilities/sankey/types";

// The filter fields of FlowSettings that a focus can rewrite, plus sourceMode
// (see the never-combine note above). A field left undefined is untouched.
export type FocusUpdate = Partial<{
  revenueCategoryCodes: Set<number>;
  revenueCodes: Set<number>;
  programCodes: Set<number>;
  activityCodes: Set<number>;
  objectCodes: Set<number>;
  ncesCodes: Set<number>;
  schoolCodes: Set<number>;
  sourceMode: SourceMode;
}>;

// The codes a node stands for: its own, or -- for a coalesced "Other" node --
// its members'. Null when the node has no code behind it (Fund Balance,
// Filtered Out, or a group whose members carry none).
export function codesForNode(node: SankeyNode): Set<number> | null {
  if (node.custom.code !== null) {
    return new Set([node.custom.code]);
  }
  // A member that is itself a group (a school aggregate rolled into "Other
  // Schools") has no code of its own but carries its leaves' codes.
  const codes = (node.custom.members ?? []).flatMap((m) =>
    m.code !== null && m.code !== undefined ? [m.code] : (m.codes ?? []),
  );
  return codes.length > 0 ? new Set(codes) : null;
}

// The filter update that narrows one node's level to that node. Null when the
// node's level has no filter behind it.
function updateForNode(
  node: SankeyNode,
  sourceMode: SourceMode,
): FocusUpdate | null {
  const codes = codesForNode(node);
  if (codes === null) {
    return null;
  }
  switch (node.custom.level) {
    case "source": {
      // Account granularity when we are already in it, or when the node is a
      // never-combine account drawn inside Category mode (see the header).
      const asAccount =
        sourceMode === "account" ||
        [...codes].some((c) => NEVER_COMBINE_REVENUE_CODES.has(c));
      return asAccount
        ? { revenueCodes: codes, sourceMode: "account" }
        : { revenueCategoryCodes: codes };
    }
    case "program":
      return { programCodes: codes };
    case "activity":
      return { activityCodes: codes };
    case "object":
      return { objectCodes: codes };
    case "nces":
      return { ncesCodes: codes };
    case "school":
      return { schoolCodes: codes };
    // fundBalance / filtered: nothing to narrow.
    default:
      return null;
  }
}

// The filter update that leaves only the given node drawn. Null when the node
// cannot be focused.
export function focusUpdateForNode(
  node: SankeyNode,
  sourceMode: SourceMode,
): FocusUpdate | null {
  if (node.custom.level === "filtered") {
    return null;
  }
  return updateForNode(node, sourceMode);
}

// The filter update that leaves only the given band drawn: both endpoints'
// levels narrowed to their own codes. A Filtered Out endpoint makes the whole
// band unfocusable; a Fund Balance endpoint simply contributes nothing, so the
// result narrows the other end alone. Null when neither end narrows anything.
export function focusUpdateForBand(
  from: SankeyNode,
  to: SankeyNode,
  sourceMode: SourceMode,
): FocusUpdate | null {
  if (from.custom.level === "filtered" || to.custom.level === "filtered") {
    return null;
  }
  const updates = [from, to]
    .map((n) => updateForNode(n, sourceMode))
    .filter((u): u is FocusUpdate => u !== null);
  if (updates.length === 0) {
    return null;
  }
  return Object.assign({}, ...updates) as FocusUpdate;
}
