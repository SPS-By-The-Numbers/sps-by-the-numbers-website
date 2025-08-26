import Box from '@mui/material/Box';
import DemographicGraph from './DemographicGraph';
import { Suspense } from 'react'

export default function ClosuresPage() {
  return (
    <Box mx="4rex" mt="1ex" >
      <Suspense>
        <DemographicGraph  />
      </Suspense>
    </Box>
  );
}
