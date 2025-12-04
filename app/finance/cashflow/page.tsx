import { Metadata } from "next";
import { Suspense } from "react";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { DEFAULT_METRIC_SETTINGS } from "app/finance/_widgets/MetricSettingsContents";
import { DEFAULT_COMMON_SHARED_SETTINGS } from "app/finance/_widgets/CommonSharedSettingsContents";
import CashflowDashboard from "./CashflowDashboard";

import type { CashflowSettings } from "./CashflowDashboard";

export const metadata: Metadata = {
  title: "Cashflow Dashboard for Washingtion State Schools",
  description:
    "Shows enrollment details and correlations for Washingtion State Schools.",
};

export default async function Page() {
  return (
    <Suspense>
      <EnsureDistrictData
        initialValue={DEFAULT_METRIC_SETTINGS}
        ContentComponent={CashflowDashboard}
        initialSharedSettings={DEFAULT_COMMON_SHARED_SETTINGS}
      />
    </Suspense>
  );
}
