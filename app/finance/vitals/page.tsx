import { DEFAULT_DATASET_SETTINGS, deserializeOneDatasetSettings } from "app/finance/_settings/dataset_settings";
import { DUMMY_BASE_SETTINGS, deserializeSettings } from "app/finance/_settings/base_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { Metadata } from "next";
import { Suspense } from "react";
import { getParamAsStringArray } from "utilities/settings";
import VitalsDashboard from "./VitalsDashboard";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Vitals Dashboard for Washingtion State Schools",
  description:
    "Shows key historical trends about enrollment, cashflow, and expenditures.",
};

export default async function Page(params: Params) {
  const searchParams = await params.searchParams;
  const allSettings = deserializeSettings(
    getParamAsStringArray(searchParams.d),
    DEFAULT_DATASET_SETTINGS,
    deserializeOneDatasetSettings
  );

  return (
    <Suspense>
      <EnsureDistrictData
        allSettings={allSettings}
        sharedSettings={DUMMY_BASE_SETTINGS}
        ContentComponent={VitalsDashboard}
      />
    </Suspense>
  );
}
