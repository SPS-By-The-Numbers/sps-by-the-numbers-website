import { ALL_OBJECT_ITEMS, ALL_ACTIVITY_ITEMS, ALL_PROGRAM_ITEMS } from 'app/finance/_widgets/ExpenditureFilterContents';
import { DEFAULT_METRIC_SETTINGS } from 'app/finance/_widgets/MetricSettingsContents';
import { EnsureDistrictData } from 'app/finance/_providers/DistrictDataProvider';
import { makeSchoolItems } from 'app/finance/_widgets/ExpenditureFilterContents';
import { Metadata } from 'next';
import { Suspense } from 'react';
import NcesDashboard from './NcesDashboard';

import type { NcesSettings } from './NcesDashboard';

const DEFAULT_NCES_SETTINGS = DEFAULT_METRIC_SETTINGS.map(
  v => ({
    ...v, 
    selectedObjects: ALL_OBJECT_ITEMS,
    selectedActivities: ALL_ACTIVITY_ITEMS,
    selectedPrograms: ALL_PROGRAM_ITEMS,
    selectedSchools: makeSchoolItems(v.ccddd),
  })
);

export const metadata: Metadata = {
  title: "Actual Spending Dashboard for Washingtion State Schools",
  description: 'Gives detailed breakdown of actual spending using the NCES classification codes.',
};

export default async function Page() {
  return (
    <Suspense>
      <EnsureDistrictData initialValue={DEFAULT_NCES_SETTINGS} ContentComponent={NcesDashboard} />
    </Suspense>
  );
}
