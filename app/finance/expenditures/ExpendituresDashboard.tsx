"use client";

import * as aq from "arquero";
import { op } from "arquero";
import { dfToJSONConnectorOptions } from "utilities/highcharts/utils";
import {
  extractRawExpenditures,
  extractVarianceFacets,
  toChartableDataset,
  getDataColumnNames,
} from "utilities/ChartableMetrics";
import {
  makeBaseChartConfig,
  makeBudgetActualsChartConfig,
  makeBudgetActualsContextChartConfig,
} from "utilities/highcharts/ChartConfigGenerators";
import { makeChartableVitals } from "app/finance/vitals/ChartableVitals";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
import {
  OverridePrimaryFilterContents,
  ObjectFilterContents,
  ActivityFilterContents,
  ProgramFilterContents,
  extractCodes,
} from "app/finance/_widgets/ExpenditureFilterContents";
import { useMemo } from "react";
import ExpendituresDashboardSettingsContents from "./ExpendituresDashboardSettings";
import HcDashboard from "components/HcDashboard";
import MetricSettingsContents from "app/finance/_widgets/MetricSettingsContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import { makeMaybeContents } from "app/finance/_widgets/SettingsContents";
import Typography from "@mui/material/Typography";

import type { ColumnTable } from "arquero";
import type {
  PAOFilterSettings,
  ExpendituresDashboardSettings,
} from "./ExpendituresDashboardSettings";
import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { MetricSettings } from "app/finance/_widgets/MetricSettingsContents";

export interface ExpendituresSettings
  extends MetricSettings, PAOFilterSettings {
  overridePrimaryFilter: boolean;
}

const CONNECTOR_ID = "expenditures-connector";

function componentsGenerator(
  facetOrder,
  sharedSettings: ExpendituresDashboardSettings,
  expenditureSettings: ExpendituresSettings,
) {
  const components = makeFacetComponents(
    expenditureSettings.id,
    "class_of",
    "Class of",
    "amount", // TODO: This should be expenditure or something.
    facetOrder,
    CONNECTOR_ID,
    [expenditureSettings.currencyNormalization],
  );

  return components;
}

