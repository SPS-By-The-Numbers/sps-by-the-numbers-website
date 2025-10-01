import { Metadata } from 'next';
import { Suspense } from 'react';
import CashflowDashboard from './CashflowDashboard';

export const metadata: Metadata = {
  title: "Cashflow Dashboard for Washingtion State Schools",
  description: 'Shows enrollment details and correlations for Washingtion State Schools.',
};

export default async function Page() {
  return (
    <Suspense>
      <CashflowDashboard/>
    </Suspense>
  );
}

