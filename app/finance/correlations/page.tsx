import { Metadata } from "next";
import { Suspense } from "react";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { DEFAULT_DATASET_SETTINGS } from "app/finance/_settings/dataset_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import CorrelationsDashboard from "./CorrelationsDashboard";
import { getParamAsStringArray } from "utilities/settings";

import type { CorrelationsSettings } from "./CorrelationsDashboard";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Correlations Dashboard for Washingtion State Schools",
  description:
    "Shows enrollment details and correlations for Washingtion State Schools.",
};

export default async function Page(params: Params) {
  const searchParams = await params.searchParams;
  const allSettings = DEFAULT_DATASET_SETTINGS; //deserializeCorrelationFilterSettings(getSerialized(searchParams.c)[0]);

  return (
    <Suspense>
      <EnsureDistrictData
        allSettings={allSettings}
        sharedSettings={DUMMY_BASE_SETTINGS}
        ContentComponent={CorrelationsDashboard}
      />
    </Suspense>
  );
}
