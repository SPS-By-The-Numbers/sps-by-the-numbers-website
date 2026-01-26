import {
  ALL_ACTIVITY_ITEMS,
  ALL_PROGRAM_ITEMS,
  ALL_DUTY_ROOT_ITEMS,
} from "app/finance/_widgets/ExpenditureFilterContents";
import { DEFAULT_METRIC_SETTINGS } from "app/finance/_settings/metric_settings";
import { DUMMY_BASE_SETTINGS } from "app/finance/_settings/base_settings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import { makeSchoolItems } from "app/finance/_widgets/ExpenditureFilterContents";
import { Metadata } from "next";
import { Suspense } from "react";
import StaffingDashboard from "./StaffingDashboard";

import type { StaffingSettings } from "./StaffingDashboard";

const DEFAULT_STAFF_SETTINGS = DEFAULT_METRIC_SETTINGS.map((v) => ({
  ...v,
  selectedActivities: ALL_ACTIVITY_ITEMS,
  selectedPrograms: ALL_PROGRAM_ITEMS,
  selectedSchools: makeSchoolItems(v.ccddd),
  selectedDutyRoots: ALL_DUTY_ROOT_ITEMS,
}));

export const metadata: Metadata = {
  title: "Staffing Dashboard for Washingtion State Schools",
  description:
    "Allows for anlaysis and comparison of historical staffing on all school districts.",
};

export default async function Page() {
  return (
    <Suspense>
      <EnsureDistrictData
        allSettings={DEFAULT_STAFF_SETTINGS}
        sharedSettings={DUMMY_BASE_SETTINGS}
        ContentComponent={StaffingDashboard}
      />
    </Suspense>
  );
}
