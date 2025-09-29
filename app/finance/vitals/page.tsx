import { Metadata } from 'next';
import { Suspense } from 'react';
import VitalsDashboard from './VitalsDashboard';

export const metadata: Metadata = {
  title: "Vitals Dashboard for Washingtion State Schools",
  description: 'Shows key historical trends about enrollment, cashflow, and expenditures.',
};

export default async function Page() {
  return (
    <Suspense>
      <VitalsDashboard/>
    </Suspense>
  );
}
