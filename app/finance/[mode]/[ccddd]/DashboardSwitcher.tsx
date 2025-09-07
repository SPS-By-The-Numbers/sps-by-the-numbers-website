'use client';

import { useDistrictData } from '../../DistrictDataProvider';
import { useEffect, useState } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import makeEnrollmentConfig from './EnrollmentConfig';
import makeExpendituresConfig from './ExpendituresConfig';
import makeSummaryConfig from './SummaryConfig';
import ExpenditureFilter from 'app/finance/ExpenditureFilter';
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

function updateChart(dashboards, mode, districtData, filterSelection) {
  if (mode === 'summary') {
    dashboards.board('dashboard-charts-container',
                     makeSummaryConfig(districtData));
  } else if (mode === 'enrollment') {
    dashboards.board('dashboard-charts-container',
                     makeEnrollmentConfig(districtData));
  } else if (mode === 'expenditures') {
    dashboards.board('dashboard-charts-container',
                     makeExpendituresConfig(districtData, filterSelection));
  }
}

function extractCodes(prefix, selectedItems) {
  const selectedCodes = new Array<number>;
  for (const id of selectedItems) {
    const parts = id.split('-');
    if (parts.length === 2 && parts[0] === prefix) {
      selectedCodes.push(parseInt(parts[1]));
    }
  }
  return selectedCodes;
}

export default function DashboardSwitcher({ccddd, mode} : Params) {
  const [selectedObjects, setSelectedObjects] = useState<string[]>(['obj-2', 'obj-3']);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    // Add basic teaching related activities.
    'act-21',
    'act-27',
    'act-28',
  ]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([
    // Add all special education programs for now.
    'prog-21',
    'prog-22',
    'prog-23',
    'prog-24',
    'prog-25',
    'prog-29',
  ]);

  const { highchartsObjs } = useHighcharts();
  const { districtDataMap, loadCcddd } = useDistrictData();

  useEffect(
    () => {
      if (!(ccddd in districtDataMap)) {
        loadCcddd(ccddd)
      }

      const filterSelection = {
        selectedObjectCodes: extractCodes('obj', selectedObjects),
        selectedActivityCodes: extractCodes('act', selectedActivities),
        selectedProgramCodes: extractCodes('prog', selectedPrograms),
      };

      if (highchartsObjs.dashboards && ccddd in districtDataMap) {
        const dashboards = highchartsObjs.dashboards;
        const districtData = districtDataMap[ccddd];

        updateChart(dashboards, mode, districtData, filterSelection);
      }
    },
    [ccddd, districtDataMap, highchartsObjs, loadCcddd, mode,
      selectedObjects, selectedPrograms, selectedActivities]
  );

  const title = getTitle(mode);

  return (
    <Stack component="main" gap="0.2rem" paddingTop="0.3rem">
      <Paper sx={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
        <Typography component="h1" variant="h1" textAlign="center" style={{fontSize: "2.5rem"}}>{title} Dashboard</Typography>
      </Paper>
      <ExpenditureFilter
        filterState={
          {
            selectedObjects,
            setSelectedObjects,
            selectedActivities,
            setSelectedActivities,
            selectedPrograms,
            setSelectedPrograms
          }}
      />
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
          >
            Loading...
          </Typography>
        </Paper>
      </div>
    </Stack>
  );
}
