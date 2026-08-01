"use client";

// Expenditure Flow (Sankey) view.
//
// Renders a single Highcharts sankey for the primary district: Revenue Source ->
// Program -> Activity, plus the optional Object / NCES / School columns. The
// heavy lifting (revenue->program attribution, filter diversion into the
// "Filtered Out" bands, node/link emission) lives in the arquero-free compute
// engine `utilities/sankey/`. This component only bakes the arquero frames down
// to one (class_of, data_type), calls `computeFlows`, and adapts its output to
// the Highcharts sankey series shape.

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import HighchartsReact from "highcharts-react-official";
import Popover from "@mui/material/Popover";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { usePathname, useRouter } from "next/navigation";
import { computeFlows } from "utilities/sankey/flows";
import { linksForBand, linksForNode } from "utilities/sankey/deepLinks";
import {
  flowLinkClass,
  flowNodeClass,
  schoolBucketClass,
  SCHOOL_BUCKET_COUNT,
  SCHOOL_PALETTE,
  sizeBuckets,
} from "utilities/sankey/colors";
import ALL_SCHOOLS from "utilities/domain/schools";
import { makeCurrencyFormatter } from "utilities/highcharts/utils";
import ActivityFilter from "app/finance/_filteritems/activity";
import NcesFilter from "app/finance/_filteritems/nces";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import RevenueCategoryFilter from "app/finance/_filteritems/revenue_category";
import RevenueFilter from "app/finance/_filteritems/revenue";
import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { serializeDatasetSettings } from "app/finance/_settings/common_settings";
import { useHighcharts } from "components/providers/HighchartsProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityFilterContents,
  NcesFilterContents,
  ObjectFilterContents,
  ProgramFilterContents,
  SchoolFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import {
  FlowRevenueCategoryFilterContents,
  FlowRevenueFilterContents,
} from "./FlowResourceFilterContents";
import FlowDatasetSettingsContents from "./FlowDatasetSettingsContents";
import FlowLevelContents from "./FlowLevelContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import {
  ACTUALS_ONLY_LEVELS,
  enabledLevelsFromPlan,
  SERIALIZE_FLOW_SETTINGS_GENERATORS,
} from "./FlowSettings";

import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { CommonContextSettings } from "app/finance/_settings/common_context_settings";
import type { FlowSettings } from "./FlowSettings";
import type { DeepLink, DeepLinkCtx } from "utilities/sankey/deepLinks";
import type {
  ExpRow,
  FlowFilters,
  Level,
  RevRow,
  SankeyLink,
  SankeyNode,
} from "utilities/sankey/types";

const fmt = makeCurrencyFormatter(2);
// School sizes are enrollment head-counts, not dollars: format them as plain
// rounded integers (for the size legend and the coalesced bucket labels).
const fmtCount = (n: number) => Math.round(n).toLocaleString();

function fiscalYearLabel(classOf: number): string {
  return `${classOf - 1}-${classOf}`;
}

// Render a band's deep links (see `linksForBand`) as one tooltip sentence:
// "Explore in <a>Expenditures</a> or <a>Detailed Actuals</a>" (an Oxford-comma
// list once Staffing joins). Empty string when the band has no links.
function bandLinksHtml(links: Array<DeepLink>): string {
  if (links.length === 0) {
    return "";
  }
  const anchors = links.map(
    (l) =>
      `<a href="${l.href}" target="_blank" rel="noopener" style="pointer-events:all">${l.label} ↗</a>`,
  );
  const joined =
    anchors.length === 1
      ? anchors[0]
      : anchors.length === 2
        ? `${anchors[0]} or ${anchors[1]}`
        : `${anchors.slice(0, -1).join(", ")}, or ${anchors[anchors.length - 1]}`;
  return `<br/>Explore in ${joined}`;
}

// When the School level coalesces, merge school nodes into aggregate group
// nodes per the caller-supplied `group` map (school node id -> {aggregate id,
// display name}) -- e.g. one node per enrollment-size bucket, middle-school
// attendance area, or region. Schools absent from the map (District Office; a
// school with no size in size mode) stay their own nodes. Each aggregate carries
// its merged schools as `members` (for the tooltip). Reroutes and re-sums every
// link touching a merged school. Color is driven by the aggregate id's prefix
// downstream (`sbucket:` -> size palette; others -> base), not this node.color.
function coalesceSchoolsByGroup(
  nodes: SankeyNode[],
  links: SankeyLink[],
  group: Map<string, { id: string; name: string }>,
): { nodes: SankeyNode[]; links: SankeyLink[] } {
  // Through-flow of each school (they are terminal, so pure inflow), for its
  // entry in the aggregate's member list.
  const flow = new Map<string, number>();
  for (const l of links) {
    flow.set(l.to, (flow.get(l.to) ?? 0) + l.weight);
  }
  const rename = new Map<string, string>();
  const groupName = new Map<string, string>();
  const members = new Map<string, Array<{ name: string; weight: number }>>();
  let column = 0;
  for (const n of nodes) {
    const g = group.get(n.id);
    if (g === undefined) {
      continue;
    }
    rename.set(n.id, g.id);
    groupName.set(g.id, g.name);
    column = n.column;
    const m = { name: n.name, weight: flow.get(n.id) ?? 0 };
    const arr = members.get(g.id);
    if (arr) {
      arr.push(m);
    } else {
      members.set(g.id, [m]);
    }
  }
  if (rename.size === 0) {
    return { nodes, links };
  }

  // Reroute each link onto the aggregate ids and re-sum duplicate (from, to).
  const mapId = (id: string) => rename.get(id) ?? id;
  const merged = new Map<string, SankeyLink>();
  for (const l of links) {
    const from = mapId(l.from);
    const to = mapId(l.to);
    const key = `${from}\t${to}`;
    const prev = merged.get(key);
    if (prev) {
      prev.weight += l.weight;
    } else {
      merged.set(key, { from, to, weight: l.weight });
    }
  }

  const groupNodes: SankeyNode[] = [...members.entries()].map(([id, mem]) => ({
    id,
    name: groupName.get(id) ?? "Schools",
    color: "#000",
    column,
    custom: {
      level: "school" as const,
      code: null,
      members: mem.sort((a, c) => c.weight - a.weight),
    },
  }));
  return {
    nodes: nodes.filter((n) => !rename.has(n.id)).concat(groupNodes),
    links: [...merged.values()],
  };
}

