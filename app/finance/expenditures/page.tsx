import { Metadata } from 'next';
import ExpendituresDashboard from './ExpendituresDashboard';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: "Expenditures Dashboard for Washingtion State Schools",
  description: 'Allows for anlaysis and comparison of historical finances on all school districts.',
};

export default async function Page() {
  return (
    <Stack component="main" gap="0.2rem" paddingTop="0.3rem">
      <Typography className="analysis-title" component="h1" variant="h1">
        Expenditures Dashboard
      </Typography>
      <ExpendituresDashboard facet="activity" />
    </Stack>
  );
}
