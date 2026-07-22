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
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import FlowLevelContents from "./FlowLevelContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import { SERIALIZE_FLOW_SETTINGS_GENERATORS } from "./FlowSettings";

import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { CommonContextSettings } from "app/finance/_settings/common_context_settings";
import type { FlowSettings } from "./FlowSettings";
import type { DeepLink, DeepLinkCtx } from "utilities/sankey/deepLinks";
import type {
  ExpRow,
  FlowFilters,
  Level,
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

  const { options, empty } = useMemo(() => {
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

    const { nodes, links, totals } = computeFlows(expRows, revRows, {
      mode: settings.sourceMode,
      enabledLevels: [...settings.enabledLevels] as Level[],
      filters,
    });

    if (links.length === 0) {
      return { options: null, empty: true };
    }

    // Bump the chart height when the (wide) School column is enabled; Seattle
    // has ~110 schools.
    const height = settings.enabledLevels.has("school")
      ? Math.max(700, nodes.length * 14)
      : 700;

    const dataTypeLabel = dt === "budget" ? "Budget" : "Actuals";

    const chartOptions = {
      chart: { height },
      credits: { enabled: false },
      title: {
        text: `${settings.name} — General Fund Expenditure Flow`,
      },
      subtitle: {
        text: `${fiscalYearLabel(year)} ${dataTypeLabel} · Total ${fmt(
          totals.grandTotal,
        )} · Revenue ${fmt(totals.revenue)} · Fund Balance Drawdown ${fmt(
          totals.drawdown,
        )}`,
      },
      series: [
        {
          type: "sankey",
          keys: ["from", "to", "weight"],
          data: links.map((l) => ({
            from: l.from,
            to: l.to,
            weight: l.weight,
          })),
          nodes: nodes.map((n) => ({
            id: n.id,
            name: n.name,
            color: n.color,
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
            // Node hover: total through-flow, plus a single deep link when
            // the node itself is linkable (Fund Balance / Filtered Out
            // nodes are not, so `nodeLink` is null there).
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

    return { options: chartOptions, empty: false };
  }, [districtDataMap, allSettings]);

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
        DatasetSettingsContents,
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
      <Typography className="analysis-title" component="h1" variant="h1">
        General Fund Expenditure Flow. Revenue source through program, activity,
        and (optionally) object, NCES, and school.
      </Typography>
      {empty ? (
        <Typography sx={{ p: 2 }}>
          No expenditure data for the selected year and data type.
        </Typography>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <HighchartsReact
            highcharts={highchartsObjs.highcharts}
            options={options}
          />
        </div>
      )}
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
