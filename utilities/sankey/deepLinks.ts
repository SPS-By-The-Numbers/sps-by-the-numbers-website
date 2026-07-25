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
import ALL_NCES from "utilities/domain/nces";
import ActivityFilter from "app/finance/_filteritems/activity";
import EmploymentClassFilter, {
  CERTIFICATED_CLASS_CODES,
  CLASSIFIED_CLASS_CODES,
} from "app/finance/_filteritems/employment_class";
import NcesFilter from "app/finance/_filteritems/nces";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import RevenueCategoryFilter from "app/finance/_filteritems/revenue_category";
import RevenueFilter from "app/finance/_filteritems/revenue";
import { makeSchoolFilter } from "app/finance/_filteritems/school";

import type { Filter } from "utilities/filter";
import type { Level, SankeyNode, SourceMode } from "utilities/sankey/types";

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
    dashboard: "Bud/Act History",
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
    // Bare dashboard name; FlowDashboard renders it as "Explore in <a>…</a>",
    // the same phrasing as a band's links.
    return { href, label: t.dashboard };
  });
}

// ---------------------------------------------------------------------------
// Band (link) deep links.
//
// A band goes from an upstream node to a downstream node. Its links open a view
// narrowed to EXACTLY that band -- the flow's active filters, plus BOTH
// endpoints' own levels pinned to their codes -- faceted on the DOWNSTREAM
// (to) level. Labels are the bare dashboard names; FlowDashboard renders them
// as "Explore in <Expenditures> or <Detailed Actuals>".
// ---------------------------------------------------------------------------

// Object codes that are compensation-related: Certificated Salaries (2),
// Classified Salaries (3), Employee Benefits (4). A band touching an uncollapsed
// object node with one of these can also be explored in the Staffing dashboard.
const COMPENSATION_OBJECT_CODES = new Set([2, 3, 4]);

// NCES codes that are employee compensation: the "Salaries" category (Salaries
// of Regular Employee, Salaries of Temporary EEs & Subs, etc.) AND the
// "Benefits" category (which rolls up under the Benefits + Payroll Taxes object,
// code 4). A band touching one of these is a compensation flow and gets a
// Staffing link -- so the object(comp) -> nces(salary/benefit) -> school chain
// is covered end to end for all three compensation objects.
const COMPENSATION_NCES_CODES = new Set(
  ALL_NCES.filter(
    (n) => n.nces_category === "Salaries" || n.nces_category === "Benefits",
  ).map((n) => n.nces_code),
);

// Facet index (the `c=f.N` context var) of a level in each dashboard. A level
// absent from a map isn't a facet there, so that dashboard is skipped.
const EXPENDITURES_FACET: Partial<Record<Level, string>> = {
  activity: "f.0",
  program: "f.1",
  object: "f.2",
};
// Which band endpoint levels can narrow Staffing (P-A-S), mapped to the facet
// its link opens on. School maps to Duty Root (f.3), NOT the School facet (f.2):
// an object->school band already narrows Staffing to a single school, so
// faceting on school would be degenerate -- Duty Root breaks the FTE out by
// role within that school instead, which is more useful.
const STAFFING_FACET: Partial<Record<Level, string>> = {
  activity: "f.0",
  program: "f.1",
  school: "f.3",
};

// The expenditure dimensions that can appear as a band endpoint / narrow term.
type ExpDim = "program" | "activity" | "object" | "nces" | "school";

// The ParamSpecs for the expenditure dimensions, seeded with the flow's active
// filters (each omitted from the URL if still at its full domain).
function activeParams(ctx: DeepLinkCtx): Record<ExpDim, ParamSpec> {
  const f = ctx.filters;
  return {
    program: { urlVar: "p", filter: ProgramFilter, codes: f.programCodes },
    activity: { urlVar: "a", filter: ActivityFilter, codes: f.activityCodes },
    object: { urlVar: "o", filter: ObjectFilter, codes: f.objectCodes },
    nces: { urlVar: "n", filter: NcesFilter, codes: f.ncesCodes },
    school: {
      urlVar: "s",
      filter: makeSchoolFilter(ctx.ccddd),
      codes: f.schoolCodes,
    },
  };
}

