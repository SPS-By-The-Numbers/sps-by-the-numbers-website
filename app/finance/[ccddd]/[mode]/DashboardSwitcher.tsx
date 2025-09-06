'use client';

import { useDistrictData } from '../../DistrictDataProvider';
import { useEffect } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import makeEnrollmentConfig from './EnrollmentConfig';
import makeExpendituresConfig from './ExpendituresConfig';
import makeSummaryConfig from './SummaryConfig';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import "styles/hc-ba-history.scss"

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

function updateChart(dashboards, mode, districtData) {
  if (mode === 'summary') {
    dashboards.board('dashboard-charts-container',
                     makeSummaryConfig(districtData));
  } else if (mode === 'enrollment') {
    dashboards.board('dashboard-charts-container',
                     makeEnrollmentConfig(districtData));
  } else if (mode === 'expenditures') {
    dashboards.board('dashboard-charts-container',
                     makeExpendituresConfig(districtData));
  }
}

export default function DashboardSwitcher({ccddd, mode} : Params) {
  const { highchartsObjs } = useHighcharts();
  const { districtDataMap, loadCcddd } = useDistrictData();

  useEffect(
    () => {
      if (!(ccddd in districtDataMap)) {
        loadCcddd(ccddd)
      }

      if (highchartsObjs.dashboards && ccddd in districtDataMap) {
        const dashboards = highchartsObjs.dashboards;
        const districtData = districtDataMap[ccddd];

        updateChart(dashboards, mode, districtData);
      }
    },
    [ccddd, districtDataMap, highchartsObjs, loadCcddd]
  );

  const title = getTitle(mode);

  return (
    <Stack component="main" sx={{ margin: "1rem" }}>
      <Paper sx={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
      <Typography component="h1" variant="h1" textAlign="center" style={{fontSize: "2.5rem"}}>{title} Dashboard</Typography>
      </Paper>
      <div id="dashboard-charts-container">
        <LinearProgress />
          <Paper>
            <Typography
              component="h2"
              variant="h2"
              textAlign="center"
              style={{
                paddingTop: "1rem",
                paddingBottom: "1rem",
                fontSize: "1.5rem",
              }}
              id="hi"
            >
              Loading...
            </Typography>
          </Paper>
      </div>
    </Stack>
  );
}
