'use client';

import { useDistrictData } from '../../DistrictDataProvider';
import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { useEffect, useState, useRef } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import { makeChartCells, makeExpendituresData, makeSortedGui } from './CustomExpendituresConfig';
import makeEnrollmentConfig from './EnrollmentConfig';
import makeExpendituresConfig from './ExpendituresConfig';
import makeSummaryConfig from './SummaryConfig';
import ExpenditureFilter from 'app/finance/ExpenditureFilter';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
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

    case 'custom':
        return 'Custom Analysis';
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
  } else if (mode === 'expenditures') {
    priorBoard.current = dashboards.board(
      dashboardDiv.current,
      makeExpendituresConfig(districtData, filterSelection));
  } else if (mode === 'custom') {
    const expendituresDf = districtData.filteredExpenditures(filterSelection);
    const [allFacetsDf, facetCodesSortedDf, data] = makeExpendituresData(expendituresDf, "variance", "descending");
    const gui = makeSortedGui("act", facetCodesSortedDf.array('activity_code'));
    const connectorId = 'c-connector';

    priorBoard.current = dashboards.board(
      dashboardDiv.current,
      {
        gui,
        components: [
          ...makeChartCells(allFacetsDf, connectorId, "amount", "yFree"),
        ],
        dataPool: {
          connectors: [
            {
              id: connectorId,
              type: 'JSON',
              options: dfToJSONConnectorOptions(data),
            },
          ],
        },
      }
    );
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

        updateChart(dashboards, dashboardDiv, priorBoard, mode, districtData, filterSelection);
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
      <div ref={dashboardDiv}>
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
