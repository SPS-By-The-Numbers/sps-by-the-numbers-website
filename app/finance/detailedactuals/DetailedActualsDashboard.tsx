"use client";

import { DEFAULT_METRIC_SETTINGS } from "app/finance/_settings/metric_settings";
import * as aq from "arquero";
import { op } from "arquero";
import { serializeSettings } from "app/finance/_settings/base_settings";
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
} from "app/finance/_widgets/ExpenditureFilterContents";
import { extractCodes } from "app/finance/_widgets/ExpenditureFilterContents";
import HcDashboard from "components/HcDashboard";
import MetricSettingsContents from "app/finance/_widgets/MetricSettingsContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";
import { serializeDetailedActualsSettings } from "app/finance/detailedactuals/DetailedActualsPage";

import type { ColumnTable } from "arquero";
import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { DetailedActualsSettings } from "app/finance/detailedactuals/DetailedActualsPage";

const CONNECTOR_ID = "nces-connector";

function componentsGenerator(settings: DetailedActualsSettings, facetOrder) {
  const components = makeFacetComponents(
    settings.id,
    "class_of",
    "Class of",
    "amount",
    facetOrder,
    CONNECTOR_ID,
    [settings.currencyNormalization],
  );

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
    .pivot(["nces_code"], {
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

function compileData(districtDataMap, allSettings : Array<DetailedActualsSettings>, facet) {
  const allDatasets = new Array<ColumnTable>();
  let facetInfo;
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
        "descending" as const,
      );
    }
  }

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
  sharedSettings,
}: DistrictDataContentProps<DetailedActualsSettings>) {
  const [data, facetOrder] = compileData(
    districtDataMap,
    allSettings,
    "nces" as const,
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
          options: dfToJSONConnectorOptions(data),
        },
      ],
    },
  };

  return (
    <SettingsLayout
      settingsSerializer={{
        serialize: x => serializeSettings(x, serializeDetailedActualsSettings),
        serializeShared: x => "",
      }}
      allSettings={allSettings}
      sharedSettings={sharedSettings}
      sharedSettingsComponents={[]}
      settingsContentsComponents={[
        MetricSettingsContents,
        ObjectFilterContents,
        ActivityFilterContents,
        ProgramFilterContents,
        SchoolFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        DetailedActuals Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