// Build a `<path>?d=c.<ccddd>~key.value~...&c=f.N` href, omitting any param
// still at its full domain (the "all selected" no-op).
function bandHref(
  path: string,
  ccddd: number,
  params: ParamSpec[],
  facet: string,
): string {
  const parts = [`c.${ccddd}`];
  for (const p of params) {
    if (!p.codes || p.codes.size >= p.filter.allCodes().size) {
      continue;
    }
    const s = p.filter.toFilterString(p.codes);
    if (s) {
      parts.push(`${p.urlVar}.${s}`);
    }
  }
  return (
    `${path}?d=${encodeURIComponent(parts.join("~"))}` +
    `&c=${encodeURIComponent(facet)}`
  );
}

export function linksForBand(
  from: SankeyNode,
  to: SankeyNode,
  ctx: DeepLinkCtx,
): DeepLink[] {
  const params = activeParams(ctx);
  // Narrow each endpoint that is an expenditure dimension to its own code, so
  // the target is filtered to exactly this band.
  for (const n of [from, to]) {
    const lvl = n.custom.level;
    if (n.custom.code !== null && lvl in params) {
      params[lvl as ExpDim] = {
        ...params[lvl as ExpDim],
        codes: new Set([n.custom.code]),
      };
    }
  }

  const facetLevel = to.custom.level;
  const links: DeepLink[] = [];

  // Expenditures (p/a/o) -- when the downstream level is one it can facet.
  const expFacet = EXPENDITURES_FACET[facetLevel];
  if (expFacet) {
    links.push({
      href: bandHref(
        "/finance/expenditures",
        ctx.ccddd,
        [params.program, params.activity, params.object],
        expFacet,
      ),
      label: "Bud/Act History",
    });
  }

  // Detailed Actuals (p/a/o/s/n), narrowed to the band and always opened on the
  // NCES facet (its finest breakdown), regardless of the band's downstream level.
  links.push({
    href: bandHref(
      "/finance/detailedactuals",
      ctx.ccddd,
      [
        params.program,
        params.activity,
        params.object,
        params.school,
        params.nces,
      ],
      "f.4",
    ),
    label: "Detailed Actuals",
  });

  // Staffing -- for any COMPENSATION band: one touching an uncollapsed
  // compensation object (2/3/4) OR a salary NCES code (the "Salaries" category:
  // regular / temporary employee salaries, etc.). This covers the whole comp
  // chain -- object(comp) -> nces(salary) -> school -- not just the object
  // endpoints. Narrow by whatever P-A-S the band constrains (endpoints that are
  // Program / Activity / School) plus active filters; the object/nces
  // compensation dimension is the relevance gate, not a narrow term (staffing
  // has neither filter). Facet on the P/A/School endpoint's own dimension, else
  // Duty Root (also used for School, whose staffing facet is broken).
  const isCompensationBand = [from, to].some(
    (n) =>
      n.custom.code !== null &&
      ((n.custom.level === "object" &&
        COMPENSATION_OBJECT_CODES.has(n.custom.code)) ||
        (n.custom.level === "nces" &&
          COMPENSATION_NCES_CODES.has(n.custom.code))),
  );
  if (isCompensationBand) {
    const staffEndpoint = [from, to].find(
      (n) => STAFFING_FACET[n.custom.level] !== undefined,
    );
    const staffFacet = staffEndpoint
      ? STAFFING_FACET[staffEndpoint.custom.level]!
      : "f.3"; // Duty Root default
    // If the compensation object is a SALARY object, narrow staffing to the
    // matching employment class: Certificated for object 2, Classified for
    // object 3. Benefits (object 4) and salary-nces bands with no object span
    // both, so no employment-class narrowing.
    const objCode = [from, to].find((n) => n.custom.level === "object")?.custom
      .code;
    const employmentClassCodes =
      objCode === 2
        ? CERTIFICATED_CLASS_CODES
        : objCode === 3
          ? CLASSIFIED_CLASS_CODES
          : undefined;
    const contractParam: ParamSpec[] = employmentClassCodes
      ? [
          {
            urlVar: "ec",
            filter: EmploymentClassFilter,
            codes: employmentClassCodes,
          },
        ]
      : [];
    links.push({
      href: bandHref(
        "/finance/staffing",
        ctx.ccddd,
        [params.program, params.activity, params.school, ...contractParam],
        staffFacet,
      ),
      label: "Staffing (FTE)",
    });
  }

  return links;
}
