import { Metadata } from "next";
import { Suspense } from "react";
import { DEFAULT_METRIC_SETTINGS } from "app/finance/_widgets/MetricSettingsContents";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import OrgChartDashboard from "./OrgChartDashboard";

export const metadata: Metadata = {
  title: "Reverse engineered Org Chart for SPS",
  description: "Attempts to show FTE + Salary per for each department in SPS",
};

export default async function Page() {
  return (
    <Suspense>
      {/* initialValue only uses one district */}
      <EnsureDistrictData
        initialValue={[DEFAULT_METRIC_SETTINGS[0]]}
        ContentComponent={OrgChartDashboard}
      />
    </Suspense>
  );
}
