// Builds a deep link from a hovered Sankey node back into the dashboard that
// can show that node's underlying data.
//
// Two goals (see FlowDashboard's tooltip):
//   1. Preserve the flow's CURRENTLY ACTIVE filters, so the link examines the
//      highlighted item in the same context you're looking at. Every filter set
//      the target dashboard supports is carried over; a filter still at its full
//      domain is a no-op and is omitted (detected by set size), so only
//      genuinely-narrowed filters travel.
//   2. Narrow the hovered node's OWN level to just that one code (the item). A
//      NODE click facets the target on that item's OWN level (the roll-up
//      graph); a BAND click facets one level DOWN (program->activity,
//      activity->object, source->program, nces->school; terminal levels object
//      and school keep their own facet).
//
// Targets: source -> /finance/revenues; program/activity/object ->
// /finance/expenditures AND /finance/detailedactuals; nces/school ->
// /finance/detailedactuals. Fund Balance (`fb:*`), Filtered Out (`flt:*`), and
// coalesced "Other" (`other:*`, null code) nodes have no single underlying item
// and return [].
//
// The `d=`/`c=` URL fragments are hand-composed here (not by importing each
// target page's serializer generators) to keep this module free of any
// React/MUI/Highcharts import chain, while using the exact same `Filter`
// singletons and URL encoding the real serializers use -- `deepLinks.test.ts`
// round-trips the generated `d` value through the real `common_settings.ts`
// generators to confirm it.

import { NEVER_COMBINE_REVENUE_CODES } from "utilities/sankey/attribution";
import ActivityFilter from "app/finance/_filteritems/activity";
import NcesFilter from "app/finance/_filteritems/nces";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import RevenueCategoryFilter from "app/finance/_filteritems/revenue_category";
import RevenueFilter from "app/finance/_filteritems/revenue";
import { makeSchoolFilter } from "app/finance/_filteritems/school";

import type { Filter } from "utilities/filter";
import type { SankeyNode, SourceMode } from "utilities/sankey/types";

// The flow's active per-level filter code-sets (each is "all selected" by
// default, in which case it is carried as a no-op / omitted). Fields are
// optional; an undefined one is treated as no filter.
export type DeepLinkFilters = Partial<{
  revenueCategoryCodes: Set<number>;
  revenueCodes: Set<number>;
  programCodes: Set<number>;
  activityCodes: Set<number>;
  objectCodes: Set<number>;
  ncesCodes: Set<number>;
  schoolCodes: Set<number>;
}>;

// Context a deep link needs beyond what's on the node: the district (to scope
// the school filter's per-district domain and stamp `c.<ccddd>`), the source
// granularity (category vs account), and the currently active filters to carry.
export type DeepLinkCtx = {
  ccddd: number;
  sourceMode: SourceMode;
  filters: DeepLinkFilters;
};

export type DeepLink = { href: string; label: string };

// One filter param to serialize into the `d=` value (undefined codes = omit).
type ParamSpec = {
  urlVar: string;
  filter: Filter;
  codes: Set<number> | undefined;
};

// One target dashboard for a node. `ownFacet` shows the item rolled up at its
// OWN level (used when a NODE is clicked); `nextFacet` breaks it out one level
// DOWN (used when a BAND is clicked). Facet indices:
//   revenues: category 0, revenue 1, program 2
//   expenditures: activity 0, program 1, object 2
//   detailedactuals: activity 0, program 1, object 2, school 3, nces 4
type Target = {
  path: string;
  dashboard: string; // human label, e.g. "Expenditures"
  params: ParamSpec[];
  ownFacet: string;
  nextFacet: string;
};

