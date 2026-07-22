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

import HighchartsReact from "highcharts-react-official";
import Typography from "@mui/material/Typography";
import { computeFlows } from "utilities/sankey/flows";
import { makeCurrencyFormatter } from "utilities/highcharts/utils";
import { serializeDatasetSettings } from "app/finance/_settings/common_settings";
import { useHighcharts } from "components/providers/HighchartsProvider";
import { useMemo } from "react";
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
import type {
  ExpRow,
  FlowFilters,
  Level,
  RevRow,
} from "utilities/sankey/types";

const fmt = makeCurrencyFormatter(2);

function fiscalYearLabel(classOf: number): string {
  return `${classOf - 1}-${classOf}`;
}

export default function FlowDashboard({
  districtDataMap,
  contextSettings,
  allSettings,
}: DistrictDataContentProps<FlowSettings, CommonContextSettings>) {
  const { highchartsObjs } = useHighcharts();

  const { options, empty } = useMemo(() => {
    const settings = allSettings[0];
    const districtData = districtDataMap[settings.ccddd];

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
      tooltip: { enabled: true },
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
    </SettingsLayout>
  );
}
