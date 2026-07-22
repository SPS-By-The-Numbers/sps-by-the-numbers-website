// Builds a deep link from a hovered Sankey node back into the dashboard that
// can show that node's underlying data filtered to just that one code.
//
// One link per node (Locked design decision #8): source nodes -> the
// revenues dashboard (facet + urlVar depend on the current source
// granularity); program/activity/object nodes -> the expenditures
// dashboard; nces/school nodes -> the detailedactuals dashboard (its
// dataset generators do include `n`/`s` filter configs -- verified against
// `SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS` in
// `app/finance/detailedactuals/DetailedActualsPage.tsx`). Fund Balance
// (`fb:*`) and Filtered Out (`flt:*`) nodes have no underlying filterable
// dashboard and return null.
//
// The `d=`/`c=` URL fragments are hand-composed here rather than built by
// importing each target page's real settings serializer generators. This is
// the plan's explicitly-sanctioned "easier to test" option: it keeps this
// module free of any React/MUI/Highcharts import chain (the target pages'
// `*Page.tsx` files pull those in transitively), while still using the exact
// same `Filter` singletons and URL-encoding (`Filter.toFilterString`,
// `utilities/settings`'s `key.value~key.value` shape) the real serializers
// use -- see `deepLinks.test.ts`, which round-trips the generated `d` value
// back through the real `common_settings.ts` generators
// (`makePaoSerializeConfig`, `makeNcesSerializeConfig`,
// `makeSchoolFilterConfig`, `makeRevenueSerializeConfig`) to confirm this.

import ActivityFilter from "app/finance/_filteritems/activity";
import NcesFilter from "app/finance/_filteritems/nces";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import RevenueCategoryFilter from "app/finance/_filteritems/revenue_category";
import RevenueFilter from "app/finance/_filteritems/revenue";
import { makeSchoolFilter } from "app/finance/_filteritems/school";

import type { Filter } from "utilities/filter";
import type { SankeyNode, SourceMode } from "utilities/sankey/types";

// Context a deep link needs beyond what's already on the node: which
// district (to scope the school filter's per-district domain, and to stamp
// the `c.<ccddd>` dataset-identity key) and the current source granularity
// (category vs account -- determines which revenues facet/urlVar a source
// node links to).
export type DeepLinkCtx = { ccddd: number; sourceMode: SourceMode };

export type DeepLink = { href: string; label: string };

type LinkTarget = {
  path: string;
  urlVar: string;
  filter: Filter;
  // The target dashboard's context ("c=") facet setting that puts the
  // linked-to code's own facet front and center, e.g. "f.1" selects the
  // Program facet on /finance/expenditures.
  contextFacet: string;
};

function targetFor(node: SankeyNode, ctx: DeepLinkCtx): LinkTarget | null {
  switch (node.custom.level) {
    case "source":
      return ctx.sourceMode === "account"
        ? {
            path: "/finance/revenues",
            urlVar: "rv",
            filter: RevenueFilter,
            contextFacet: "f.1",
          }
        : {
            path: "/finance/revenues",
            urlVar: "rc",
            filter: RevenueCategoryFilter,
            contextFacet: "f.0",
          };

    case "program":
      return {
        path: "/finance/expenditures",
        urlVar: "p",
        filter: ProgramFilter,
        contextFacet: "f.1",
      };

    case "activity":
      return {
        path: "/finance/expenditures",
        urlVar: "a",
        filter: ActivityFilter,
        contextFacet: "f.0",
      };

    case "object":
      return {
        path: "/finance/expenditures",
        urlVar: "o",
        filter: ObjectFilter,
        contextFacet: "f.2",
      };

    case "nces":
      return {
        path: "/finance/detailedactuals",
        urlVar: "n",
        filter: NcesFilter,
        contextFacet: "f.4",
      };

    case "school":
      return {
        path: "/finance/detailedactuals",
        urlVar: "s",
        filter: makeSchoolFilter(ctx.ccddd),
        contextFacet: "f.3",
      };

    // Fund Balance (fb:drawdown / fb:growth) and Filtered Out (flt:<col>)
    // nodes have no underlying dashboard to deep-link into.
    case "fundBalance":
    case "filtered":
    default:
      return null;
  }
}

// Returns a deep link for this node's own filter on the appropriate target
// dashboard, or null if the node isn't linkable (Fund Balance / Filtered
// Out nodes, or a level with no viable target).
export function linkForNode(
  node: SankeyNode,
  ctx: DeepLinkCtx,
): DeepLink | null {
  const { code } = node.custom;
  if (code === null) {
    return null;
  }

  const target = targetFor(node, ctx);
  if (target === null) {
    return null;
  }

  // Mirrors the `key.value~key.value` shape `serializeOneSetting` produces:
  // the dataset-identity key (`c.<ccddd>`) plus this one filter narrowed to
  // just the hovered node's code.
  const filterString = target.filter.toFilterString(new Set([code]));
  const dValue = `c.${ctx.ccddd}~${target.urlVar}.${filterString}`;
  const href =
    `${target.path}?d=${encodeURIComponent(dValue)}` +
    `&c=${encodeURIComponent(target.contextFacet)}`;

  return { href, label: `Explore ${node.name}` };
}
