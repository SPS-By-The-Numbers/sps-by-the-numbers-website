import { Metadata } from 'next';
import OrgChartDashboard from './OrgChartDashboard';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: "Actual Spending Dashboard for Washingtion State Schools",
  description: 'Gives detailed breakdown of actual spending using the NCES classification codes.',
};

export default async function Page() {
  return (
    <Stack component="main" gap="0.2rem" paddingTop="0.3rem">
      <Typography className="analysis-title" component="h1" variant="h1">
        Attempt to reverse engineer an SPS Org chart from P-A-O codes and S275 data.
      </Typography>
      <OrgChartDashboard />
    </Stack>
  );
}
