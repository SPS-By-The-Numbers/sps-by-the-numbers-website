import { Metadata } from 'next';
import EnrollmentDashboard from './EnrollmentDashboard';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const metadata: Metadata = {
  title: "Enrollment Dashboard for Washingtion State Schools",
  description: 'Shows enrollment details and correlations for Washingtion State Schools.',
};

export default async function Page() {
  return (
    <Stack component="main" gap="0.2rem" paddingTop="0.3rem">
      <Typography className="analysis-title" component="h1" variant="h1">
        Enrollment Dashboard
      </Typography>
      <EnrollmentDashboard/>
    </Stack>
  );
}

