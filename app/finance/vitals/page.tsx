import { Metadata } from 'next';
import { Suspense } from 'react';
import VitalsDashboard from './VitalsDashboard';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: "Vitals Dashboard for Washingtion State Schools",
  description: 'Shows key historical trends about enrollment, cashflow, and expenditures.',
};

export default async function Page() {
  return (
    <Stack component="main" gap="0.2rem" paddingTop="0.3rem">
      <Typography className="analysis-title" component="h1" variant="h1">
        Vitals Dashboard
      </Typography>
      <Suspense>
        <VitalsDashboard/>
      </Suspense>
    </Stack>
  );
}
