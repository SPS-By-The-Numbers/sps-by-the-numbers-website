import { Metadata } from 'next';
import { Suspense } from 'react';
import OrgChartDashboard from './OrgChartDashboard';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: "Reverse engineered Org Chart for SPS",
  description: 'Attempts to show FTE + Salary per for each department in SPS',
};

export default async function Page() {
  return (
    <Stack component="main" gap="0.2rem" paddingTop="0.3rem">
      <Typography className="analysis-title" component="h1" variant="h1">
        Attempt to reverse engineer an SPS Org chart from P-A-O codes and S275 data.
      </Typography>
      <Suspense>
        <OrgChartDashboard />
      </Suspense>
    </Stack>
  );
}
