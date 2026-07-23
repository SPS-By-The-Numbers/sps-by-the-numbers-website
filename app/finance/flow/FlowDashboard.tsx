"use client";

// Expenditure Flow (Sankey) view.
//
// Renders a single Highcharts sankey for the primary district: Revenue Source ->
// Program -> Activity, plus the optional Object / NCES / School columns. The
// heavy lifting (revenue->program attribution, filter diversion into gray
// "Filtered Out" bands, node/link emission) lives in the arquero-free compute
// engine `utilities/sankey/`. This component only bakes the arquero frames down
// to one (class_of, data_type), calls `computeFlows`, and adapts its output to
// the Highcharts sankey series shape.

import Box from "@mui/material/Box";
import HighchartsReact from "highcharts-react-official";
import Popover from "@mui/material/Popover";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { usePathname, useRouter } from "next/navigation";
import { computeFlows } from "utilities/sankey/flows";
import { linksForNode } from "utilities/sankey/deepLinks";
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
import { useMemo, useState } from "react";
import {
  ActivityFilterContents,
  NcesFilterContents,
  ObjectFilterContents,
  ProgramFilterContents,
  RevenueCategoryFilterContents,
  RevenueFilterContents,
  SchoolFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
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
  RevRow,
  SankeyNode,
} from "utilities/sankey/types";

const fmt = makeCurrencyFormatter(2);

function fiscalYearLabel(classOf: number): string {
  return `${classOf - 1}-${classOf}`;
}

