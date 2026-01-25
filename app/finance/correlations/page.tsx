import { Metadata } from "next";
import { Suspense } from "react";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { DEFAULT_METRIC_SETTINGS } from "app/finance/_widgets/MetricSettingsContents";
import { DEFAULT_COMMON_SHARED_SETTINGS } from "app/finance/_widgets/CommonSharedSettingsContents";
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
  const allSettings = DEFAULT_METRIC_SETTINGS; //deserializeCorrelationFilterSettings(getSerialized(searchParams.c)[0]);

  return (
    <Suspense>
      <EnsureDistrictData
        allSettings={allSettings}
        ContentComponent={CorrelationsDashboard}
      />
    </Suspense>
  );
}
