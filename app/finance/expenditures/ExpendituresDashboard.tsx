"use client";

import * as aq from "arquero";
import { op } from "arquero";
import { SERIALIZE_EXPENDITURES_SETTINGS_GENERATORS, SERIALIZE_EXPENDITURES_CONTEXT_SETTINGS_GENERATORS } from "./ExpendituresPage";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { makeHighchartConfig, getDataBounds } from "utilities/highcharts/utils";
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
      CONNECTOR_ID,
      contextSettings,
      expandedAllSettings,
      fullFacetOrder,
      componentsGenerator,
      augmentContextComponents,
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
