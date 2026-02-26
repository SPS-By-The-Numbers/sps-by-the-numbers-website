"use client";

import * as aq from "arquero";
import { op } from "arquero";
import { SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS, SERIALIZE_EXPENDITURES_CONTEXT_SETTINGS_GENERATORS } from "./ExpendituresPage";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { dfToJSONConnectorOptions } from "utilities/highcharts/utils";
import {
  extractRawExpenditures,
  toFacetedCharatbleDataset,
  getDataColumnNames,
} from "utilities/ChartableMetrics";
import {
  makeBaseChartConfig,
  makeBudgetActualsChartConfig,
  makeBudgetActualsContextChartConfig,
  makeContextCell,
} from "utilities/highcharts/ChartConfigGenerators";
import { extractFacets } from "utilities/ChartableVitals";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import {
  makeFacetComponents,
} from "utilities/highcharts/FacetedBudgetActualCharts";
import {
  OverridePrimaryFilterContents,
  ObjectFilterContents,
  ActivityFilterContents,
  ProgramFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import { useMemo } from "react";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import { FACET_OPTIONS } from "app/finance/expenditures/ExpendituresContextSettings";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import { makeMaybeContents } from "app/finance/_widgets/SettingsContents";
import { serializeSettings } from "app/finance/_settings/base_settings";
import HcDashboard from "components/HcDashboard";
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import Typography from "@mui/material/Typography";
import YScaleContents from "app/finance/_widgets/YScaleContents";

import type { ColumnTable } from "arquero";
import type { ExpendituresContextSettings } from "./ExpendituresContextSettings";
import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { ExpendituresSettings } from "./ExpendituresPage";

const CONNECTOR_ID = "expenditures-connector";

// Build the column name format for a facet.
function makeFacetColumnRoot(
  idPrefix,
  normalization,
  metricName,
  facet,
) {
  return [idPrefix, normalization, metricName, facet].join("_");
}

function componentsGenerator(
  facetOrder,
  contextSettings: ExpendituresContextSettings,
  expenditureSettings: ExpendituresSettings,
  yBounds,
) {
  const subtitle = `
  Prog: ${ProgramFilter.toSummaryText(expenditureSettings.programCodes)} /
  Obj: ${ObjectFilter.toSummaryText(expenditureSettings.objectCodes)} 
  `;

  const components = makeFacetComponents({
    idPrefix: expenditureSettings.id.toString(),
    xColumn: "class_of",
    xLabel: "Fiscal Year End",
    yColumnRoot: "amount",
    facetOrder,
    connectorId: CONNECTOR_ID,
    normalizations: [expenditureSettings.currencyNormalization],
    captionType: "variance",
    subtitle,
    yBounds,
  });

  return components;
}

function deriveDeltaColumns(df, baselineClassOf) {
  const params = {};
  const clauses = {
    class_of: (d) => d.class_of,
  };
  for (const name of getDataColumnNames(df)) {
    const baselineValue = df
      .params({ baselineClassOf })
      .filter((d, $) => d.class_of === $.baselineClassOf)
      .get(name);
    clauses[`delta_${name}`] = aq.escape((d) => d[name] - baselineValue);
  }

  const data = df.join(df.orderby("class_of").derive(clauses, { drop: true }));

  return data;
}

function expandFilters(allSettings : Array<ExpendituresSettings>): Array<ExpendituresSettings> {
  const results = new Array<ExpendituresSettings>();

  // The first entry is the primary entry.
  const primarySettings = allSettings[0];
  const dependentSettings = allSettings.slice(1);
  results.push(primarySettings);

  for (const s of dependentSettings) {
    const newSetting = { ...s };

    // Use the primary settings if this one isn't overriding.
    if (!newSetting.overridePrimaryFilter) {
      newSetting.objectCodes = new Set(primarySettings.objectCodes);
      newSetting.activityCodes = new Set(primarySettings.activityCodes);
      newSetting.programCodes = new Set(primarySettings.programCodes);
    }

    results.push(newSetting);
  }

  return results;
}

// Returns the min/max value for columnRoot in a budget/actual name format. Used for setting
// yAxis bounds.
function getDataBounds(data, columnRoot) {
  const a_name = `${columnRoot}_actuals`;
  const b_name = `${columnRoot}_budget`;

  const minMaxDf = data
    .params({
      a_name: `${columnRoot}_actuals`,
      b_name: `${columnRoot}_budget`,
    })
    .rollup({
      min_a: (d, $) => op.min(d[$.a_name]),
      max_a: (d, $) => op.max(d[$.a_name]),
      min_b: (d, $) => op.min(d[$.b_name]),
      max_b: (d, $) => op.max(d[$.b_name]),
    })
    .derive(
      {
        min: (d) => Math.min(d.min_b, d.min_a),
        max: (d) => Math.max(d.max_b, d.max_a),
      },
      {
        drop: true,
      },
    );

  return {
    min: minMaxDf.get("min", 0),
    max: minMaxDf.get("max", 0),
  };
}

function makeFacetYBounds(facetOrder, expandedAllSettings, data) {
  const bounds = {
    min: 0,
    max: 0,
  };
  for (const s of expandedAllSettings) {
    // TODO: This shouldn't be "amount", it should be "act".
    for (const f of facetOrder) {
      const columnRoot = makeFacetColumnRoot(
        s.id,
        s.currencyNormalization,
        "amount",
        f.code,
      );
      const facetBounds = getDataBounds(data, columnRoot);
      bounds.min = Math.min(bounds.min, facetBounds.min);
      bounds.max = Math.max(bounds.max, facetBounds.max);
    }
  }

  return bounds;
}

function augmentContextComponents(gui, components, data) {
  const fundedEnrollmentBounds = getDataBounds(
    data,
    "context_amount_fundedEnrollment",
  );
  const cashflowBounds = getDataBounds(data, "context_amount_cashflow");
  const revenuesBounds = getDataBounds(data, "context_amount_revenues");
  const expendituresBounds = getDataBounds(data, "context_amount_expenditures");
  const revExpBounds = {
    min: Math.min(revenuesBounds.min, expendituresBounds.min),
    max: Math.max(revenuesBounds.max, expendituresBounds.max),
  };

  gui.layouts.unshift({
    rowClassName: "context-row",
    cellClassName: "context-cell",

    rows: [
      {
        cells: [
          { id: "context-fundedEnrollment" },
          { id: "context-cashflow" },
          { id: "context-revenues" },
          { id: "context-expenditures" },
        ],
      },
    ],
  });

  // Add Context cells.
  components.push(
    makeContextCell(
      `context-fundedEnrollment`,
      CONNECTOR_ID,
      `context_amount_fundedEnrollment`,
      "Funded Enrollment",
      "fte" as const,
      fundedEnrollmentBounds,
    ),
    makeContextCell(
      `context-cashflow`,
      CONNECTOR_ID,
      `context_amount_cashflow`,
      "Cashflow",
      "currency" as const,
      cashflowBounds,
    ),
    makeContextCell(
      `context-revenues`,
      CONNECTOR_ID,
      `context_amount_revenues`,
      "Revenues",
      "currency" as const,
      revExpBounds,
    ),
    makeContextCell(
      `context-expenditures`,
      CONNECTOR_ID,
      `context_amount_expenditures`,
      "Expenditures",
      "currency" as const,
      revExpBounds,
    ),
  );
}

function makeHighchartConfig(
  contextSettings,
  expandedAllSettings,
  fullFacetOrder,
  data,
) {
  const facetLimit = parseInt(contextSettings.facetLimit);
  // Trim the list for rendering speed.
  const facetOrder = fullFacetOrder.slice(
    0,
    facetLimit === 0 ? undefined : facetLimit,
  );

  const facetYBounds =
    contextSettings.yScale === "fixed"
      ? makeFacetYBounds(facetOrder, expandedAllSettings, data)
      : {};

  const result = makeDatasetFacetedDashboard(
    expandedAllSettings,
    (s: ExpendituresSettings) =>
      componentsGenerator(facetOrder, contextSettings, s, facetYBounds),
  );

  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const { gui, components } = result;

  augmentContextComponents(gui, components, data);

  const config = {
    gui,
    components,
    dataPool: {
      connectors: [
        {
          id: CONNECTOR_ID,
          type: "JSON",
          ...dfToJSONConnectorOptions(data),
        },
      ],
    },
  };

  return config;
}

// Charts expenditures for
export default function ExpendituresDashboard({
  districtDataMap,
  contextSettings,
  allSettings,
}: DistrictDataContentProps<
  ExpendituresSettings,
  ExpendituresContextSettings
>) {
  const config = useMemo(() => {
    // Expand out the filter per sub-setting.
    const expandedAllSettings: Array<ExpendituresSettings> =
      expandFilters(allSettings);
    const { data, fullFacetOrder } = extractFacets(
      districtDataMap,
      expandedAllSettings,
      contextSettings.facet,
      contextSettings.sortType,
      contextSettings.sortOrder,
    );

    return makeHighchartConfig(
      contextSettings,
      expandedAllSettings,
      fullFacetOrder,
      data,
    );
  }, [contextSettings, districtDataMap, allSettings]);

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: newAllSettings => serializeDatasetSettings(newAllSettings, SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS),
          serializeContext: context => serializeOneSetting(context, SERIALIZE_EXPENDITURES_CONTEXT_SETTINGS_GENERATORS),
      }}
      contextSettings={contextSettings}
      contextSettingsComponents={[
        makeFacetContents(FACET_OPTIONS),
        SortOrderContents,
        YScaleContents,
      ]}
      allSettings={allSettings}
      settingsContentsComponents={[
        DatasetSettingsContents,

        // TODO: We need to have the override copy over the current state of primary.
        //  Maybe intercept at setAllSettings? Seems like wrong separation of concerns.
        makeMaybeContents(
          "overridePrimaryFilter",
          OverridePrimaryFilterContents,
          "notPrimary",
        ),
        makeMaybeContents(
          "overridePrimaryFilter",
          ObjectFilterContents,
          "primaryAlways",
        ),
        makeMaybeContents(
          "overridePrimaryFilter",
          ActivityFilterContents,
          "primaryAlways",
        ),
        makeMaybeContents(
          "overridePrimaryFilter",
          ProgramFilterContents,
          "primaryAlways",
        ),
      ]}
    >
      <HcDashboard config={config} className="hascontext" />
    </SettingsLayout>
  );
}
