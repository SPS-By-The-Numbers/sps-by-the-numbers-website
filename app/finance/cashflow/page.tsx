import { Metadata } from 'next';
import { Suspense } from 'react';
import CashflowDashboard from './CashflowDashboard';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: "Cashflow Dashboard for Washingtion State Schools",
  description: 'Shows enrollment details and correlations for Washingtion State Schools.',
};

export default async function Page() {
  return (
    <Stack component="main" gap="0.2rem" paddingTop="0.3rem">
      <Typography className="analysis-title" component="h1" variant="h1">
        Cashflow Dashboard
      </Typography>
      <Suspense>
        <CashflowDashboard/>
      </Suspense>
    </Stack>
  );
}

