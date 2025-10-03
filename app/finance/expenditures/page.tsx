import { Metadata } from 'next';
import { Suspense } from 'react';
import ExpendituresDashboard from './ExpendituresDashboard';

export const metadata: Metadata = {
  title: "Expenditures Dashboard for Washingtion State Schools",
  description: 'Allows for anlaysis and comparison of historical finances on all school districts.',
};

export default async function Page() {
  return (
    <Suspense>
      <ExpendituresDashboard />
    </Suspense>
  );
}