// State for the click-triggered Popover fallback. `stickOnContact` (set on
// the tooltip below) is Highcharts' documented mechanism for keeping an
// HTML tooltip open while the pointer crosses into it so its links become
// clickable, but this repo has no prior sankey/HTML-tooltip-with-links
// precedent to lean on and no browser was available this session to watch a
// real click land (see the Session 5 Progress Log entry in SANKEY_PLAY.md).
// This Popover -- opened by an explicit point click, entirely independent of
// tooltip hover/stick behavior -- is the fallback: same `linkForNode`-built
// links, just on a surface that's clickable by construction.
type PopoverState = {
  top: number;
  left: number;
  title: string;
  links: Array<DeepLink>;
};

// A locked highlight: a single node, or a single band (from -> to). Clicking a
// node/band locks it (the rest of the diagram dims and stays dimmed); it is
// serialized into the URL fragment so the highlighted view can be shared/emailed
// and reopened exactly. Node ids (`src:1000`, `prog:1`, `fb:drawdown`,
// `other:2`, ...) never contain `|`, so `|` is a safe field delimiter.
type Highlight =
  | { kind: "node"; id: string }
  | { kind: "band"; from: string; to: string };

function formatHighlight(h: Highlight): string {
  return h.kind === "node" ? `node|${h.id}` : `band|${h.from}|${h.to}`;
}

