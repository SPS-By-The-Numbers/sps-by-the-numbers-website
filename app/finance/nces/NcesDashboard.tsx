'use client';

import * as aq from 'arquero';
import { op } from 'arquero';
import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { extractRawExpenditures, extractFacetsByAmount, toChartableDataset, getDataColumnNames } from 'utilities/ChartableMetrics';
import { useDistrictData } from 'app/finance/_providers/DistrictDataProvider';
import { useState, useEffect } from 'react';
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeFacetComponents } from 'app/finance/_widgets/FacetedBudgetActualCharts';
import DistrictSelector from 'app/finance/_widgets/DistrictSelector';
import { ObjectFilterContents, ActivityFilterContents, ProgramFilterContents, SchoolFilterContents} from 'app/finance/_widgets/ExpenditureFilterContents';
import { makeSchoolItems, extractCodes } from 'app/finance/_widgets/ExpenditureFilterContents';
import { ALL_OBJECT_ITEMS, ALL_ACTIVITY_ITEMS, ALL_PROGRAM_ITEMS } from 'app/finance/_widgets/ExpenditureFilterContents';
import FacetedBudgetActualCharts from 'app/finance/_widgets/FacetedBudgetActualCharts';
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import SettingsLayout from 'app/finance/_widgets/SettingsLayout';
import MetricSettingsContents, { DEFAULT_METRIC_SETTINGS } from 'app/finance/_widgets/MetricSettingsContents';
import Typography from '@mui/material/Typography';

import type { ColumnTable } from 'arquero';
import type { MetricSettings } from 'app/finance/_widgets/MetricSettingsContents';

const CONNECTOR_ID = 'nces-connector';

export interface NcesSettings extends MetricSettings {
  selectedObjects : string[];
  selectedActivities : string[];
  selectedPrograms : string[];
  selectedSchools : string[];
};

const DEFAULT_NCES_SETTINGS = DEFAULT_METRIC_SETTINGS.map(
  v => ({
    ...v, 
    selectedObjects: ALL_OBJECT_ITEMS,
    selectedActivities: ALL_ACTIVITY_ITEMS,
    selectedPrograms: ALL_PROGRAM_ITEMS,
    selectedSchools: makeSchoolItems(v.ccddd),
  })
);

function componentsGenerator(ncesSettings : NcesSettings, facetOrder) {
  const components =  makeFacetComponents(
    ncesSettings.id,
    'class_of',
    'Class of',
    'amount',
    facetOrder,
    CONNECTOR_ID,
    [ncesSettings.currencyNormalization]);

  return components;
}

function makeFacetedNcesForDistrict(districtData, filteredExpenditures, facet, expenditureSettings) {
  const data = extractRawExpenditures(filteredExpenditures, facet);

  const pdata = data.groupby(['class_of', 'data_type'])
    .pivot(['nces_code'], {
      amount: d => op.sum(d.amount),
        _pivot_name_hack_: d => op.any('_pivot_name_hack_')
    })
    .select(aq.not('_pivot_name_hack_'));

  const names = getDataColumnNames(pdata);
  return toChartableDataset(districtData, pdata, expenditureSettings, [], names, []);
}

function compileData(districtDataMap, allNcesSettings, facet) {
  const allDatasets = new Array<ColumnTable>;
  let facetInfo;
  for (const ncesSettings of allNcesSettings) {
    const districtData = districtDataMap[ncesSettings.ccddd];

    // IF it has a school code, it has an nces code.
    // TODO: Filter by NCES codes too.
    const filteredExpenditures = districtData.filteredExpenditures({
      selectedObjectCodes: extractCodes('obj', ncesSettings.selectedObjects),
      selectedActivityCodes: extractCodes('act', ncesSettings.selectedActivities),
      selectedProgramCodes: extractCodes('prog', ncesSettings.selectedPrograms),
      selectedSchoolCodes: extractCodes('school', ncesSettings.selectedSchools),
    });

    const data = makeFacetedNcesForDistrict(districtData, filteredExpenditures, facet, ncesSettings);
    allDatasets.push(data);
    if (facetInfo === undefined) {
      facetInfo = extractFacetsByAmount(filteredExpenditures, facet, "amount", "descending" as const);
    }
  }
  
  let data = allDatasets[0];
  for (const d of allDatasets.slice(1)) {
    data = data.join(d);
  }
  return [data, facetInfo];
}

// Charts expenditures for 
export default function NcesDashboard() {
  const facet = 'nces';
  const {districtDataMap, loadCcddd} = useDistrictData();
  const [allNcesSettings, setAllNcesSettings] = useState<Array<NcesSettings>>(DEFAULT_NCES_SETTINGS);

  useEffect(
    () => { 
      for (const settings of allNcesSettings) {
        loadCcddd(settings.ccddd);
      }
    },
    [allNcesSettings, loadCcddd]);

  for (const ncesSettings of allNcesSettings) {
    if (!(ncesSettings.ccddd in districtDataMap)) {
      return <Loading text="Loading dataset..." />
    }
  }

  const [data, facetOrder] = compileData(districtDataMap, allNcesSettings, "nces" as const);

  const result = makeDatasetFacetedDashboard(allNcesSettings, s => componentsGenerator(s, facetOrder));
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
        allDatasetSettings={allNcesSettings}
        setAllDatasetSettings={setAllNcesSettings}
        settingsContentsComponents={[
          MetricSettingsContents,
          ObjectFilterContents,
          ActivityFilterContents,
          ProgramFilterContents,
          SchoolFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Nces Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
