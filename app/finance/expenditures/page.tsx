import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { Metadata } from "next";
import { Suspense } from "react";
import { deserializeExpenditureDashboardSettings } from "./ExpendituresDashboardSettings";
import { deserializeExpenditureFilterSettings } from "./ExpenditureFilterSettings";
import ExpendituresDashboard from "./ExpendituresDashboard";
import { getParamAsStringArray } from "utilities/settings";

import type { ExpendituresDashboardSettings } from "./ExpendituresDashboardSettings";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Expenditures Dashboard for Washingtion State Schools",
  description:
    "Allows for anlaysis and comparison of historical finances on all school districts.",
};

export default async function Page(params: Params) {
  const searchParams = await params.searchParams;
  const sharedSettings = deserializeExpenditureDashboardSettings(
    getParamAsStringArray(searchParams.s),
  );
  const allSettings = deserializeExpenditureFilterSettings(
    getParamAsStringArray(searchParams.d),
  );

  return (
    <Suspense>
      <EnsureDistrictData
        allSettings={allSettings}
        sharedSettings={sharedSettings}
        ContentComponent={ExpendituresDashboard}
      />
    </Suspense>
  );
}
