"use client";

import {
  serializeDatasetSettings,
  serializeOneSetting,
} from "app/finance/_settings/common_settings";
import { makeHighchartConfig } from "utilities/highcharts/utils";
import { extractFacets } from "utilities/ChartableVitals";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
import {
  RevenueCategoryFilterContents,
  RevenueFilterContents,
  ProgramFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import { useMemo } from "react";
import DistrictData from "utilities/DistrictData";
import RevenueCategoryFilter from "app/finance/_filteritems/revenue_category";
import RevenueFilter from "app/finance/_filteritems/revenue";
import ProgramFilter from "app/finance/_filteritems/program";
import { FACET_OPTIONS } from "app/finance/revenues/RevenuesContextSettings";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import HcDashboard from "components/HcDashboard";
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import ChartsEnabledContents from "app/finance/_widgets/ChartsEnabledContents";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import Typography from "@mui/material/Typography";
import YScaleContents from "app/finance/_widgets/YScaleContents";
import {
  SERIALIZE_REVENUES_SETTINGS_GENERATORS,
  SERIALIZE_REVENUES_CONTEXT_SETTINGS_GENERATORS,
} from "app/finance/revenues/RevenuesPage";

import type { RevenuesContextSettings } from "./RevenuesContextSettings";
import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { RevenuesSettings } from "./RevenuesPage";

const CONNECTOR_ID = "revenues-connector";

function componentsGenerator(
  facetOrder,
  contextSettings: RevenuesContextSettings,
  revenuesSettings: RevenuesSettings,
  yBounds,
) {
  const subtitle = `
  Category: ${RevenueCategoryFilter.toSummaryText(revenuesSettings.revenueCategoryCodes)} /
  Account: ${RevenueFilter.toSummaryText(revenuesSettings.revenueCodes)} /
  Program: ${ProgramFilter.toSummaryText(revenuesSettings.programCodes)}
  `;

  const components = makeFacetComponents({
    idPrefix: revenuesSettings.id.toString(),
    xColumn: "class_of",
    xLabel: "Fiscal Year End",
    yColumnRoot: "amount",
    facetOrder,
    connectorId: CONNECTOR_ID,
    normalizations: [revenuesSettings.currencyNormalization],
    captionType: "variance",
    subtitle,
    yBounds,
  });

  return components;
}

// Charts revenues for the district(s) selected, faceted by revenue
// category / revenue account / program.
export default function RevenuesDashboard({
  districtDataMap,
  contextSettings,
  allSettings,
}: DistrictDataContentProps<RevenuesSettings, RevenuesContextSettings>) {
  const config = useMemo(() => {
    if (contextSettings.chartsEnabled === false) return null;

    const { data, fullFacetOrder } = extractFacets(
      districtDataMap,
      allSettings,
      contextSettings.facet,
      contextSettings.sortType,
      contextSettings.sortOrder,
      DistrictData.prototype.filteredRevenues,
    );

    return makeHighchartConfig({
      connectorId: CONNECTOR_ID,
      metricName: "amount",
      contextSettings,
      allSettings,
      fullFacetOrder,
      componentsGenerator,
      data,
    });
  }, [contextSettings, districtDataMap, allSettings]);

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: (newAllSettings) =>
          serializeDatasetSettings(
            newAllSettings,
            SERIALIZE_REVENUES_SETTINGS_GENERATORS,
          ),
        serializeContext: (context) =>
          serializeOneSetting(
            context,
            SERIALIZE_REVENUES_CONTEXT_SETTINGS_GENERATORS,
          ),
      }}
      contextSettings={contextSettings}
      contextSettingsComponents={[
        makeFacetContents(FACET_OPTIONS),
        SortOrderContents,
        YScaleContents,
        ChartsEnabledContents,
      ]}
      allSettings={allSettings}
      settingsContentsComponents={[
        DatasetSettingsContents,
        RevenueCategoryFilterContents,
        RevenueFilterContents,
        ProgramFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        General Fund Revenues. Budget vs Actuals by revenue category, account,
        and program.
      </Typography>
      {config && <HcDashboard config={config} />}
    </SettingsLayout>
  );
}
