'use client';

import { useDistrictData } from '../../DistrictDataProvider';
import { useEffect, useRef } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import ExpenditureComparisonDashboard from './ExpenditureComparisonDashboard';
import Loading from 'components/Loading';
import makeEnrollmentConfig from './EnrollmentConfig';
import makeSummaryConfig from './SummaryConfig';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

import "styles/hc-ba-history.scss"
import "styles/finance-dashboard.scss"

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

function updateChart(dashboards, dashboardDiv, priorBoard, mode, districtData) {
  // Not mounted yet.
  if (dashboardDiv.current === null) {
    return;
  }

  if (priorBoard.current !== null) {
    priorBoard.current.destroy();
  }

  if (mode === 'summary') {
    priorBoard.current = dashboards.board(
      dashboardDiv.current,
      makeSummaryConfig(districtData));
  } else if (mode === 'enrollment') {
    priorBoard.current = dashboards.board(
      dashboardDiv.current,
      makeEnrollmentConfig(districtData));
  }
}

export default function DashboardSwitcher({ccddd, mode} : Params) {
  const priorBoard = useRef<Dashboards | null>(null);
  const dashboardDiv = useRef<HTMLDivElement>(null);

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

        updateChart(dashboards, dashboardDiv, priorBoard, mode, districtData);
      }
    },
    [ccddd, districtDataMap, highchartsObjs, loadCcddd, mode ]
  );


  const title = getTitle(mode);

  let chartComponent = (
    <div ref={dashboardDiv}>
      <Loading text="Loading..." />
    </div>
  );

  if (mode === 'expenditures' && ccddd in districtDataMap) {
    chartComponent = (
      <ExpenditureComparisonDashboard
        primaryCcddd={ccddd}
        expenditureFacet="activity"
        />
    );
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
