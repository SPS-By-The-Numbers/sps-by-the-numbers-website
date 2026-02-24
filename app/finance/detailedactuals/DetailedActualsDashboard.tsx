"use client";

import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import * as aq from "arquero";
import { op } from "arquero";
import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { dfToJSONConnectorOptions } from "utilities/highcharts/utils";
import {
  extractRawExpenditures,
  extractFacetsByAmount,
  toChartableDataset,
  getDataColumnNames,
} from "utilities/ChartableMetrics";
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


function componentsGenerator(settings: DetailedActualsSettings, facetOrder) {
  const schoolFilter = makeSchoolFilter(settings.ccddd);
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
  });

  return components;
}

function makeFacetedDetailedActualsForDistrict(
  districtData,
  filteredExpenditures,
  facet,
  expenditureSettings,
) {
  const data = extractRawExpenditures(filteredExpenditures, facet);

  const pdata = data
    .groupby(["class_of", "data_type"])
    .pivot([`${facet}_code`], {
      amount: (d) => op.sum(d.amount),
      _pivot_name_hack_: (d) => op.any("_pivot_name_hack_"),
    })
    .select(aq.not("_pivot_name_hack_"));

  const names = getDataColumnNames(pdata);
  return toChartableDataset(
    districtData,
    pdata,
    expenditureSettings,
    [],
    names,
    [],
  );
}

function compileData(districtDataMap, allSettings : Array<DetailedActualsSettings>, facet, sortOrder) {
  const allDatasets = new Array<ColumnTable>();
  let facetInfo;

  // Geneate one set of columns per dataset.
  for (const settings of allSettings) {
    const districtData = districtDataMap[settings.ccddd];
    const filteredExpenditures = districtData.filteredExpenditures(settings);

    const data = makeFacetedDetailedActualsForDistrict(
      districtData,
      filteredExpenditures,
      facet,
      settings,
    );
    allDatasets.push(data);
    if (facetInfo === undefined) {
      facetInfo = extractFacetsByAmount(
        filteredExpenditures,
        facet,
        "amount",
        sortOrder,
      );
    }
  }

  // Join each dataset into one big dataframe.
  let data = allDatasets[0];
  for (const d of allDatasets.slice(1)) {
    data = data.join(d);
  }
  return [data, facetInfo];
}

// Charts expenditures for
export default function DetailedActualsDashboard({
  districtDataMap,
  allSettings,
  contextSettings,
}: DistrictDataContentProps<DetailedActualsSettings, DetailedActualsContextSettings>) {
  const [data, facetOrder] = compileData(
    districtDataMap,
    allSettings,
    contextSettings.facet,
    contextSettings.sortOrder,
  );

  const result = makeDatasetFacetedDashboard(allSettings, (s) =>
    componentsGenerator(s, facetOrder),
  );
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const { components, gui } = result;

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
        Actual School Spend. Data is more granular but only covers FY19-2020 forward.
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
