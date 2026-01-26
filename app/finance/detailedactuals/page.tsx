import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { Metadata } from "next";
import { Suspense } from "react";
import DetailedActualsDashboard, { deserializeDetailedActualsDatasetSettings } from "./DetailedActualsDashboard";
import { getParamAsStringArray } from "utilities/settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";

import type { DetailedActualsSettings } from "./DetailedActualsDashboard";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Actual Spending Dashboard for Washingtion State Schools",
  description:
    "Gives detailed breakdown of actual spending using the NCES classification codes.",
};

export default async function Page(params: Params) {
  const searchParams = await params.searchParams;
  /*
  const sharedSettings = deserializeDetailedActualsDashboardSettings(
    getParamAsStringArray(searchParams.s),
  );
  */
  const allSettings = deserializeDetailedActualsDatasetSettings(
    getParamAsStringArray(searchParams.d),
  );
  return (
    <Suspense>
      <EnsureDistrictData
        allSettings={allSettings}
        sharedSettings={DUMMY_BASE_SETTINGS}
        ContentComponent={DetailedActualsDashboard}
      />
    </Suspense>
  );
}