function makeFacetedExpendituresForDistrict(
  districtData,
  filteredExpenditures,
  facet,
  expenditureSettings,
) {
  const data = extractRawExpenditures(
    filteredExpenditures,
    "activity" as const,
  );

  const pdata = data
    .groupby(["class_of", "data_type"])
    .pivot(["activity_code"], {
      amount: (d) => op.sum(d.amount),
      _pivot_name_hack_: (d) => op.any("_pivot_name_hack_"),
    })
    .select(aq.not(aq.startswith("_pivot_name_hack_")));

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

function compileData(districtDataMap, allSettings, facet, sortOrder) {
  const allDatasets = new Array<ColumnTable>();
  let fullFacetOrder;
  for (const expenditureSettings of allSettings) {
    const districtData = districtDataMap[expenditureSettings.ccddd];
    const filteredExpenditures = districtData.filteredExpenditures({
      selectedObjectCodes: extractCodes(
        "obj",
        expenditureSettings.selectedObjects,
      ),
      selectedActivityCodes: extractCodes(
        "act",
        expenditureSettings.selectedActivities,
      ),
      selectedProgramCodes: extractCodes(
        "prog",
        expenditureSettings.selectedPrograms,
      ),
    });

    const data = makeFacetedExpendituresForDistrict(
      districtData,
      filteredExpenditures,
      facet,
      expenditureSettings,
    );

    allDatasets.push(data);
    if (fullFacetOrder === undefined) {
      fullFacetOrder = extractVarianceFacets(
        filteredExpenditures,
        facet,
        sortOrder,
      );
    }
  }

  let data = makeChartableVitals(districtDataMap, [
    { ...allSettings[0], id: "context", currencyNormalization: "amount" },
  ]);
  for (const d of allDatasets) {
    data = data.join(deriveDeltaColumns(d, 2019));
  }

  data = data.orderby("class_of");
  const filterInfo = {};

  return { data, fullFacetOrder, filterInfo };
}

// TODO: Dedupe with vitals.
function makeCell(
  renderTo,
  metricColumn,
  title,
  yValueFormat,
  yLabel?: string,
) {
  return {
    renderTo,
    title,
    metricColumn,
    connectorId: CONNECTOR_ID,
    xDataColumn: "class_of",
    xValueFormat: "year" as const,

    yValueFormat,
    yLabel,
  };
}

function expandFilters(allSettings): Array<ExpendituresSettings> {
  const results = new Array<ExpendituresSettings>();
  const primaryIndex = allSettings.findIndex((v) => v.id === "primary");
  const primarySettings = allSettings[primaryIndex];
  results.push(primarySettings);

  for (let i = 0; i < allSettings.length; i++) {
    if (i === primaryIndex) {
      continue;
    }

    const newSetting = { ...allSettings[i] };

    // Use the primary settings if this one isn't overriding.
    if (!newSetting.overridePrimaryFilter) {
      newSetting.selectedObjects = [...primarySettings.selectedObjects];
      newSetting.selectedActivities = [...primarySettings.selectedActivities];
      newSetting.selectedPrograms = [...primarySettings.selectedPrograms];
    }

    results.push(newSetting);
  }

  return results;
}

// Charts expenditures for
export default function ExpendituresDashboard({
  districtDataMap,
  sharedSettings,
  setSharedSettings,
  allSettings,
  setAllSettings,
}: DistrictDataContentProps<
  ExpendituresSettings,
  ExpendituresDashboardSettings
>) {
  const completedAllSettings: Array<ExpendituresSettings> =
    expandFilters(allSettings);

  const { data, fullFacetOrder, filterInfo } = useMemo(
    () =>
      compileData(
        districtDataMap,
        completedAllSettings,
        sharedSettings.facet,
        sharedSettings.sortOrder,
      ),
    [
      sharedSettings.facet,
      districtDataMap,
      completedAllSettings,
      sharedSettings.sortOrder,
    ],
  );

  // Trim the list for rendering speed.
  const facetOrder = fullFacetOrder.slice(
    0,
    parseInt(sharedSettings.facetLimit),
  );

  const result = makeDatasetFacetedDashboard(completedAllSettings, (s) =>
    componentsGenerator(facetOrder, sharedSettings, s),
  );
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const showDeltas = true;

  const { components, gui } = result;
  if (showDeltas) {
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
  }

  if (showDeltas) {
    const columnAssignment = facetOrder.map((facetInfo) => {
      return {
        seriesId: `🍊 ${facetInfo.title} - Budget`,
        data: {
          x: "class_of",
          y: `delta_${completedAllSettings[0].id}_${completedAllSettings[0].currencyNormalization}_amount_${facetInfo.code}_budget`,
        },
      };
    });

    components.push(
      makeBudgetActualsContextChartConfig(
        makeCell(
          `context-fundedEnrollment`,
          `context_amount_fundedEnrollment`,
          "Funded Enrollment",
          "fte" as const,
          "AAFTE",
        ),
      ),
      makeBudgetActualsContextChartConfig(
        makeCell(
          `context-cashflow`,
          `context_amount_cashflow`,
          "Cashflow",
          "currency" as const,
        ),
      ),
      makeBudgetActualsContextChartConfig(
        makeCell(
          `context-revenues`,
          `context_amount_revenues`,
          "Revenues",
          "currency" as const,
        ),
      ),
      makeBudgetActualsContextChartConfig(
        makeCell(
          `context-expenditures`,
          `context_amount_expenditures`,
          "Expenditures",
          "currency" as const,
        ),
      ),
    );
  }

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
      sharedSettings={sharedSettings}
      setSharedSettings={setSharedSettings}
      sharedSettingsComponents={[ExpendituresDashboardSettingsContents]}
      allSettings={allSettings}
      setAllSettings={setAllSettings}
      settingsContentsComponents={[
        MetricSettingsContents,

        // TODO: We need to have the override copy over the current state of primary.
        //  Maybe intercept at setAllSettings? Seems like wrong separate of concerns.
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
