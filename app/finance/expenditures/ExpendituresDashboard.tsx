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
  makeContextCell,
} from "utilities/highcharts/ChartConfigGenerators";
import { makeChartableVitals } from "utilities/ChartableVitals";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import {
  makeFacetColumnRoot,
  makeFacetComponents,
} from "utilities/highcharts/FacetedBudgetActualCharts";
import {
  OverridePrimaryFilterContents,
  ObjectFilterContents,
  ActivityFilterContents,
  ProgramFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import { useMemo } from "react";
import { useRouter, usePathname } from 'next/navigation';
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import ExpendituresDashboardSettingsContents, { serializeExpenditureDashboardSettings } from "app/finance/expenditures/ExpendituresDashboardSettings";
import { settingsToDistrictDataFilters, serializeExpenditureFilterSettings } from "app/finance/expenditures/ExpenditureFilterSettings";
import HcDashboard from "components/HcDashboard";
import MetricSettingsContents from "app/finance/_widgets/MetricSettingsContents";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import { makeMaybeContents } from "app/finance/_widgets/SettingsContents";
import Typography from "@mui/material/Typography";

import type { ColumnTable } from "arquero";
import type {
  ExpendituresDashboardSettings,
} from "./ExpendituresDashboardSettings";
import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { ExpendituresSettings } from "./ExpenditureFilterSettings";

const CONNECTOR_ID = "expenditures-connector";

function componentsGenerator(
  facetOrder,
  sharedSettings: ExpendituresDashboardSettings,
  expenditureSettings: ExpendituresSettings,
  bounds,
) {
  const districtDataFilters = settingsToDistrictDataFilters(expenditureSettings);
  const subtitle = `
  Prog: ${ProgramFilter.toSummaryText(new Set(districtDataFilters.selectedProgramCodes))} /
  Obj: ${ObjectFilter.toSummaryText(new Set(districtDataFilters.selectedObjectCodes))} 
  `;

  const components = makeFacetComponents(
    expenditureSettings.id,
    "class_of",
    "Class of",
    "amount",
    facetOrder,
    CONNECTOR_ID,
    [expenditureSettings.currencyNormalization],
    subtitle,
    bounds,
  );

  return components;
}

function makeFacetedExpendituresForDistrict(
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

function compileData(districtDataMap, expandedAllSettings, facet, sortOrder) {
  const allDatasets = new Array<ColumnTable>();
  let fullFacetOrder;
  for (const expenditureSettings of expandedAllSettings) {
    const districtData = districtDataMap[expenditureSettings.ccddd];
    const filteredExpenditures = districtData.filteredExpenditures(
      settingsToDistrictDataFilters(expenditureSettings),
    );

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
    {
      ...expandedAllSettings[0],
      id: "context",
      currencyNormalization: "amount",
    },
  ]);
  for (const d of allDatasets) {
    data = data.join(deriveDeltaColumns(d, 2019));
  }

  data = data.orderby("class_of");

  return { data, fullFacetOrder };
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
  sharedSettings,
  expandedAllSettings,
  fullFacetOrder,
  data,
) {
  const facetLimit = parseInt(sharedSettings.facetLimit);
  // Trim the list for rendering speed.
  const facetOrder = fullFacetOrder.slice(
    0,
    facetLimit === 0 ? undefined : facetLimit
  );

  const facetYBounds =
    sharedSettings.yScale === "fixed"
      ? makeFacetYBounds(facetOrder, expandedAllSettings, data)
      : {};

  const result = makeDatasetFacetedDashboard(
    expandedAllSettings,
    (s: ExpendituresSettings) =>
      componentsGenerator(facetOrder, sharedSettings, s, facetYBounds),
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
          options: dfToJSONConnectorOptions(data),
        },
      ],
    },
  };

  return config;
}

// Charts expenditures for
export default function ExpendituresDashboard({
  districtDataMap,
  sharedSettings,
  allSettings,
}: DistrictDataContentProps<
  ExpendituresSettings,
  ExpendituresDashboardSettings
>) {
  const router = useRouter();
  const pathname = usePathname();
  const config = useMemo(() => {
    // Expand out the filter per sub-setting.
    const expandedAllSettings: Array<ExpendituresSettings> =
      expandFilters(allSettings);
    const { data, fullFacetOrder } = compileData(
      districtDataMap,
      expandedAllSettings,
      sharedSettings.facet,
      sharedSettings.sortOrder,
    );

    return makeHighchartConfig(
      sharedSettings,
      expandedAllSettings,
      fullFacetOrder,
      data,
    );
  }, [sharedSettings, districtDataMap, allSettings]);

  const setSettings = (newSharedSettings, newAllSettings) => {
    const dashboardQuery = serializeExpenditureDashboardSettings(newSharedSettings);
    const filterQuery = serializeExpenditureFilterSettings(newAllSettings);
    const query = [`s=${dashboardQuery}`];
    if (filterQuery) {
      query.push(`f=${filterQuery}`);
    }

    router.replace(`${pathname}?${query.join('&')}`);
  };

  return (
    <SettingsLayout
      sharedSettings={sharedSettings}
      setSharedSettings={newSharedSettings => setSettings(newSharedSettings, allSettings)}
      sharedSettingsComponents={[ExpendituresDashboardSettingsContents]}
      allSettings={allSettings}
      setAllSettings={newAllSettings => setSettings(sharedSettings, newAllSettings)}
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
