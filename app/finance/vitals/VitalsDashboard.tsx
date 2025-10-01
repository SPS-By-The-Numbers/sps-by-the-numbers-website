'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeChartableVitals } from 'app/finance/vitals/ChartableVitals';
import { makeBudgetActualsChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { useDistrictData } from '../DistrictDataProvider';
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import DistrictSelector from 'app/finance/DistrictSelector';
import SettingsLayout from 'app/finance/SettingsLayout';
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import MetricNormalizationSelector from 'app/finance/MetricNormalizationSelector';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import VitalsSettingsContents from 'app/finance/vitals/VitalsSettingsContents';

import type { BudgetActualsChartOptions } from "utilities/highcharts/ChartConfigGenerators";
import type { MetricNormalization } from 'app/finance/MetricNormalizationSelector';
import type { VitalsSettings } from 'app/finance/vitals/VitalsSettingsContents';

interface Props {
  datasetSettings: VitalsSettings;
  setDatasetSettings: (x: VitalsSettings) => void;
};

const CONNECTOR_ID = 'vitals-connector';

function makeCell(renderTo, ccddd, metricColumnRoot, title, yValueFormat, yLabel ?: string) {
    return {
      renderTo,
      title,
      metricColumn: `${ccddd}_${metricColumnRoot}`,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',
      xValueFormat: 'year' as const,

      yValueFormat,
      yLabel,
    };
}

function makeBudgetActualsChartOptions(idPrefix, ccddd, metricNormalization) : Array<BudgetActualsChartOptions> {
  let compFormat = 'currency'

  if (metricNormalization === 'pctcomp' || metricNormalization === 'pctexp' || metricNormalization === 'pctrev') {
    compFormat = metricNormalization;
  }
  return [
    makeCell(`${idPrefix}-enrollment-chart`, ccddd, 'amount_enrollment', 'Enrollment', 'decimal', 'AFTE'),
    makeCell(`${idPrefix}-staffing-chart`, ccddd, 'amount_staffFte', 'Staffing FTE', 'decimal', 'FTE'),
    {...makeCell(`${idPrefix}-cashflow-chart`, ccddd, `${metricNormalization}_cashflow`, 'Cashflow', compFormat),
     yValueShowNegative: true},
    makeCell(`${idPrefix}-beginning-balance-chart`, ccddd, `${metricNormalization}_beginningBalance`, 'Beginning Balance', compFormat),
    makeCell(`${idPrefix}-teaching-related-comp`, ccddd, `${metricNormalization}_teachingComp`, 'Teaching Related Comp', compFormat),
    makeCell(`${idPrefix}-student-support-comp`, ccddd, `${metricNormalization}_studentSupportComp`, 'Student Support Comp', compFormat),
    makeCell(`${idPrefix}-building-support-comp`, ccddd, `${metricNormalization}_buildingSupportComp`, 'Buildling Support Comp', compFormat),
    makeCell(`${idPrefix}-other-comp`, ccddd, `${metricNormalization}_otherComp`, 'Other Comp', compFormat),
  ];
}

function componentsGenerator(vitalsSettings : VitalsSettings) {
  const budgetActualsChartOptions = makeBudgetActualsChartOptions(
    vitalsSettings.id,
    vitalsSettings.ccddd,
    vitalsSettings.metricNormalization
  );
  return budgetActualsChartOptions.map(c => makeBudgetActualsChartConfig(c));
}

export default function VitalsDashboard() {
  const {districtDataMap, loadCcddd} = useDistrictData();
  const searchParams = useSearchParams();
  const [allVitalsSettings, setAllVitalsSettings] = useState<Array<VitalsSettings>>([
    {
      name: 'SPS',
      id: 'foo',
      ccddd: 17001,
      metricNormalization: 'pctcomp' as const,
    },
    {
      name: 'SPS',
      id: 'foo2',
      ccddd: 17001,
      metricNormalization: 'amount' as const,
    },
  ]);

  const result = makeDatasetFacetedDashboard(allVitalsSettings, componentsGenerator);
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const {components, gui} = result;

  // TODO: Pull this into a component.
  useEffect(
    () => { 
      for (const settings of allVitalsSettings) {
        loadCcddd(settings.ccddd);
      }
    },
    [allVitalsSettings, loadCcddd]);

  for (const vitalsSettings of allVitalsSettings) {
    if (!(vitalsSettings.ccddd in districtDataMap)) {
      return <Loading text="Loading dataset..." />
    }
  }

  const data = makeChartableVitals(districtDataMap, allVitalsSettings);

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
        allDatasetSettings={allVitalsSettings}
        setAllDatasetSettings={setAllVitalsSettings}
        SettingsRenderComponent={VitalsSettingsContents}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Vitals Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
