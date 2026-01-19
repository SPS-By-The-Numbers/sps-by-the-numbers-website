import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { Metadata } from "next";
import { Suspense } from "react";
import { deserializeExpenditureDashboardSettings } from "./ExpendituresDashboardSettings";
import { deserializeExpenditureFilterSettings } from "./ExpenditureFilterSettings";
import ExpendituresDashboard from "./ExpendituresDashboard";

import type { ExpendituresDashboardSettings } from "./ExpendituresDashboardSettings";

type Params = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Expenditures Dashboard for Washingtion State Schools",
  description:
    "Allows for anlaysis and comparison of historical finances on all school districts.",
};

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
  const allSettings = deserializeExpenditureFilterSettings(getSerialized(searchParams.f)[0]);
  
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