// The target dashboards for a hovered node, with the flow's active filters
// carried and the node's own level narrowed to its code. p/a/o levels link to
// BOTH Expenditures and DetailedActuals (they cover different amounts of
// history); n/s link to DetailedActuals; source links to Revenues.
function targetsForNode(
  node: SankeyNode,
  ctx: DeepLinkCtx,
  code: number,
): Target[] {
  const f = ctx.filters;
  const schoolFilter = makeSchoolFilter(ctx.ccddd);

  const P: ParamSpec = {
    urlVar: "p",
    filter: ProgramFilter,
    codes: f.programCodes,
  };
  const A: ParamSpec = {
    urlVar: "a",
    filter: ActivityFilter,
    codes: f.activityCodes,
  };
  const O: ParamSpec = {
    urlVar: "o",
    filter: ObjectFilter,
    codes: f.objectCodes,
  };
  const N: ParamSpec = { urlVar: "n", filter: NcesFilter, codes: f.ncesCodes };
  const S: ParamSpec = {
    urlVar: "s",
    filter: schoolFilter,
    codes: f.schoolCodes,
  };
  const RC: ParamSpec = {
    urlVar: "rc",
    filter: RevenueCategoryFilter,
    codes: f.revenueCategoryCodes,
  };
  const RV: ParamSpec = {
    urlVar: "rv",
    filter: RevenueFilter,
    codes: f.revenueCodes,
  };
  const only = (p: ParamSpec): ParamSpec => ({ ...p, codes: new Set([code]) });

  // Expenditures target (p/a/o) and DetailedActuals target (p/a/o/s/n) share
  // the same self-narrowing on p/a/o; only the carried set + facets differ.
  const exp = (
    params: ParamSpec[],
    ownFacet: string,
    nextFacet: string,
  ): Target => ({
    path: "/finance/expenditures",
    dashboard: "Expenditures",
    params,
    ownFacet,
    nextFacet,
  });
  const det = (
    params: ParamSpec[],
    ownFacet: string,
    nextFacet: string,
  ): Target => ({
    path: "/finance/detailedactuals",
    dashboard: "Detailed Actuals",
    params,
    ownFacet,
    nextFacet,
  });

  switch (node.custom.level) {
    case "source": {
      // A never-combine source node carries a revenue ACCOUNT code even in
      // category mode, so it narrows/links by account. Own facet = its own
      // granularity; next facet = Program.
      const asAccount =
        ctx.sourceMode === "account" || NEVER_COMBINE_REVENUE_CODES.has(code);
      return [
        {
          path: "/finance/revenues",
          dashboard: "Revenues",
          params: asAccount ? [RC, only(RV), P] : [only(RC), RV, P],
          ownFacet: asAccount ? "f.1" : "f.0",
          nextFacet: "f.2",
        },
      ];
    }

    // p/a/o -> Expenditures AND DetailedActuals. Own facet = the level itself,
    // next facet = the level below (object is terminal).
    case "program":
      return [
        exp([only(P), A, O], "f.1", "f.0"),
        det([only(P), A, O, S, N], "f.1", "f.0"),
      ];
    case "activity":
      return [
        exp([P, only(A), O], "f.0", "f.2"),
        det([P, only(A), O, S, N], "f.0", "f.2"),
      ];
    case "object":
      return [
        exp([P, A, only(O)], "f.2", "f.2"),
        det([P, A, only(O), S, N], "f.2", "f.2"),
      ];

    // n/s -> DetailedActuals only.
    case "nces":
      return [det([P, A, O, S, only(N)], "f.4", "f.3")];
    case "school":
      return [det([P, A, O, only(S), N], "f.3", "f.3")];

    // Fund Balance, Filtered Out, and coalesced "Other" nodes have no single
    // underlying item.
    case "fundBalance":
    case "filtered":
    default:
      return [];
  }
}

// All deep links for a hovered node, preserving the flow's active filters and
// narrowing to the node's own item. `nextLayer` (true for a BAND click) facets
// one level DOWN; a NODE click (default) facets on the item's own level (the
// roll-up graph). Returns [] when the node isn't linkable.
export function linksForNode(
  node: SankeyNode,
  ctx: DeepLinkCtx,
  nextLayer = false,
): DeepLink[] {
  const { code } = node.custom;
  if (code === null) {
    return [];
  }

  return targetsForNode(node, ctx, code).map((t) => {
    // Mirror the `key.value~key.value` shape `serializeOneSetting` produces:
    // the dataset-identity key plus each carried filter. A filter still at its
    // full domain is a no-op, so it is omitted (it would otherwise serialize to
    // the "all selected" sentinel and narrow nothing). The self-override
    // (`only`) is always a strict subset and stays.
    const parts = [`c.${ctx.ccddd}`];
    for (const p of t.params) {
      if (!p.codes || p.codes.size >= p.filter.allCodes().size) {
        continue;
      }
      const s = p.filter.toFilterString(p.codes);
      if (s) {
        parts.push(`${p.urlVar}.${s}`);
      }
    }
    const facet = nextLayer ? t.nextFacet : t.ownFacet;
    const href =
      `${t.path}?d=${encodeURIComponent(parts.join("~"))}` +
      `&c=${encodeURIComponent(facet)}`;
    return { href, label: `Explore ${node.name} in ${t.dashboard}` };
  });
}