// Shared by both the hover tooltip and the click-to-open Popover fallback
// (see the click handler below): the two per-band links, skipping nodes
// `linkForNode` says aren't linkable (Fund Balance / Filtered Out).
// Band (link) hover: both ends' links, each faceting the target on the NEXT
// level down (nextLayer = true); a node hover facets on the node's own level.
function bandLinks(
  fromNode: { options: SankeyNode },
  toNode: { options: SankeyNode },
  ctx: DeepLinkCtx,
): Array<DeepLink> {
  return [
    ...linksForNode(fromNode.options, ctx, true),
    ...linksForNode(toNode.options, ctx, true),
  ];
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

export default function FlowDashboard({
  districtDataMap,
  contextSettings,
  allSettings,
}: DistrictDataContentProps<FlowSettings, CommonContextSettings>) {
  const { highchartsObjs } = useHighcharts();
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const router = useRouter();
  const pathname = usePathname();

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

  const { options, empty, hasFilteredOut, schoolLegend } = useMemo(() => {
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
    const years = districtData.all_class_ofs().array("class_of") as number[];
    const year =
      settings.classOf ?? (years.length > 0 ? Math.max(...years) : 0);
    const dt = settings.dataType;

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
    const filters: FlowFilters = {
      sourceCodes: narrowed(
        sourceIsAccount ? settings.revenueCodes : settings.revenueCategoryCodes,
        (sourceIsAccount ? RevenueFilter : RevenueCategoryFilter).allCodes(),
      ),
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

    // Budget has no NCES / School breakdown, so drop those levels in Budget mode
    // even if the level plan (carried over from Actuals) still has them enabled.
    const enabledLevels = enabledLevelsFromPlan(settings.levelPlan).filter(
      (l) => dt !== "budget" || !ACTUALS_ONLY_LEVELS.includes(l),
    );
    const { nodes, links, totals } = computeFlows(expRows, revRows, {
      mode: settings.sourceMode,
      enabledLevels,
      filters,
      coalesceLevels: [...settings.coalesceLevels],
    });

    if (links.length === 0) {
      return {
        options: null,
        empty: true,
        hasFilteredOut: false,
        schoolLegend: [] as Array<{ color: string; min: number; max: number }>,
      };
    }

    // A gray "Filtered Out" band only appears when a per-level filter diverts
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
    // Nodes pinned to the BOTTOM of their column regardless of size: the
    // "Filtered Out" (flt:) nodes and the District Office school node(s).
    // Highcharts orders a column top->bottom by node creation order (first
    // appearance in the links scan), so we sort every link touching a
    // bottom-pinned node after all others: those nodes are then created last.
    const districtOfficeNodeIds = new Set(
      (ALL_SCHOOLS[settings.ccddd] ?? [])
        .filter((s) => s.is_district_office)
        .map((s) => `sch:${s.school_code}`),
    );
    const isBottomNode = (id: string) =>
      id.startsWith("flt:") || districtOfficeNodeIds.has(id);
    const isBottomLink = (l: (typeof links)[number]) =>
      isBottomNode(l.from) || isBottomNode(l.to);
    const sortedLinks = [...links].sort((a, b) => {
      const fa = isBottomLink(a);
      const fb = isBottomLink(b);
      if (fa !== fb) {
        return fa ? 1 : -1;
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

    // School nodes are colored by SIZE: rank their sizes into buckets and give
    // each a palette class (see colors.ts / the scss). The District Office is
    // pinned to the bottom, not size-colored, so it is excluded from the ramp.
    const schoolSizes = new Map<string, number>();
    for (const n of nodes) {
      if (n.custom.level === "school" && !districtOfficeNodeIds.has(n.id)) {
        schoolSizes.set(n.id, nodeSize(n.id));
      }
    }
    const schoolBucket = sizeBuckets(schoolSizes, SCHOOL_BUCKET_COUNT);
    // Legend rows: for each occupied bucket, its color and size range.
    const bucketRange = new Map<number, { min: number; max: number }>();
    for (const [id, b] of schoolBucket.entries()) {
      const s = schoolSizes.get(id) ?? 0;
      const r = bucketRange.get(b);
      if (r) {
        r.min = Math.min(r.min, s);
        r.max = Math.max(r.max, s);
      } else {
        bucketRange.set(b, { min: s, max: s });
      }
    }
    const schoolLegend = [...bucketRange.entries()]
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
      chart: { height, marginLeft: 12, marginRight },
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
            // (green), and — when highlighting PTA — the PTA source's bands.
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
            className: schoolBucket.has(n.id)
              ? schoolBucketClass(schoolBucket.get(n.id)!)
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
            // Node hover: links open the node's item faceted at its own level.
            const nodeLinks = linksForNode(p.options as SankeyNode, ctx);
            const nodeLinksHtml = nodeLinks
              .map(
                (l) =>
                  `<br/><a href="${l.href}" target="_blank" rel="noopener" style="pointer-events:all">${l.label} ↗</a>`,
              )
              .join("");
            return `<b>${p.name}</b><br/>${fmt(p.sum)}${nodeLinksHtml}`;
          }

          // Band hover: each end's links, faceted one level down.
          const links = bandLinks(p.fromNode, p.toNode, ctx);
          const linksHtml = links
            .map(
              (l) =>
                `<a href="${l.href}" target="_blank" rel="noopener" style="pointer-events:all">${l.label} ↗</a>`,
            )
            .join("<br/>");
          return (
            `<b>${p.fromNode.name} → ${p.toNode.name}</b><br/>${fmt(
              p.weight,
            )}<br/>` + linksHtml
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
              // Click-to-open fallback (see the `PopoverState` comment
              // above): guarantees the two deep links are reachable even if
              // `stickOnContact` doesn't keep the HTML tooltip open for a
              // pointer to cross into on every platform/input device.
              click(this: any, event: any) {
                const p = this;
                let title = "";
                let links: Array<DeepLink> = [];
                if (p.isNode) {
                  title = p.name;
                  links = linksForNode(p.options as SankeyNode, ctx);
                } else if (p.fromNode && p.toNode) {
                  title = `${p.fromNode.name} → ${p.toNode.name}`;
                  links = bandLinks(p.fromNode, p.toNode, ctx);
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
      hasFilteredOut,
      schoolLegend,
    };
  }, [districtDataMap, allSettings]);

  // A signature that changes on any settings change, used to key (and thus
  // remount) the chart so it always reflects the current options.
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
        RevenueCategoryFilterContents,
        RevenueFilterContents,
        ProgramFilterContents,
        ActivityFilterContents,
        ObjectFilterContents,
        NcesFilterContents,
        SchoolFilterContents,
      ]}
    >
      {/* The parent content region in SettingsLayout is a fixed-height
          (100vh) box with overflow: hidden, so a tall chart -- e.g. Seattle
          with the ~110-node School column enabled -- would be clipped with no
          way to reach the bottom. This Box fills that region and scrolls in
          BOTH directions: vertically for tall charts, horizontally for wide
          ones. */}
      <Box sx={{ height: "100%", overflow: "auto" }}>
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
              School size:
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
            No expenditure data for the selected year and data type.
          </Typography>
        ) : (
          <>
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
              <HighchartsReact
                // Remount the chart whenever any setting changes (the key is the
                // serialized dataset settings). This guarantees a brand-new
                // chart that reflects the current options — e.g. the budget
                // (grey) vs actuals (blue) node/band colors — rather than
                // relying on an in-place chart.update(), which can leave stale
                // sankey colors. A full redraw is fine here (single chart, no
                // per-chart state to preserve) and the "Updating" overlay masks
                // it.
                key={chartKey}
                highcharts={highchartsObjs.highcharts}
                options={options}
              />
            </Box>
            <Typography
              variant="caption"
              component="p"
              sx={{ px: 2, pt: 1, color: "text.secondary" }}
            >
              Attribution of revenue to programs runs on the whole fund; filters
              never change that math. When a filter is applied, the flow it
              removes is re-routed into a gray <strong>Filtered Out</strong>{" "}
              band that continues to the last column so every column still
              totals the grand total.
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
