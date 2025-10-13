import { ALL_OBJECT_ITEMS, ALL_ACTIVITY_ITEMS, ALL_PROGRAM_ITEMS } from 'app/finance/_widgets/ExpenditureFilterContents';
import { DEFAULT_COMMON_SHARED_SETTINGS } from 'app/finance/_widgets/CommonSharedSettingsContents';
import { DEFAULT_METRIC_SETTINGS } from 'app/finance/_widgets/MetricSettingsContents';
import { EnsureDistrictData } from 'app/finance/_providers/DistrictDataProvider';
import { Metadata } from 'next';
import { Suspense } from 'react';
import ExpendituresDashboard from './ExpendituresDashboard';

import type { ExpendituresDashboardSettings } from './ExpendituresDashboardSettings';
import type { ExpendituresSettings } from './ExpendituresDashboard';

const DEFAULT_EXPENDITURE_SETTINGS = DEFAULT_METRIC_SETTINGS.map(
  v => ({
    ...v, 
    selectedObjects: ALL_OBJECT_ITEMS,
    selectedActivities: ALL_ACTIVITY_ITEMS,
    selectedPrograms: ALL_PROGRAM_ITEMS,
  })
);

const DEFAULT_DASHBOARD_SETTINGS = {
  ...DEFAULT_COMMON_SHARED_SETTINGS,
  facet: "activity" as const,
  facetLimit: "10",
  sortOrder: 'descending' as const,
  sortType: 'variance' as const,
  yScale: "free" as const,
  disableChartUpdate: true,  // TODO: REmove
} as ExpendituresDashboardSettings;

export const metadata: Metadata = {
  title: "Expenditures Dashboard for Washingtion State Schools",
  description: 'Allows for anlaysis and comparison of historical finances on all school districts.',
};

export default async function Page() {
  return (
    <Suspense>
      <EnsureDistrictData
          initialValue={DEFAULT_EXPENDITURE_SETTINGS}
          ContentComponent={ExpendituresDashboard}
          initialSharedSettings={DEFAULT_DASHBOARD_SETTINGS} />
    </Suspense>
  );
}
