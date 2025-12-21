import {
  ALL_OBJECT_ITEMS,
  ALL_ACTIVITY_ITEMS,
  ALL_PROGRAM_ITEMS,
} from "app/finance/_widgets/ExpenditureFilterContents";
import { DEFAULT_COMMON_SHARED_SETTINGS } from "app/finance/_widgets/CommonSharedSettingsContents";
import { DEFAULT_METRIC_SETTINGS } from "app/finance/_widgets/MetricSettingsContents";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { Metadata } from "next";
import { Suspense } from "react";
import { deserializeExpenditureDashboardSettings } from "./ExpendituresDashboardSettings";
import ExpendituresDashboard from "./ExpendituresDashboard";

import type { ExpendituresDashboardSettings } from "./ExpendituresDashboardSettings";
import type { ExpendituresSettings } from "./ExpendituresDashboard";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const DEFAULT_EXPENDITURE_SETTINGS = DEFAULT_METRIC_SETTINGS.map((v) => ({
  ...v,
  overridePrimaryFilter: false,

  selectedObjects: ALL_OBJECT_ITEMS,
  selectedActivities: ALL_ACTIVITY_ITEMS,
  selectedPrograms: ALL_PROGRAM_ITEMS,
}));

export const metadata: Metadata = {
  title: "Expenditures Dashboard for Washingtion State Schools",
  description:
    "Allows for anlaysis and comparison of historical finances on all school districts.",
};

function extractAllSettings(searchParams) {
  if (!searchParams.query) {
    return DEFAULT_EXPENDITURE_SETTINGS;
  }
  return DEFAULT_EXPENDITURE_SETTINGS;
}

function getSerialized(value) {
  if (Array.isArray(value)) {
    for (const v in value) {
      if (typeof(v) !== "string") {
        return [""];
      }
    }
    return value;
  } else if (typeof(value) === "string") {
    return [value];

  }
  return [""];
}

export default async function Page(params : Params) {
  const searchParams = await params.searchParams;
  const sharedSettings = deserializeExpenditureDashboardSettings(getSerialized(searchParams.s)[0]);
  const allSettings = extractAllSettings(searchParams);
  
  return (
    <Suspense>
      <EnsureDistrictData
        initialValue={allSettings}
        ContentComponent={ExpendituresDashboard}
        initialSharedSettings={sharedSettings}
      />
    </Suspense>
  );
}
