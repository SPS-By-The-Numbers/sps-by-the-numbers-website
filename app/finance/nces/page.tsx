import { Metadata } from 'next';
import NcesDashboard from './NcesDashboard';
import Box from '@mui/material/Box';

export const metadata: Metadata = {
  title: "Actual Spending Dashboard for Washingtion State Schools",
  description: 'Gives detailed breakdown of actual spending using the NCES classification codes.',
};

export default async function Page() {
  return (
    <Box component="main" gap="0.2rem" paddingTop="0.3rem">
      <NcesDashboard />
    </Box>
  );
}
