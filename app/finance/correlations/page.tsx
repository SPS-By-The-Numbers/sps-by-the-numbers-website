import { Metadata } from "next";
import { Suspense } from "react";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { DEFAULT_METRIC_SETTINGS } from "app/finance/_widgets/MetricSettingsContents";
import { DEFAULT_COMMON_SHARED_SETTINGS } from "app/finance/_widgets/CommonSharedSettingsContents";
import CorrelationsDashboard from "./CorrelationsDashboard";

import type { CorrelationsSettings } from "./CorrelationsDashboard";

export const metadata: Metadata = {
  title: "Correlations Dashboard for Washingtion State Schools",
  description:
    "Shows enrollment details and correlations for Washingtion State Schools.",
};

export default async function Page() {
  return (
    <Suspense>
      <EnsureDistrictData
        initialValue={DEFAULT_METRIC_SETTINGS}
        ContentComponent={CorrelationsDashboard}
        initialSharedSettings={DEFAULT_COMMON_SHARED_SETTINGS}
      />
    </Suspense>
  );
}
