'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeChartCells, makeExpendituresData, makeSortedGui } from './CustomExpendituresConfig';
import { useDistrictData } from '../../DistrictDataProvider';
import { useEffect, useState, useRef } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import { makeChartableExpenditures } from 'utilities/ChartableMetrics';
import ComparisonDashboard from './ComparisonDashboard';
import ExpenditureFilter, { ALL_PROGRAM_ITEMS, ALL_ACTIVITY_ITEMS, ALL_OBJECT_ITEMS } from 'app/finance/ExpenditureFilter';
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

function updateChart(dashboards, dashboardDiv, priorBoard, mode, districtData, filterSelection) {
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
  const priorBoard = useRef<Dashboards | null>(null);
  const dashboardDiv = useRef<HTMLDivElement>(null);
  const [selectedObjects, setSelectedObjects] = useState<string[]>(ALL_OBJECT_ITEMS);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(ALL_ACTIVITY_ITEMS);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(ALL_PROGRAM_ITEMS);

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

        updateChart(dashboards, dashboardDiv, priorBoard, mode, districtData, filterSelection);
      }
    },
    [ccddd, districtDataMap, highchartsObjs, loadCcddd, mode,
      selectedObjects, selectedPrograms, selectedActivities]
  );

  const filterSelection = {
    selectedObjectCodes: extractCodes('obj', selectedObjects),
    selectedActivityCodes: extractCodes('act', selectedActivities),
    selectedProgramCodes: extractCodes('prog', selectedPrograms),
  };

  const title = getTitle(mode);

  let chartComponent = (
    <div ref={dashboardDiv}>
      <Loading />
    </div>
  );

  if (mode === 'expenditures' && ccddd in districtDataMap) {
    const [data, facetOrder] = makeChartableExpenditures(
      ccddd,
      districtDataMap[ccddd].filteredExpenditures(filterSelection),
      'activity',
      'variance' as const,
      'descending' as const);

    chartComponent = (
      <ComparisonDashboard
        idPrefix="act"
        data={data}
        xColumn="class_of"
        xLabel="Class of"
        facetOrder={facetOrder}
        metricList={
          [
            {
              ccddd,
              metricVaraint: 'amount',
              valueFormat: 'currency' as const,
              precision: 2,  // TODO: remove and infer from valueFormat
            },
            {
              ccddd,
              metricVaraint: 'pctexp',
              valueFormat: 'pctexp' as const,
              precision: 2,  // TODO: remove and infer from valueFormat
            },
          ]
        }
      />);
  }

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
      {chartComponent}
    </Stack>
  );
}
