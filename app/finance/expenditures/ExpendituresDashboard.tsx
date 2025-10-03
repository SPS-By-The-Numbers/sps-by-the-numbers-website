'use client';

import * as aq from 'arquero';
import { op } from 'arquero';
import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { extractRawExpenditures, toChartableDataset, getDataColumnNames } from 'utilities/ChartableMetrics';
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeFacetComponents } from 'app/finance/FacetedBudgetActualCharts';
import { ObjectFilterContents, ActivityFilterContents, ProgramFilterContents, ALL_OBJECT_ITEMS, ALL_ACTIVITY_ITEMS, ALL_PROGRAM_ITEMS } from 'app/finance/ExpenditureFilterContents';
import { useDistrictData } from 'app/finance/DistrictDataProvider';
import { useState, useEffect } from 'react';
import CurrencyNormalizationSelector from 'app/finance/CurrencyNormalizationSelector';
import DistrictSelector from 'app/finance/DistrictSelector';
import ExpenditureFilter from 'app/finance/ExpenditureFilter';
import FacetedBudgetActualCharts from 'app/finance/FacetedBudgetActualCharts';
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import MetricSettingsContents, {DEFAULT_METRIC_SETTINGS} from 'app/finance/MetricSettingsContents';
import SettingsLayout from 'app/finance/SettingsLayout';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { ColumnTable } from 'arquero';
import type { DistrictDataMap } from 'app/finance/DistrictDataProvider';
import type { MetricSettings } from 'app/finance/MetricSettingsContents';

interface ExpendituresSettings extends MetricSettings {
  selectedObjects : string[];
  selectedActivities : string[];
  selectedPrograms : string[];
};

const DEFAULT_EXPENDITURE_SETTINGS = DEFAULT_METRIC_SETTINGS.map(
  v => ({
    ...v, 
    selectedObjects: ALL_OBJECT_ITEMS,
    selectedActivities: ALL_ACTIVITY_ITEMS,
    selectedPrograms: ALL_PROGRAM_ITEMS,
  })
);

const CONNECTOR_ID = 'expenditures-connector';

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

function componentsGenerator(expenditureSettings : ExpendituresSettings, facetOrder) {
  const components =  makeFacetComponents(
    expenditureSettings.id,
    'class_of',
    'Class of',
    'amount',
    facetOrder,
    CONNECTOR_ID,
    [expenditureSettings]);

  return components;
}

function allInMap(districtDataMap, allCcddds) {
  for (const ccddd of allCcddds) {
    if (!(ccddd in districtDataMap)) {
      return false;
    }
  }

  return true;
}

function makeFacetedExpendituresForDistrict(districtData, facet, expenditureSettings) {
  const filteredExpenditures = districtData.filteredExpenditures({
    selectedObjectCodes: extractCodes('obj', expenditureSettings.selectedObjects),
    selectedActivityCodes: extractCodes('act', expenditureSettings.selectedActivities),
    selectedProgramCodes: extractCodes('prog', expenditureSettings.selectedPrograms),
  });
  const {data, facetInfo} = extractRawExpenditures(
    filteredExpenditures,
    "activity" as const,  // TODO: Merge with activity
    "descending" as const);

  const pdata = data.groupby(['class_of', 'data_type'])
    .pivot(['activity_code'], {
      amount: d => op.sum(d.amount),
        _pivot_name_hack_: d => op.any('_pivot_name_hack_')
    })
    .select(aq.not('_pivot_name_hack_'));

  const names = getDataColumnNames(pdata);
  const result = {
    data: toChartableDataset(districtData, pdata,
                             expenditureSettings, [], names),
    facetInfo
  };

  return result;
}

function compileData(districtDataMap, allExpendituresSettings, facet) {
  const allDatasets = new Array<ColumnTable>;
  let firstFacetInfo;
  for (const expenditureSettings of allExpendituresSettings) {
    const {data, facetInfo} = makeFacetedExpendituresForDistrict(
      districtDataMap[expenditureSettings.ccddd],
      facet,
      expenditureSettings);
    allDatasets.push(data);
    if (firstFacetInfo === undefined) {
      firstFacetInfo = facetInfo;
    }
  }
  
  let data = allDatasets[0];
  for (const d of allDatasets.slice(1)) {
    data = data.join(d);
  }
  return [data, firstFacetInfo];
}

// Charts expenditures for 
export default function ExpendituresDashboard() {
  const facet = 'activity';
  const {districtDataMap, loadCcddd} = useDistrictData();
  const [allExpendituresSettings, setAllExpendituresSettings] = useState<Array<ExpendituresSettings>>(DEFAULT_EXPENDITURE_SETTINGS);

  useEffect(
    () => { 
      for (const settings of allExpendituresSettings) {
        loadCcddd(settings.ccddd);
      }
    },
    [allExpendituresSettings, loadCcddd]);

  for (const expenditureSettings of allExpendituresSettings) {
    if (!(expenditureSettings.ccddd in districtDataMap)) {
      return <Loading text="Loading dataset..." />
    }
  }

  const [data, facetOrder] = compileData(districtDataMap, allExpendituresSettings, facet);

  const result = makeDatasetFacetedDashboard(allExpendituresSettings, s => componentsGenerator(s, facetOrder));
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
        allDatasetSettings={allExpendituresSettings}
        setAllDatasetSettings={setAllExpendituresSettings}
        settingsContentsComponents={[
          MetricSettingsContents,
          ObjectFilterContents,
          ActivityFilterContents,
          ProgramFilterContents,
      ]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Expenditures Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
