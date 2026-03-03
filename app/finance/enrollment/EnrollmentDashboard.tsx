"use client";

import { serializeDatasetSettings, serializeOneSetting } from "app/finance/_settings/common_settings";
import { useMemo } from "react";
import { makeHighchartConfig } from "utilities/highcharts/utils";
import {
  toFacetedCharatbleEnrollmentDataset,
} from "utilities/ChartableMetrics";
import { extractFacets } from "utilities/ChartableVitals";
import { makeFacetComponents } from "utilities/highcharts/FacetedBudgetActualCharts";
import {
  SchoolFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";
import DistrictData from "utilities/DistrictData";
import DatasetSettingsContents from "app/finance/_widgets/DatasetSettingsContents";
import HcDashboard from "components/HcDashboard";
import SettingsLayout from "app/finance/_widgets/SettingsLayout";
import Typography from "@mui/material/Typography";
import { SERIALIZE_DETAILED_ACTUALS_SETTINGS_GENERATORS, SERIALIZE_DETAILED_ACTUALS_CONTEXT_SETTINGS_GENERATORS } from "app/finance/enrollment/EnrollmentPage";
import { makeFacetContents } from "app/finance/_widgets/FacetContents";
import SortOrderContents from "app/finance/_widgets/SortOrderContents";
import YScaleContents from "app/finance/_widgets/YScaleContents";

import { makeSchoolFilter } from "app/finance/_filteritems/school";

import type { DistrictDataContentProps } from "app/finance/_providers/DistrictDataProvider";
import type { EnrollmentSettings, EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

const CONNECTOR_ID = "default-connector";
const METRIC_NAME = "all_students";

const ALL_FACETS = ["school"];
export type Facet = (typeof ALL_FACETS)[number];
export const FACET_OPTIONS: Record<Facet, string> = {
  school: "School",
};

export function serializeFacet(facet: Facet): string {
  switch (facet) {
    case "school":
      return "0";
  }

  return "0";
}

export function deserializeFacet(s: string): Facet {
  switch (s) {
    case "0":
      return "school";
  }

  return "school";
}

function componentsGenerator(facetOrder,
                             contextSettings :EnrollmentContextSettings,
                             settings: EnrollmentSettings,
                             yBounds) {
  const schoolFilter = makeSchoolFilter(settings.ccddd);
  const subtitle = `
  School(${schoolFilter.toSummaryText(settings.schoolCodes)})
  `;
  const components = makeFacetComponents({
    idPrefix: settings.id.toString(),
    xColumn: "class_of",
    xLabel: "Fiscal Year End",
    yColumnRoot: METRIC_NAME,
    facetOrder,
    connectorId: CONNECTOR_ID,
    normalizations: [settings.currencyNormalization],
    captionType: "stats",
    subtitle,
    yBounds,
    yValueFormatOverride: "decimal",
    disableLegend: true,
  });

  return components;
}

// Charts expenditures for
export default function EnrollmentDashboard({
  districtDataMap,
  allSettings,
  contextSettings,
}: DistrictDataContentProps<EnrollmentSettings, EnrollmentContextSettings>) {
  const config = useMemo(() => {
    // Expand out the filter per sub-setting.
    const { data, fullFacetOrder } = extractFacets(
      districtDataMap,
      allSettings,
      contextSettings.facet,
      contextSettings.sortType,
      contextSettings.sortOrder,
      DistrictData.prototype.filteredEnrollment,
      toFacetedCharatbleEnrollmentDataset,
      METRIC_NAME,
    );

    return makeHighchartConfig(
      {
        connectorId: CONNECTOR_ID,
        metricName: METRIC_NAME,
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
      ]}
      settingsContentsComponents={[
        DatasetSettingsContents,
        SchoolFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Enrollment Headcount (Different from AAFTE in budgets which treats Running Start and Special Education students as less than 1).
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