// Parse the highlight out of a URL hash (`#hl=node|<id>` / `#hl=band|<from>|<to>`).
// Tolerates the value being percent-encoded (some clients encode `|`).
function parseHighlight(hash: string): Highlight | null {
  const m = /(?:^|[#&])hl=([^&]+)/.exec(hash);
  if (!m) {
    return null;
  }
  const parts = decodeURIComponent(m[1]).split("|");
  if (parts[0] === "node" && parts[1]) {
    return { kind: "node", id: parts[1] };
  }
  if (parts[0] === "band" && parts[1] && parts[2]) {
    return { kind: "band", from: parts[1], to: parts[2] };
  }
  return null;
}

function sameHighlight(a: Highlight | null, b: Highlight | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  if (a.kind === "node" && b.kind === "node") {
    return a.id === b.id;
  }
  if (a.kind === "band" && b.kind === "band") {
    return a.from === b.from && a.to === b.to;
  }
  return false;
}

const linkKeyOf = (from: string, to: string) => `${from} ${to}`;

// Given the current highlight and the chart's node ids + link (from,to) pairs,
// return the node ids and link keys that stay LIT (everything else dims), plus
// whether the highlight's target is present at all. All null / present:false
// when there is no active, still-present highlight -- nothing dims. Used by the
// imperative highlight effect (which reads the live chart's nodes/links), so the
// dim is applied by toggling a CSS class on existing SVG elements rather than by
// rebuilding the chart.
function litSetsFor(
  highlight: Highlight | null,
  nodeIds: Set<string>,
  links: ReadonlyArray<{ from: string; to: string }>,
): {
  litNodes: Set<string> | null;
  litLinks: Set<string> | null;
  present: boolean;
} {
  const present =
    highlight === null
      ? false
      : highlight.kind === "node"
        ? nodeIds.has(highlight.id)
        : links.some((l) => l.from === highlight.from && l.to === highlight.to);
  if (!highlight || !present) {
    return { litNodes: null, litLinks: null, present: false };
  }
  const litNodes = new Set<string>();
  const litLinks = new Set<string>();
  if (highlight.kind === "node") {
    // Light the node plus every band touching it and each band's far end.
    litNodes.add(highlight.id);
    for (const l of links) {
      if (l.from === highlight.id || l.to === highlight.id) {
        litLinks.add(linkKeyOf(l.from, l.to));
        litNodes.add(l.from);
        litNodes.add(l.to);
      }
    }
  } else {
    // Light exactly the one band and its two endpoints.
    litNodes.add(highlight.from);
    litNodes.add(highlight.to);
    litLinks.add(linkKeyOf(highlight.from, highlight.to));
  }
  return { litNodes, litLinks, present: true };
}

export default function FlowDashboard({
  districtDataMap,
  contextSettings,
  allSettings,
}: DistrictDataContentProps<FlowSettings, CommonContextSettings>) {
  const { highchartsObjs } = useHighcharts();
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // The locked highlight (see the `Highlight` type). It lives in the URL hash so
  // it round-trips through share/email/reload; state mirrors the hash. Initialize
  // from the current hash on mount (client-only; the server can't read it) and
  // keep in sync with back/forward and hand-edited links via `hashchange`.
  const [highlight, setHighlightState] = useState<Highlight | null>(null);
  useEffect(() => {
    const sync = () => setHighlightState(parseHighlight(window.location.hash));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Set (or clear, with null) the highlight, writing it to the URL hash without a
  // navigation (`replaceState` keeps the settings query intact and avoids a Next
  // server round-trip). Stable identity so the chart `useMemo` can depend on it.
  const applyHighlight = useCallback((h: Highlight | null) => {
    setHighlightState(h);
    const base = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(
      null,
      "",
      h ? `${base}#hl=${formatHighlight(h)}` : base,
    );
  }, []);

  // Handle to the live chart, so the highlight can be applied imperatively
  // (toggling `flow-dim` on existing SVG nodes/links) without rebuilding it.
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  // The name of the currently-highlighted node/band, for the "Highlighting: …"
  // chip. Derived in the highlight effect (which has the live node names).
  const [highlightLabel, setHighlightLabel] = useState<string | null>(null);

  // Measure the scroll container's width so the chart can keep a minimum width
  // per column on narrow / mobile viewports (see the `width` floor below): when
  // the viewport is narrower than that floor the chart holds its width and the
  // container scrolls horizontally rather than crushing the sankey to
  // illegibility. Defaults to 0 (the floor wins) until the observer fires.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [availWidth, setAvailWidth] = useState(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const update = () => setAvailWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The on-graph Actuals/Budget toggle changes the same `dataType` setting the
  // sidebar does, so the two stay in sync. It navigates to the URL with the new
  // dataType (mirroring SettingsLayout's own navigation) so the whole settings
  // round-trip and chart recompute run exactly as they do from the sidebar.
  const setDataType = (dataType: "actuals" | "budget") => {
    const newAllSettings = allSettings.map((s, i) =>
      i === 0 ? { ...s, dataType } : s,
    );
    const queries = serializeDatasetSettings(
      newAllSettings,
      SERIALIZE_FLOW_SETTINGS_GENERATORS,
    )
      .filter((q) => !!q)
      .map((q) => `d=${q}`);
    if (queries.length > 0) {
      router.replace(`${pathname}?${queries.join("&")}`);
    }
  };

  const {
    options,
    empty,
    emptyReason,
    chartWidth,
    hasFilteredOut,
    schoolLegend,
  } = useMemo(() => {
    const settings = allSettings[0];
    const districtData = districtDataMap[settings.ccddd];
    // The deep links carry the flow's currently active filters (so they examine
    // the highlighted item in the current context) and narrow to the node's own
    // code.
    const ctx: DeepLinkCtx = {
      ccddd: settings.ccddd,
      sourceMode: settings.sourceMode,
      filters: {
        revenueCategoryCodes: settings.revenueCategoryCodes,
        revenueCodes: settings.revenueCodes,
        programCodes: settings.programCodes,
        activityCodes: settings.activityCodes,
        objectCodes: settings.objectCodes,
        ncesCodes: settings.ncesCodes,
        schoolCodes: settings.schoolCodes,
      },
    };

    // Resolve the year: explicit selection, else the latest available.
    // Resolve the latest year from years that actually have expenditure data
    // (matching the year picker in FlowLevelContents), not the full min..max
    // span, so the default "latest" never lands on an empty year.
    const years = districtData
      .expenditureClassOfs()
      .array("class_of") as number[];
    const year =
      settings.classOf ?? (years.length > 0 ? Math.max(...years) : 0);
    const dt = settings.dataType;

    // School size is measured by total enrollment (OSPI rc_enrollment headcount)
    // keyed by school_code, for the chosen size year (default: the chart's own
    // year). rc_enrollment doesn't cover every expenditure year; when the size
    // year has none (`haveEnrollment` false) size-based coloring/grouping isn't
    // possible.
    const sizeYear = settings.schoolSizeYear ?? year;
    const enrollmentByCode = districtData.schoolEnrollmentTotals(sizeYear);
    const haveEnrollment = enrollmentByCode.size > 0;
    // How School coalescing groups schools, and whether we do it ourselves (vs
    // the engine's generic "Other" rule): always for ms/region, and for size
    // only when enrollment covers the size year.
    const sizeMode = settings.schoolCoalesceMode === "size";
    const customSchoolCoalesce =
      settings.coalesceLevels.has("school") && (!sizeMode || haveEnrollment);

    // Bake the arquero frames down to one (class_of, data_type) as plain rows.
    const expRows = districtData
      .expenditures()
      .params({ year, dt })
      .filter((d, $) => d.class_of === $.year && d.data_type === $.dt)
      .objects() as ExpRow[];
    const revRows = districtData
      .revenues()
      .params({ year, dt })
      .filter((d, $) => d.class_of === $.year && d.data_type === $.dt)
      .objects() as RevRow[];

    // A filter that still has its whole domain selected means "no filter": pass
    // undefined so codes that exist in the data but not in the filter's domain
    // (e.g. unassigned NCES / school on much of GF spending) are shown instead
    // of being swept into a single huge "Filtered Out" node. Only a genuinely
    // narrowed selection filters. (`filteredExpenditures` behaves the same way,
    // skipping a filter it was passed undefined for.)
    const narrowed = (
      codes: Set<number> | undefined,
      domain: Set<number>,
    ): Set<number> | undefined =>
      codes && codes.size < domain.size ? codes : undefined;
    const sourceIsAccount = settings.sourceMode === "account";

    // Budget has no NCES / School breakdown, so drop those levels in Budget mode
    // even if the level plan (carried over from Actuals) still has them enabled.
    const levelAvailable = (l: Level) =>
      dt !== "budget" || !ACTUALS_ONLY_LEVELS.includes(l);
    const enabledLevels = enabledLevelsFromPlan(settings.levelPlan).filter(
      levelAvailable,
    );
    // With the Resource column hidden there is no per-source split to test, so
    // the Resource filter does not apply -- and the settings panel disables it
    // (see FlowResourceFilterContents) so the two can never disagree.
    const showSource = enabledLevels.includes("source");

    const filters: FlowFilters = {
      sourceCodes: showSource
        ? narrowed(
            sourceIsAccount
              ? settings.revenueCodes
              : settings.revenueCategoryCodes,
            (sourceIsAccount
              ? RevenueFilter
              : RevenueCategoryFilter
            ).allCodes(),
          )
        : undefined,
      programCodes: narrowed(settings.programCodes, ProgramFilter.allCodes()),
      activityCodes: narrowed(
        settings.activityCodes,
        ActivityFilter.allCodes(),
      ),
      objectCodes: narrowed(settings.objectCodes, ObjectFilter.allCodes()),
      ncesCodes: narrowed(settings.ncesCodes, NcesFilter.allCodes()),
      schoolCodes: narrowed(
        settings.schoolCodes,
        makeSchoolFilter(settings.ccddd).allCodes(),
      ),
    };

    // A narrowed filter on a HIDDEN level still applies: it gates the flow into
    // the "Filtered Out" band at the column that level would have occupied
    // (see ComputeFlowsOpts.gates), so hiding a column never silently discards
    // its filter. Walk the plan in order counting displayed columns; a level
    // with no data behind it in this mode (NCES / School under Budget) is
    // skipped entirely, and Source is never gated (see `showSource` above).
    const gates: Array<{ level: Exclude<Level, "source">; column: number }> =
      [];
    let displayColumn = 0;
    for (const entry of settings.levelPlan) {
      if (!levelAvailable(entry.level)) {
        continue;
      }
      if (entry.enabled) {
        displayColumn++;
      } else if (entry.level !== "source") {
        gates.push({ level: entry.level, column: displayColumn });
      }
    }

    // All resources deselected: `narrowed` yields a present-but-empty source
    // filter, so every real revenue source is filtered out. Only the always-pass
    // Fund Balance Drawdown source would survive, collapsing the chart to an
    // all-red "everything is a drawdown" picture -- which is misleading. Show an
    // explicit empty state instead. (Only meaningful when the Resource column is
    // shown; otherwise the source filter isn't applied.)
    if (
      enabledLevels.includes("source") &&
      filters.sourceCodes &&
      filters.sourceCodes.size === 0
    ) {
      return {
        options: null,
        empty: true,
        emptyReason: "resources" as const,
        chartWidth: 0,
        hasFilteredOut: false,
        schoolLegend: [] as Array<{
          color: string;
          min: number;
          max: number;
        }>,
      };
    }
    // When we take over School coalescing (`customSchoolCoalesce`), hold "school"
    // back from the engine and group schools ourselves below (by size / middle-
    // school area / region). Otherwise let the engine coalesce schools its
    // default "Other Schools" way.
    const {
      nodes: rawNodes,
      links: rawLinks,
      totals,
    } = computeFlows(expRows, revRows, {
      mode: settings.sourceMode,
      enabledLevels,
      filters,
      gates,
      coalesceLevels: [...settings.coalesceLevels].filter(
        (l) => l !== "school" || !customSchoolCoalesce,
      ),
    });

    if (rawLinks.length === 0) {
      return {
        options: null,
        empty: true,
        emptyReason: "data" as const,
        chartWidth: 0,
        hasFilteredOut: false,
        schoolLegend: [] as Array<{
          color: string;
          min: number;
          max: number;
        }>,
      };
    }

    // Nodes pinned to the BOTTOM of their column regardless of size: the
    // "Filtered Out" (flt:) nodes and the District Office school node(s).
    const districtOfficeNodeIds = new Set(
      (ALL_SCHOOLS[settings.ccddd] ?? [])
        .filter((s) => s.is_district_office)
        .map((s) => `sch:${s.school_code}`),
    );

    // For SIZE-mode GROUPING only: rank the individual schools by enrollment
    // (see enrollmentByCode) into buckets so they can merge into enrollment tiers
    // ("Schools · 294–450 headcount"). Excludes the District Office and any school the
    // enrollment data omits; empty when the size year has no enrollment
    // (`haveEnrollment` false). Node COLOR is handled separately, by node size,
    // below.
    const enrollSizes = new Map<string, number>();
    if (haveEnrollment) {
      for (const n of rawNodes) {
        if (n.custom.level === "school" && !districtOfficeNodeIds.has(n.id)) {
          const e =
            n.custom.code !== null
              ? enrollmentByCode.get(n.custom.code)
              : undefined;
          if (e !== undefined) {
            enrollSizes.set(n.id, e);
          }
        }
      }
    }
    const enrollBucket = sizeBuckets(enrollSizes, SCHOOL_BUCKET_COUNT);
    const enrollRange = new Map<number, { min: number; max: number }>();
    for (const [id, b] of enrollBucket.entries()) {
      const s = enrollSizes.get(id) ?? 0;
      const r = enrollRange.get(b);
      if (r) {
        r.min = Math.min(r.min, s);
        r.max = Math.max(r.max, s);
      } else {
        enrollRange.set(b, { min: s, max: s });
      }
    }
    // Label size tiers with the enrollment RANGE and its unit ("headcount") so
    // the numbers don't read as school identifiers -- e.g. "Schools · 486–989
    // headcount" rather than "Schools 486–989".
    const enrollLabel = (b: number) => {
      const r = enrollRange.get(b);
      return r
        ? `Schools · ${fmtCount(r.min)}–${fmtCount(r.max)} headcount`
        : "Schools";
    };

    // When we take over School coalescing, decide which aggregate each school
    // merges into, by the chosen mode: an enrollment-size bucket ("Schools
    // 294–450"), a middle-school attendance area, or a region (labeled by name).
    // The District Office is excluded (it stays its own bottom-pinned node); a
    // school with no enrollment (size mode) stays an individual node. Empty map
    // => nothing to merge (engine output as-is). Coloring is by node size below.
    const schoolGroup = new Map<string, { id: string; name: string }>();
    if (customSchoolCoalesce) {
      const infoByCode = new Map(
        (ALL_SCHOOLS[settings.ccddd] ?? []).map((s) => [s.school_code, s]),
      );
      for (const n of rawNodes) {
        if (n.custom.level !== "school" || districtOfficeNodeIds.has(n.id)) {
          continue;
        }
        const code = n.custom.code;
        if (code === null) {
          continue;
        }
        if (sizeMode) {
          const b = enrollBucket.get(n.id);
          if (b !== undefined) {
            schoolGroup.set(n.id, {
              id: `sbucket:${b}`,
              name: enrollLabel(b),
            });
          }
        } else if (settings.schoolCoalesceMode === "ms") {
          const info = infoByCode.get(code);
          schoolGroup.set(n.id, {
            id: `smsg:${info?.ms_assignment_code ?? 0}`,
            name: info?.ms_assignment ?? "Unknown area",
          });
        } else {
          const info = infoByCode.get(code);
          schoolGroup.set(n.id, {
            id: `sregion:${info?.region ?? "unknown"}`,
            name: info?.region ?? "Unknown region",
          });
        }
      }
    }
    const { nodes, links } =
      schoolGroup.size > 0
        ? coalesceSchoolsByGroup(rawNodes, rawLinks, schoolGroup)
        : { nodes: rawNodes, links: rawLinks };

    // A "Filtered Out" band only appears when a per-level filter diverts
    // flow; surface an explanatory caption in that case (see the legend note
    // below the chart).
    const hasFilteredOut = nodes.some((n) => n.custom.level === "filtered");

    // Order nodes so the largest sit at the top of each column. Highcharts lays
    // out a column's nodes in the order they are first *created*, which is the
    // order they are first encountered while scanning the links (data) array.
    // So we sort the links by their endpoints' magnitude: sorting by the from
    // node's size makes the source column exactly size-descending, and the
    // secondary to-node sort floats the big downstream nodes up as well.
    const inflow = new Map<string, number>();
    const outflow = new Map<string, number>();
    for (const l of links) {
      outflow.set(l.from, (outflow.get(l.from) ?? 0) + l.weight);
      inflow.set(l.to, (inflow.get(l.to) ?? 0) + l.weight);
    }
    // A node's magnitude is the larger of its in/out flow (they are equal for
    // interior nodes by conservation; one side is 0 for pure sources / sinks).
    const nodeSize = (id: string) =>
      Math.max(inflow.get(id) ?? 0, outflow.get(id) ?? 0);
    // Highcharts orders a column top->bottom by node creation order (first
    // appearance in the links scan). We push certain nodes to the bottom by
    // sorting their links last, in tiers: normal nodes first (top, size-ranked),
    // then the bottom-pinned tier -- the District Office (the lowest-ranked
    // *school*) and the General Fund Balance nodes (`fb:` -- Drawdown in the
    // Resource column, Growth in the Program column), which read as accounting
    // artifacts rather than spending and belong out of the size ranking -- then
    // Filtered Out (conceptually no longer in the chart -- always the very
    // bottom).
    const nodeBottomRank = (id: string): number =>
      id.startsWith("flt:")
        ? 2
        : id.startsWith("fb:") || districtOfficeNodeIds.has(id)
          ? 1
          : 0;
    const linkBottomRank = (l: (typeof links)[number]) =>
      Math.max(nodeBottomRank(l.from), nodeBottomRank(l.to));
    const sortedLinks = [...links].sort((a, b) => {
      const ra = linkBottomRank(a);
      const rb = linkBottomRank(b);
      if (ra !== rb) {
        return ra - rb; // lower tier first (top); higher tier last (bottom)
      }
      const fromDelta = nodeSize(b.from) - nodeSize(a.from);
      if (fromDelta !== 0) {
        return fromDelta;
      }
      const toDelta = nodeSize(b.to) - nodeSize(a.to);
      if (toDelta !== 0) {
        return toDelta;
      }
      return b.weight - a.weight;
    });

    // Size the chart to the DENSEST column so every node has room for its label
    // (labels are never hidden or overlapping — see nodePadding + dataLabels
    // below). Height scales with the max nodes-in-a-column; the tall result
    // scrolls inside the container.
    const columnCounts = new Map<number, number>();
    for (const n of nodes) {
      columnCounts.set(n.column, (columnCounts.get(n.column) ?? 0) + 1);
    }
    const maxColumnCount = columnCounts.size
      ? Math.max(...columnCounts.values())
      : 0;
    // ~28px per node (nodePadding 18 + body + label line) plus title/margins.
    const height = Math.max(700, maxColumnCount * 28 + 120);

    // Labels sit to the RIGHT of every node, so only the RIGHTMOST column's
    // labels extend past the right edge — size the right margin to the longest
    // label IN THAT COLUMN (using the global longest left a wide gutter when a
    // long name lived in an earlier column). Other columns' labels point inward.
    const maxColumn = columnCounts.size ? Math.max(...columnCounts.keys()) : 0;
    const lastColMaxLen = nodes.reduce(
      (m, n) => (n.column === maxColumn ? Math.max(m, n.name.length) : m),
      0,
    );
    const marginRight = Math.min(460, Math.round(lastColMaxLen * 7.5) + 22);

    // Keep a minimum drawable width: the label gutter (marginLeft + marginRight)
    // plus room for each column's bands. On a phone-width container the raw
    // marginRight alone can exceed the viewport, leaving zero plot width and a
    // crushed, unreadable chart. When the measured container is narrower than
    // this floor, the chart holds the floor width and the surrounding Box scrolls
    // horizontally (matching this view's existing scroll-in-both-directions
    // design) rather than shrinking the sankey into illegibility.
    const columnCount = maxColumn + 1;
    const width = Math.max(availWidth, 12 + marginRight + columnCount * 150);

    // Color EVERY school-column node -- individual school, size/ms/region
    // aggregate, engine "Other Schools", AND the District Office -- by its NODE
    // SIZE (through-flow magnitude), ranked onto the plasma ramp (see
    // SCHOOL_PALETTE). Applies to all categorize modes. The District Office is
    // included: it is (almost) always the largest node, so it lands in the top
    // bucket -- the brightest color. (The ramp is rank-based, so its outlier
    // magnitude doesn't distort the others.) Color is independent of ordering:
    // the District Office is still pinned to the bottom (see nodeBottomRank).
    const colorSizes = new Map<string, number>();
    for (const n of nodes) {
      if (n.custom.level === "school") {
        colorSizes.set(n.id, nodeSize(n.id));
      }
    }
    const schoolColorBucket = sizeBuckets(colorSizes, SCHOOL_BUCKET_COUNT);
    // Legend: each occupied plasma bucket's color and its node-size ($) range.
    const colorRange = new Map<number, { min: number; max: number }>();
    for (const [id, b] of schoolColorBucket.entries()) {
      const s = colorSizes.get(id) ?? 0;
      const r = colorRange.get(b);
      if (r) {
        r.min = Math.min(r.min, s);
        r.max = Math.max(r.max, s);
      } else {
        colorRange.set(b, { min: s, max: s });
      }
    }
    const schoolLegend = [...colorRange.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([bucket, r]) => ({
        color: SCHOOL_PALETTE[bucket] ?? "#000",
        min: r.min,
        max: r.max,
      }));

    const dataTypeLabel = dt === "budget" ? "Budget" : "Actuals";

    // Deficit years draw down the fund balance; surplus years grow it. Show
    // whichever applies rather than a misleading "Drawdown $0.00".
    const fundBalanceClause =
      totals.drawdown > 0.005
        ? `General Fund Balance Drawdown ${fmt(totals.drawdown)}`
        : totals.growth > 0.005
          ? `General Fund Balance Growth ${fmt(totals.growth)}`
          : "Balanced";

    const chartOptions = {
      // styledMode: colors, text, and background all come from CSS (see
      // highcharts-base.scss + the loaded highcharts.css), which carries a
      // prefers-color-scheme: dark block. Without it Highcharts writes title /
      // subtitle / data-label colors as INLINE styles computed against its
      // assumed white background, so in dark mode they render dark-on-dark
      // (unreadable) while the CSS-driven background is actually dark. Every
      // other finance chart already runs in styled mode; this one was the
      // exception. width: see the floor above (mobile legibility).
      chart: { height, width, marginLeft: 12, marginRight, styledMode: true },
      credits: { enabled: false },
      title: {
        text: `${settings.name} — General Fund Expenditure Flow`,
      },
      subtitle: {
        text: `${fiscalYearLabel(year)} ${dataTypeLabel} · Total ${fmt(
          totals.grandTotal,
        )} · Revenue ${fmt(totals.revenue)} · ${fundBalanceClause}`,
      },
      series: [
        {
          type: "sankey",
          keys: ["from", "to", "weight"],
          data: sortedLinks.map((l) => ({
            from: l.from,
            to: l.to,
            weight: l.weight,
            // Color by CSS class (see colors.ts): base (budget grey / actuals
            // blue), except drawdown outflow bands (red), growth inflow bands
            // (green), and — when highlighting PTA — the PTA source's bands. A
            // locked highlight dims every band outside it by toggling `flow-dim`
            // imperatively on the rendered element (see the highlight effect).
            className: flowLinkClass(l.from, l.to, dt, settings.highlightPta),
          })),
          nodes: nodes.map((n) => ({
            id: n.id,
            name: n.name,
            // Color by CSS class. School nodes are colored by size bucket
            // (District Office is excluded and falls through to base);
            // everything else is base, except the drawdown node (red), growth
            // node (green), Filtered Out (grey), and — highlighting PTA — the
            // PTA-funding source node.
            className: schoolColorBucket.has(n.id)
              ? schoolBucketClass(schoolColorBucket.get(n.id)!)
              : flowNodeClass(n, dt, settings.highlightPta),
            column: n.column,
            custom: n.custom,
          })),
          // nodePadding fixes a minimum vertical gap between adjacent nodes
          // (independent of node size), so labels centered on tiny nodes don't
          // collide. Combined with the height above (which keeps Highcharts
          // from shrinking this padding) and allowOverlap, labels are never
          // hidden and never overlap.
          nodePadding: 18,
          nodeWidth: 12,
          dataLabels: {
            useHTML: true,
            inside: false,
            // Place the label beside the node (to its right), vertically
            // centered on it, rather than centered over it or below it.
            align: "left",
            verticalAlign: "middle",
            x: 15,
            y: 0,
            allowOverlap: true,
            crop: false,
            overflow: "allow",
            // Append the coalesced-member count in italics so it doesn't read
            // as part of the category name (e.g. "Other Activities (3)").
            nodeFormatter(this: any) {
              const name = this.point?.name ?? "";
              const members = this.point?.options?.custom?.members as
                | Array<unknown>
                | undefined;
              return members && members.length
                ? `${name} <i style="opacity:0.7">(${members.length})</i>`
                : name;
            },
            style: { fontSize: "0.7rem", textOutline: "1px contrast" },
          },
        },
      ],
      tooltip: {
        useHTML: true,
        stickOnContact: true,
        // Follow the pointer so the tooltip appears where you're hovering, not
        // anchored off by the (now side-placed) node. stickOnContact still
        // freezes it when the pointer moves onto the tooltip so its links stay
        // clickable (and the click-Popover is the backup).
        followPointer: true,
        // On touch devices Highcharts defaults followTouchMove to true, which
        // hijacks single-finger drags to move the tooltip -- so the wide sankey
        // (see the width floor) can't be panned/scrolled horizontally, which is
        // exactly how you read it on a phone. Turn it off: a one-finger drag now
        // scrolls the container, and a tap still opens the tooltip / Popover.
        followTouchMove: false,
        hideDelay: 300,
        // `this` is a Highcharts sankey Point; both node points and
        // from/to "link" (band) points land here.
        formatter(this: any) {
          const p = this.point;
          if (!p.from) {
            // Node hover: total through-flow. A coalesced "Other" node lists
            // the small categories it combined; otherwise a single deep link
            // when the node is linkable (Fund Balance / Filtered Out are not).
            const members = p.options?.custom?.members as
              | Array<{ name: string; weight: number }>
              | undefined;
            if (members && members.length) {
              const MAX = 15;
              const shown = members
                .slice(0, MAX)
                .map((m) => `${m.name}: ${fmt(m.weight)}`)
                .join("<br/>");
              const more =
                members.length > MAX
                  ? `<br/>…and ${members.length - MAX} more`
                  : "";
              return `<b>${p.name} (${members.length})</b><br/>${fmt(p.sum)}<br/>${shown}${more}`;
            }
            // Node hover: one view filtered to just this node, faceted on its
            // OWN level -- same "Explore in <a>…</a> or <a>…</a>" phrasing as a
            // band's links.
            const nodeLinks = linksForNode(p.options as SankeyNode, ctx);
            return `<b>${p.name}</b><br/>${fmt(p.sum)}${bandLinksHtml(nodeLinks)}`;
          }

          // Band hover: one view filtered to exactly this band, faceted on the
          // downstream level -- Expenditures / Detailed Actuals (+ Staffing for
          // compensation-object flows). See `linksForBand`.
          const links = linksForBand(
            p.fromNode.options as SankeyNode,
            p.toNode.options as SankeyNode,
            ctx,
          );
          return (
            `<b>${p.fromNode.name} → ${p.toNode.name}</b><br/>${fmt(p.weight)}` +
            bandLinksHtml(links)
          );
        },
      },
      plotOptions: {
        sankey: {
          // Don't auto-assign per-node palette colors; the CSS classes set the
          // fill (see colors.ts / highcharts-base.scss).
          colorByPoint: false,
          // The single accent-on-hover color is applied by CSS
          // (.highcharts-point-hover), since a fill attribute here would be
          // overridden by the styled-mode CSS. We still dim the rest via the
          // inactive state (opacity is not overridden by the color CSS).
          states: {
            inactive: { opacity: 0.3, linkOpacity: 0.08 },
          },
          point: {
            events: {
              click(this: any, event: any) {
                const p = this;

                // 1. Lock (or toggle off) the highlight on this node/band, and
                // write it to the URL so the view can be shared. This runs for
                // EVERY clickable point, including Fund Balance / Filtered Out
                // (which have no deep links). Read the CURRENT highlight straight
                // from the URL (the source of truth `applyHighlight` writes
                // synchronously) rather than a captured/closed-over value: this
                // handler is bound once at chart creation, so a closed-over
                // `highlight` would be stale and clicking the already-locked
                // target would never toggle off.
                const target: Highlight | null = p.isNode
                  ? { kind: "node", id: (p.options as SankeyNode).id }
                  : p.from && p.to
                    ? { kind: "band", from: p.from, to: p.to }
                    : null;
                if (target) {
                  const current = parseHighlight(window.location.hash);
                  applyHighlight(
                    sameHighlight(target, current) ? null : target,
                  );
                }

                // 2. Click-to-open fallback (see the `PopoverState` comment
                // above): guarantees the two deep links are reachable even if
                // `stickOnContact` doesn't keep the HTML tooltip open for a
                // pointer to cross into on every platform/input device.
                let title = "";
                let links: Array<DeepLink> = [];
                if (p.isNode) {
                  title = p.name;
                  links = linksForNode(p.options as SankeyNode, ctx);
                } else if (p.fromNode && p.toNode) {
                  title = `${p.fromNode.name} → ${p.toNode.name}`;
                  links = linksForBand(
                    p.fromNode.options as SankeyNode,
                    p.toNode.options as SankeyNode,
                    ctx,
                  );
                }

                if (links.length === 0) {
                  return;
                }

                setPopover({
                  top: event.pageY ?? 0,
                  left: event.pageX ?? 0,
                  title,
                  links,
                });
              },
            },
          },
        },
      },
    };

    return {
      options: chartOptions,
      empty: false,
      emptyReason: null as null | "resources" | "data",
      chartWidth: width,
      hasFilteredOut,
      schoolLegend,
    };
  }, [districtDataMap, allSettings, availWidth, applyHighlight]);

  // Apply the locked highlight IMPERATIVELY to the already-rendered chart: dim
  // every node/band outside the highlighted flow by toggling the `flow-dim`
  // class on its existing SVG element (and fading its HTML label). This runs on
  // every highlight change and after each chart rebuild (`options` dep) but
  // never rebuilds the chart itself, so clicking to lock/unlock is instant with
  // no flicker. `flow-dim` dims via fill-/stroke-opacity, which Highcharts'
  // hover/inactive states (which drive element `opacity`) don't reset -- so the
  // lock holds even as you mouse over the dimmed parts.
  useEffect(() => {
    const chart = chartRef.current?.chart;
    const series = chart?.series?.[0] as any;
    if (!series) {
      return;
    }
    const nodePoints = (series.nodes ?? []) as any[];
    const linkPoints = (series.points ?? []) as any[];
    const nodeIds = new Set(nodePoints.map((n) => n.id));
    const { litNodes, litLinks, present } = litSetsFor(
      highlight,
      nodeIds,
      linkPoints.map((l) => ({ from: l.from, to: l.to })),
    );

    const setDim = (gfx: any, dim: boolean) => {
      const el = gfx?.element as SVGElement | undefined;
      el?.classList.toggle("flow-dim", dim);
    };
    const setLabelDim = (point: any, dim: boolean) => {
      // useHTML labels: the text lives in `dataLabel.div` (HTML); fall back to
      // the SVG element otherwise.
      const el = (point?.dataLabel?.div ?? point?.dataLabel?.element) as
        | HTMLElement
        | SVGElement
        | undefined;
      if (el) {
        el.style.opacity = dim ? "0.25" : "";
      }
    };
    for (const n of nodePoints) {
      const dim = litNodes !== null && !litNodes.has(n.id);
      setDim(n.graphic, dim);
      setLabelDim(n, dim);
    }
    for (const l of linkPoints) {
      const dim = litLinks !== null && !litLinks.has(linkKeyOf(l.from, l.to));
      setDim(l.graphic, dim);
    }

    // Chip label; also clear a now-stale highlight (its target got coalesced /
    // filtered away by a settings change) so the URL stops naming a ghost.
    if (highlight && !present) {
      setHighlightLabel(null);
      applyHighlight(null);
      return;
    }
    const nameOf = (id: string) =>
      nodePoints.find((n) => n.id === id)?.name ?? id;
    setHighlightLabel(
      !highlight
        ? null
        : highlight.kind === "node"
          ? nameOf(highlight.id)
          : `${nameOf(highlight.from)} → ${nameOf(highlight.to)}`,
    );
  }, [highlight, options, applyHighlight]);

  // A signature that changes on any settings change, used to key (and thus
  // remount) the chart so it always reflects the current options. The locked
  // highlight is deliberately NOT part of this key: it is applied imperatively
  // (see the highlight effect below), so toggling it never rebuilds the chart.
  const chartKey = serializeDatasetSettings(
    allSettings,
    SERIALIZE_FLOW_SETTINGS_GENERATORS,
  ).join("|");

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: (newAllSettings) =>
          serializeDatasetSettings(
            newAllSettings,
            SERIALIZE_FLOW_SETTINGS_GENERATORS,
          ),
        // No context settings for this view.
        serializeContext: () => "",
      }}
      contextSettings={contextSettings}
      contextSettingsComponents={[]}
      allSettings={allSettings}
      settingsContentsComponents={[
        FlowDatasetSettingsContents,
        FlowLevelContents,
        FlowRevenueCategoryFilterContents,
        FlowRevenueFilterContents,
        ProgramFilterContents,
        ActivityFilterContents,
        ObjectFilterContents,
        NcesFilterContents,
        SchoolFilterContents,
      ]}
      // The Flow view is a single-dataset, per-district view (see FlowSettings),
      // so the multi-dataset "Add Comparison" button doesn't apply.
      hideAddComparison
    >
      {/* The parent content region in SettingsLayout is a fixed-height
          (100vh) box with overflow: hidden, so a tall chart -- e.g. Seattle
          with the ~110-node School column enabled -- would be clipped with no
          way to reach the bottom. This Box fills that region and owns the
          VERTICAL scroll for tall charts; the chart's own HORIZONTAL scroll
          lives in a dedicated inner scroller (below) so a wide sankey can be
          panned on mobile without this outer box also scrolling sideways (which
          would drag the legend/caption along and, in practice, not scroll at
          all -- there was no genuinely-wider child here to overflow). */}
      <Box
        ref={scrollRef}
        sx={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}
      >
        {schoolLegend.length > 0 && (
          // Legend for the school-size color buckets, pinned to the top when
          // the School level is shown.
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 3,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.5,
              px: 1,
              py: 0.5,
              backgroundColor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              School node size:
            </Typography>
            {schoolLegend.map((b, i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "2px",
                    backgroundColor: b.color,
                    flex: "0 0 auto",
                  }}
                />
                <Typography variant="caption" sx={{ whiteSpace: "nowrap" }}>
                  {fmt(b.min)}–{fmt(b.max)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        {empty ? (
          <Typography sx={{ p: 2 }}>
            {emptyReason === "resources"
              ? "No resources selected. Select at least one resource to see the expenditure flow."
              : "No expenditure data for the selected year and data type."}
          </Typography>
        ) : (
          <>
            {/* Outer relative box stays viewport-width so the overlaid toggle
                is pinned in view; the chart itself lives in the inner
                horizontal scroller and can slide underneath it. */}
            <Box sx={{ position: "relative" }}>
              {/* Actuals/Budget toggle overlaid on the graph (top-left), synced
                  with the sidebar Data Type selector. */}
              <ToggleButtonGroup
                size="small"
                exclusive
                color="primary"
                value={allSettings[0].dataType}
                onChange={(_e, v) => {
                  if (v) {
                    setDataType(v);
                  }
                }}
                aria-label="Data type"
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 12,
                  zIndex: 2,
                  backgroundColor: "background.paper",
                }}
              >
                <ToggleButton value="actuals">Actuals</ToggleButton>
                <ToggleButton value="budget">Budget</ToggleButton>
              </ToggleButtonGroup>
              {/* When a highlight is locked, a chip (top-right) names it and
                  offers a one-click clear — the visible cue that the dimmed view
                  is pinned (and the URL is shareable), plus an exit on touch. */}
              {highlightLabel && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`Highlighting: ${highlightLabel}`}
                  onDelete={() => applyHighlight(null)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 12,
                    zIndex: 2,
                    maxWidth: 340,
                    backgroundColor: "background.paper",
                  }}
                />
              )}
              {/* Dedicated HORIZONTAL scroller. Its direct child has an explicit
                  pixel width (chartWidth) that can exceed the viewport, so the
                  overflow is real and touch-pans reliably (with the tooltip's
                  followTouchMove off, a one-finger drag scrolls here instead of
                  being captured by Highcharts). This is how a wide sankey is
                  read on a phone. */}
              <Box
                sx={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <Box
                  sx={{ width: `${chartWidth}px` }}
                  // Clicking empty chart space (anything that isn't a node/band)
                  // clears the locked highlight and dismisses the deep-link
                  // popover. A node/band click bubbles here too, but its own
                  // Highcharts handler owns it, so skip those. (The popover is
                  // rendered click-through — see its slotProps — so this fires
                  // even while the popover is open.)
                  onClick={(e) => {
                    if ((e.target as Element).closest?.(".highcharts-point")) {
                      return;
                    }
                    applyHighlight(null);
                    setPopover(null);
                  }}
                >
                  <HighchartsReact
                    // Remount the chart whenever any setting changes (the key is
                    // the serialized dataset settings). This guarantees a
                    // brand-new chart that reflects the current options — e.g.
                    // the budget (grey) vs actuals (blue) node/band colors —
                    // rather than relying on an in-place chart.update(), which
                    // can leave stale sankey colors. A full redraw is fine here
                    // (single chart, no per-chart state to preserve) and the
                    // "Updating" overlay masks it. The locked highlight is NOT in
                    // the key (it's applied imperatively via chartRef), so
                    // locking/unlocking never triggers this rebuild.
                    key={chartKey}
                    ref={chartRef}
                    highcharts={highchartsObjs.highcharts}
                    options={options}
                  />
                </Box>
              </Box>
            </Box>
            <Typography
              variant="caption"
              component="p"
              sx={{ px: 2, pt: 1, color: "text.secondary" }}
            >
              Attribution of revenue to programs runs on the whole fund; filters
              never change that math. When a filter is applied, the flow it
              removes is re-routed into a dark plum{" "}
              <strong>Filtered Out</strong> band that continues to the last
              column so every column still totals the grand total. A filter on a
              hidden level still applies — it diverts at the column that level
              would have occupied.
              {hasFilteredOut ? " A Filtered Out band is currently shown." : ""}
            </Typography>
          </>
        )}
      </Box>
      <Popover
        open={popover !== null}
        onClose={() => setPopover(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          popover ? { top: popover.top, left: popover.left } : undefined
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        // Render click-through: the (invisible) modal root ignores pointer
        // events so a click on empty chart space passes THROUGH to the chart's
        // background-click handler (which clears the lock) instead of being
        // swallowed to just dismiss the popover. The Paper re-enables pointer
        // events so its links stay clickable; Escape still closes it.
        disableScrollLock
        slotProps={{
          root: { sx: { pointerEvents: "none" } },
          paper: { sx: { pointerEvents: "auto" } },
        }}
      >
        {popover && (
          <Box sx={{ p: 1.5, maxWidth: 320 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {popover.title}
            </Typography>
            {popover.links.map((l) => (
              <Typography key={l.href} variant="body2">
                <a href={l.href} target="_blank" rel="noopener">
                  {l.label} ↗
                </a>
              </Typography>
            ))}
          </Box>
        )}
      </Popover>
    </SettingsLayout>
  );
}
