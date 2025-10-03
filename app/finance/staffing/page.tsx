import { Metadata } from 'next';
import { Suspense } from 'react';
import StaffingDashboard from './StaffingDashboard';

export const metadata: Metadata = {
  title: "Staffing Dashboard for Washingtion State Schools",
  description: 'Allows for anlaysis and comparison of historical staffing on all school districts.',
};

export default async function Page() {
  return (
    <Suspense>
      <StaffingDashboard />
    </Suspense>
  );
}
