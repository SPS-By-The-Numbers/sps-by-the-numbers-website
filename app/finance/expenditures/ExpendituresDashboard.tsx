'use client';

import * as aq from 'arquero';
import { op } from 'arquero';
import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { extractRawExpenditures, extractVarianceFacets, toChartableDataset, getDataColumnNames } from 'utilities/ChartableMetrics';
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeFacetComponents } from 'app/finance/_widgets/FacetedBudgetActualCharts';
import { ObjectFilterContents, ActivityFilterContents, ProgramFilterContents, extractCodes, ALL_OBJECT_ITEMS, ALL_ACTIVITY_ITEMS, ALL_PROGRAM_ITEMS } from 'app/finance/_widgets/ExpenditureFilterContents';
import { useDistrictData } from 'app/finance/_providers/DistrictDataProvider';
import { useState, useEffect } from 'react';
import CurrencyNormalizationSelector from 'app/finance/_widgets/CurrencyNormalizationSelector';
import DistrictSelector from 'app/finance/_widgets/DistrictSelector';
import FacetedBudgetActualCharts from 'app/finance/_widgets/FacetedBudgetActualCharts';
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import MetricSettingsContents, {DEFAULT_METRIC_SETTINGS} from 'app/finance/_widgets/MetricSettingsContents';
import SettingsLayout from 'app/finance/_widgets/SettingsLayout';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { ColumnTable } from 'arquero';
import type { DistrictDataMap } from 'app/finance/_providers/DistrictDataProvider';
import type { MetricSettings } from 'app/finance/_widgets/MetricSettingsContents';

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

function componentsGenerator(expenditureSettings : ExpendituresSettings, facetOrder) {
  const components =  makeFacetComponents(
    expenditureSettings.id,
    'class_of',
    'Class of',
    'amount',
    facetOrder,
    CONNECTOR_ID,
    [expenditureSettings.currencyNormalization]);

  return components;
}

function makeFacetedExpendituresForDistrict(districtData, filteredExpenditures, facet, expenditureSettings) {
  const data = extractRawExpenditures(
    filteredExpenditures,
    "activity" as const);

  const pdata = data.groupby(['class_of', 'data_type'])
    .pivot(['activity_code'], {
      amount: d => op.sum(d.amount),
        _pivot_name_hack_: d => op.any('_pivot_name_hack_')
    })
    .select(aq.not('_pivot_name_hack_'));

  const names = getDataColumnNames(pdata);
  return toChartableDataset(districtData, pdata,
                            expenditureSettings, [], names, []);
}

function compileData(districtDataMap, allExpendituresSettings, facet) {
  const allDatasets = new Array<ColumnTable>;
  let facetInfo;
  for (const expenditureSettings of allExpendituresSettings) {
    const districtData = districtDataMap[expenditureSettings.ccddd];
    const filteredExpenditures = districtData.filteredExpenditures({
      selectedObjectCodes: extractCodes('obj', expenditureSettings.selectedObjects),
      selectedActivityCodes: extractCodes('act', expenditureSettings.selectedActivities),
      selectedProgramCodes: extractCodes('prog', expenditureSettings.selectedPrograms),
    });

    const data = makeFacetedExpendituresForDistrict(
      districtData,
      filteredExpenditures,
      facet,
      expenditureSettings);

    allDatasets.push(data);
    if (facetInfo === undefined) {
      facetInfo = extractVarianceFacets(filteredExpenditures, facet, "descending" as const);
    }
  }
  
  let data = allDatasets[0];
  for (const d of allDatasets.slice(1)) {
    data = data.join(d);
  }
  return [data, facetInfo];
}

// Charts expenditures for 
export default function ExpendituresDashboard() {
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

  const [data, facetOrder] = compileData(districtDataMap, allExpendituresSettings, "activity" as const);

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
