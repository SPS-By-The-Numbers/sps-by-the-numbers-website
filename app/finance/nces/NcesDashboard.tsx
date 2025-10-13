'use client';

import * as aq from 'arquero';
import { op } from 'arquero';
import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { extractRawExpenditures, extractFacetsByAmount, toChartableDataset, getDataColumnNames } from 'utilities/ChartableMetrics';
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeFacetComponents } from 'utilities/highcharts/FacetedBudgetActualCharts';
import { ObjectFilterContents, ActivityFilterContents, ProgramFilterContents, SchoolFilterContents } from 'app/finance/_widgets/ExpenditureFilterContents';
import { extractCodes } from 'app/finance/_widgets/ExpenditureFilterContents';
import HcDashboard from 'components/HcDashboard';
import SettingsLayout from 'app/finance/_widgets/SettingsLayout';
import MetricSettingsContents from 'app/finance/_widgets/MetricSettingsContents';
import Typography from '@mui/material/Typography';

import type { ColumnTable } from 'arquero';
import type { DistrictDataContentProps } from 'app/finance/_providers/DistrictDataProvider';
import type { MetricSettings } from 'app/finance/_widgets/MetricSettingsContents';

const CONNECTOR_ID = 'nces-connector';

export interface NcesSettings extends MetricSettings {
  selectedObjects : string[];
  selectedActivities : string[];
  selectedPrograms : string[];
  selectedSchools : string[];
};

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

function compileData(districtDataMap, allSettings, facet) {
  const allDatasets = new Array<ColumnTable>;
  let facetInfo;
  for (const ncesSettings of allSettings) {
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
export default function NcesDashboard({districtDataMap, allSettings, setAllSettings} : DistrictDataContentProps<NcesSettings>) {
  const [data, facetOrder] = compileData(districtDataMap, allSettings, "nces" as const);

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
