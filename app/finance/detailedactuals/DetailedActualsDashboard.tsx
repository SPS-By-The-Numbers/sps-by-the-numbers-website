"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as aq from "arquero";
import { op } from "arquero";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { useMemo } from "react";
import { makeHighchartConfig } from "utilities/highcharts/utils";
import {
  extractRawExpenditures,
  toFacetedCharatbleDataset,
  getDataColumnNames,
} from "utilities/ChartableMetrics";
import { extractFacets } from "utilities/ChartableVitals";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
import {
  ObjectFilterContents,
  ActivityFilterContents,
  ProgramFilterContents,
  SchoolFilterContents,
  NcesFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import HcDashboard from "components/HcDashboard";
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";
import { SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS, SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS } from "app/finance/detailedactuals/DetailedActualsPage";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import SchoolGroupingContents from "app/finance/_widgets/SchoolGroupingContents";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import YScaleContents from "app/finance/_widgets/YScaleContents";

import ActivityFilter from "app/finance/_filteritems/activity";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import { makeSchoolFilter } from "app/finance/_filteritems/school";
import NcesFilter from "app/finance/_filteritems/nces";

import type { ColumnTable } from "arquero";
import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { DetailedActualsSettings, DetailedActualsContextSettings } from "app/finance/detailedactuals/DetailedActualsPage";

const CONNECTOR_ID = "nces-connector";

const ALL_FACETS = ["activity", "program", "object", "school", "nces"];
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  activity: "Activity",
  program: "Program",
  object: "Object",
  school: "School",
  nces: "NCES",
};

export function serializeFacet(facet: Facet): string {
  switch (facet) {
    case "activity":
      return "0";

    case "program":
      return "1";

    case "object":
      return "2";

    case "school":
      return "3";

    case "nces":
      return "4";
  }

  return "0";
}

export function deserializeFacet(s: string): Facet {
  switch (s) {
    case "0":
      return "activity";

    case "1":
      return "program";

    case "2":
      return "object";

    case "3":
      return "school";

    case "4":
      return "nces";
  }

  return "activity";
}


function componentsGenerator(facetOrder,
                             contextSettings :DetailedActualsContextSettings,
                             settings: DetailedActualsSettings,
                             yBounds) {
  const schoolFilter = makeSchoolFilter(settings.ccddd, contextSettings.schoolGrouping);
  const subtitle = `
  Act(${ActivityFilter.toSummaryText(settings.activityCodes)}) /
  Prog(${ProgramFilter.toSummaryText(settings.programCodes)}) /
  Obj(${ObjectFilter.toSummaryText(settings.objectCodes)}) /
  School(${schoolFilter.toSummaryText(settings.schoolCodes)}) /
  Nces(${NcesFilter.toSummaryText(settings.ncesCodes)})
  `;
  const components = makeFacetComponents({
    idPrefix: settings.id.toString(),
    xColumn: "class_of",
    xLabel: "Fiscal Year End",
    yColumnRoot: "amount",
    facetOrder,
    connectorId: CONNECTOR_ID,
    normalizations: [settings.currencyNormalization],
    captionType: "stats",
    subtitle,
    yBounds,
  });

  return components;
}

// Charts expenditures for
export default function DetailedActualsDashboard({
  districtDataMap,
  allSettings,
  contextSettings,
}: DistrictDataContentProps<DetailedActualsSettings, DetailedActualsContextSettings>) {
  const config = useMemo(() => {
    // Expand out the filter per sub-setting.
    const { data, fullFacetOrder } = extractFacets(
      districtDataMap,
      allSettings,
      contextSettings.facet,
      contextSettings.sortType,
      contextSettings.sortOrder,
    );

    return makeHighchartConfig(
      {
        connectorId: CONNECTOR_ID,
        metricName: "amount",
        contextSettings,
        allSettings,
        fullFacetOrder,
        componentsGenerator,
        data,
      }
    );
  }, [contextSettings, districtDataMap, allSettings]);

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: newAllSettings => serializeDatasetSettings(newAllSettings, SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS),
          serializeContext: context => serializeOneSetting(context, SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS),
      }}
      allSettings={allSettings}
      contextSettings={contextSettings}
      contextSettingsComponents={[
        makeFacetContents(FACET_OPTIONS),
        SortOrderContents,
        YScaleContents,
        SchoolGroupingContents,
      ]}
      settingsContentsComponents={[
        DatasetSettingsContents,
        ObjectFilterContents,
        ActivityFilterContents,
        ProgramFilterContents,
        SchoolFilterContents,
        NcesFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Actual School Spend. Data is more granular but only covers FY2019-20 forward.
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
