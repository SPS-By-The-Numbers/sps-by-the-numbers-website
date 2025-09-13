'use client';

import { useDistrictData } from '../DistrictDataProvider';
import { useEffect } from 'react';
import ExpenditureComparisonDashboard from './ExpenditureComparisonDashboard';
import Loading from 'components/Loading';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Params = {
  ccddd: number;
  mode: string;
};

function getTitle(mode) {
  switch (mode) {
    case 'summary':
        return 'Key District Measures';

    case 'enrollment':
        return 'Enrollment Details';

    case 'expenditures':
        return 'Expenditure Analysis';
  }

  return "[error]";
}

export default function DashboardSwitcher({ccddd, mode} : Params) {
  const { districtDataMap, loadCcddd } = useDistrictData();

  const title = getTitle(mode);

  let chartComponent = (<p>Coming soon</p>);

  useEffect(
    () => {
      // Move this loading into the lower compoonent.
      loadCcddd(ccddd);
    },
    [ccddd]);

  if (mode === 'expenditures') {
    if (ccddd in districtDataMap) {
      chartComponent = (
        <ExpenditureComparisonDashboard
          primaryCcddd={ccddd}
          expenditureFacet="activity"
        />
      );
    } else {
      chartComponent = (<Loading />);
    }
  }

  return (
    <Stack component="main" gap="0.2rem" paddingTop="0.3rem">
      <Paper sx={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
        <Typography component="h1" variant="h1" textAlign="center" style={{fontSize: "2.5rem"}}>{title} Dashboard</Typography>
      </Paper>
      {chartComponent}
    </Stack>
  );
}
