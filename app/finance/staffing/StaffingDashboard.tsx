'use client';

import { ActivityFilterContents, ProgramFilterContents, SchoolFilterContents } from 'app/finance/_widgets/ExpenditureFilterContents';
import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { extractRawS275Staffing, extractFacetsByAmount, toChartableDataset, getDataColumnNames } from 'utilities/ChartableMetrics';
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeFacetComponents } from 'utilities/highcharts/FacetedBudgetActualCharts';
import { extractCodes } from 'app/finance/_widgets/ExpenditureFilterContents';
import { op } from 'arquero';
import * as aq from 'arquero';
import HcDashboard from 'components/HcDashboard';
import MetricSettingsContents from 'app/finance/_widgets/MetricSettingsContents';
import SettingsLayout from 'app/finance/_widgets/SettingsLayout';
import Typography from '@mui/material/Typography';

import type { ColumnTable } from 'arquero';
import type { DistrictDataContentProps } from 'app/finance/_providers/DistrictDataProvider';
import type { MetricSettings } from 'app/finance/_widgets/MetricSettingsContents';

const CONNECTOR_ID = 'settings-connector';

export interface StaffingSettings extends MetricSettings {
  selectedActivities : string[];
  selectedPrograms : string[];
  selectedSchools : string[];
  selectedDutyRoots : string[];
};

function componentsGenerator(staffingSettings : StaffingSettings, facetOrder) {
  const components = makeFacetComponents(
    staffingSettings.id,
    'class_of',
    'Class of',
    'fte',
    facetOrder,
    CONNECTOR_ID,
    [staffingSettings.staffingNormalization]);

  return components;
}

function makeFacetedStaffingForDistrict(districtData, filteredS275Summary, facet, staffingSettings) {
  const rawData = extractRawS275Staffing(filteredS275Summary);

  const formatedData = rawData.groupby('class_of')
    .pivot(['duty_root_code'], {
      finalSalary: d => op.sum(d.finalSalary),
      fte: d => op.sum(d.fte),
    })
    .select(aq.not('_pivot_name_hack_'))
    .derive({data_type: d => 'actuals'});

  const joinedData = formatedData.join_left(districtData.fundedEnrollmentSummary());
  const names = getDataColumnNames(joinedData);
  return toChartableDataset(districtData, joinedData, staffingSettings, 
               names.filter(d => (!d.includes('finalSalary_') && !d.includes('amount_'))),
               names.filter(d => d.includes('finalSalary_')),
               names.filter(d => d.includes('fte_')));
}

function compileData(districtDataMap, allSettings, facet) {
  const allDatasets = new Array<ColumnTable>;
  let facetInfo;
  for (const staffingSettings of allSettings) {
    const districtData = districtDataMap[staffingSettings.ccddd];

    // IF it has a school code, it has an staffing code.
    const filteredS275Summary = districtData.filteredS275Summary({
      selectedActivityCodes: extractCodes('act', staffingSettings.selectedActivities),
      selectedProgramCodes: extractCodes('prog', staffingSettings.selectedPrograms),
      selectedSchoolCodes: extractCodes('school', staffingSettings.selectedSchools),
      selectedDutyRootCodes: extractCodes('duty', staffingSettings.selectedDutyRoots),
    });

    const data = makeFacetedStaffingForDistrict(districtData, filteredS275Summary, facet, staffingSettings);
    allDatasets.push(data);
    if (facetInfo === undefined) {
      facetInfo = extractFacetsByAmount(filteredS275Summary, facet, "fte_in_assignment", "descending" as const);
    }
  }
  
  let data = allDatasets[0];
  for (const d of allDatasets.slice(1)) {
    data = data.join(d);
  }
  return [data, facetInfo];
}

// Charts expenditures for 
export default function StaffingDashboard({districtDataMap, allSettings, setAllSettings} : DistrictDataContentProps<StaffingSettings>) {
  const [data, facetOrder] = compileData(districtDataMap, allSettings, "duty_root" as const);

  const result = makeDatasetFacetedDashboard(allSettings, s => componentsGenerator(s, facetOrder));
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const {components, gui} = result;

  const config = ({
    gui,
    components,
    dataPool: {
      connectors: [
        {
          id: CONNECTOR_ID,
          type: 'JSON',
          options: dfToJSONConnectorOptions(data),
        },
      ],
    },
  });

  return (
    <SettingsLayout
        allSettings={allSettings}
        setAllSettings={setAllSettings}
        settingsContentsComponents={[
          MetricSettingsContents,
          ActivityFilterContents,
          ProgramFilterContents,
          SchoolFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Staffing Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
