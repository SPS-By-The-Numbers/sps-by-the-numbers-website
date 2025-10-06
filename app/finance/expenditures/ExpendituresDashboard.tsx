import * as aq from 'arquero';
import { op } from 'arquero';
import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { extractRawExpenditures, extractVarianceFacets, toChartableDataset, getDataColumnNames } from 'utilities/ChartableMetrics';
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { makeFacetComponents } from 'utilities/highcharts/FacetedBudgetActualCharts';
import { ObjectFilterContents, ActivityFilterContents, ProgramFilterContents, extractCodes } from 'app/finance/_widgets/ExpenditureFilterContents';
import HcDashboard from 'components/HcDashboard';
import MetricSettingsContents from 'app/finance/_widgets/MetricSettingsContents';
import SettingsLayout from 'app/finance/_widgets/SettingsLayout';
import Typography from '@mui/material/Typography';

import type { ColumnTable } from 'arquero';
import type { DistrictDataContentProps } from 'app/finance/_providers/DistrictDataProvider';
import type { MetricSettings } from 'app/finance/_widgets/MetricSettingsContents';

export interface ExpendituresSettings extends MetricSettings {
  selectedObjects : string[];
  selectedActivities : string[];
  selectedPrograms : string[];
};

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

function compileData(districtDataMap, allSettings, facet) {
  const allDatasets = new Array<ColumnTable>;
  let facetInfo;
  for (const expenditureSettings of allSettings) {
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
export default function ExpendituresDashboard({districtDataMap, allSettings, setAllSettings} : DistrictDataContentProps<ExpendituresSettings>) {
  const [data, facetOrder] = compileData(districtDataMap, allSettings, "activity" as const);

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
        allDatasetSettings={allSettings}
        setAllDatasetSettings={setAllSettings}
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
