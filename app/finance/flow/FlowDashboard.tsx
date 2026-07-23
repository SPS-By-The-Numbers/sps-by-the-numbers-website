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
import Typography from "@mui/material/Typography";
import { computeFlows } from "utilities/sankey/flows";
import { linkForNode } from "utilities/sankey/deepLinks";
import { flowLinkClass, flowNodeClass } from "utilities/sankey/colors";
import { makeCurrencyFormatter } from "utilities/highcharts/utils";
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
function bandLinks(
  fromNode: { options: SankeyNode },
  toNode: { options: SankeyNode },
  ctx: DeepLinkCtx,
): Array<DeepLink> {
  const l1 = linkForNode(fromNode.options, ctx);
  const l2 = linkForNode(toNode.options, ctx);
  return [l1, l2].filter((l): l is DeepLink => l !== null);
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

  const { options, empty, hasFilteredOut } = useMemo(() => {
    const settings = allSettings[0];
    const districtData = districtDataMap[settings.ccddd];
    const ctx: DeepLinkCtx = {
      ccddd: settings.ccddd,
      sourceMode: settings.sourceMode,
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

    // Filters are include-sets; a source filter uses category vs account codes
    // per the current source mode. Filters for disabled levels are simply never
    // consulted by the engine (their column is absent from the flow path).
    const filters: FlowFilters = {
      sourceCodes:
        settings.sourceMode === "account"
          ? settings.revenueCodes
          : settings.revenueCategoryCodes,
      programCodes: settings.programCodes,
      activityCodes: settings.activityCodes,
      objectCodes: settings.objectCodes,
      ncesCodes: settings.ncesCodes,
      schoolCodes: settings.schoolCodes,
    };

    const enabledLevels = enabledLevelsFromPlan(settings.levelPlan);
    const { nodes, links, totals } = computeFlows(expRows, revRows, {
      mode: settings.sourceMode,
      enabledLevels,
      filters,
      coalesce: settings.coalesce,
    });

    if (links.length === 0) {
      return { options: null, empty: true, hasFilteredOut: false };
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
    const sortedLinks = [...links].sort((a, b) => {
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

    // Bump the chart height when the (wide) School column is enabled; Seattle
    // has ~110 schools.
    const height = enabledLevels.includes("school")
      ? Math.max(700, nodes.length * 14)
      : 700;

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
      chart: { height },
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
            // blue), except drawdown outflow bands (red) and growth inflow
            // bands (green).
            className: flowLinkClass(l.from, l.to, dt),
          })),
          nodes: nodes.map((n) => ({
            id: n.id,
            name: n.name,
            // Color by CSS class: base, except the drawdown node (red) and the
            // growth node (green); Filtered Out nodes are neutral grey. The fill
            // attribute would be overridden by styled-mode CSS.
            className: flowNodeClass(n, dt),
            column: n.column,
            custom: n.custom,
          })),
          nodePadding: 8,
          nodeWidth: 12,
          dataLabels: {
            style: { fontSize: "0.7rem", textOutline: "1px contrast" },
          },
        },
      ],
      tooltip: {
        useHTML: true,
        stickOnContact: true,
        followPointer: false,
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
              return `<b>${p.name}</b><br/>${fmt(p.sum)}<br/>${shown}${more}`;
            }
            const nodeLink = linkForNode(p.options as SankeyNode, ctx);
            return (
              `<b>${p.name}</b><br/>${fmt(p.sum)}` +
              (nodeLink
                ? `<br/><a href="${nodeLink.href}" target="_blank" rel="noopener" style="pointer-events:all">${nodeLink.label} ↗</a>`
                : "")
            );
          }

          // Band hover: one link per node on the band (Locked design
          // decision #8), skipping either side that isn't linkable.
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
                  const l = linkForNode(p.options as SankeyNode, ctx);
                  links = l ? [l] : [];
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

    return { options: chartOptions, empty: false, hasFilteredOut };
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
        <Typography className="analysis-title" component="h1" variant="h1">
          General Fund Expenditure Flow. Revenue source through program,
          activity, and (optionally) object, NCES, and school.
        </Typography>
        {empty ? (
          <Typography sx={{ p: 2 }}>
            No expenditure data for the selected year and data type.
          </Typography>
        ) : (
          <>
            <HighchartsReact
              // Remount the chart whenever any setting changes (the key is the
              // serialized dataset settings). This guarantees a brand-new chart
              // that reflects the current options — e.g. the budget (grey) vs
              // actuals (blue) node/band colors — rather than relying on an
              // in-place chart.update(), which can leave stale sankey colors. A
              // full redraw is fine here (single chart, no per-chart state to
              // preserve) and the "Updating" overlay masks it.
              key={chartKey}
              highcharts={highchartsObjs.highcharts}
              options={options}
            />
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
