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
import CurrencyNormalizationSelector from 'app/finance/CurrencyNormalizationSelector';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MetricSettingsContents, { DEFAULT_METRIC_SETTINGS } from 'app/finance/MetricSettingsContents';

import type { BudgetActualsChartOptions } from "utilities/highcharts/ChartConfigGenerators";
import type { MetricSettings } from 'app/finance/MetricSettingsContents';

export interface VitalsSettings extends MetricSettings {
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

function makeBudgetActualsChartOptions(idPrefix, ccddd, currencyNormalization) : Array<BudgetActualsChartOptions> {
  let compFormat = 'currency'

  if (currencyNormalization === 'pctcomp' || currencyNormalization === 'pctexp' || currencyNormalization === 'pctrev') {
    compFormat = currencyNormalization;
  }
  return [
    makeCell(`${idPrefix}-enrollment-chart`, ccddd, 'amount_enrollment', 'Enrollment', 'decimal', 'AFTE'),
    makeCell(`${idPrefix}-staffing-chart`, ccddd, 'amount_staffFte', 'Staffing FTE', 'decimal', 'FTE'),
    {...makeCell(`${idPrefix}-cashflow-chart`, ccddd, `${currencyNormalization}_cashflow`, 'Cashflow', compFormat),
     yValueShowNegative: true},
    makeCell(`${idPrefix}-beginning-balance-chart`, ccddd, `${currencyNormalization}_beginningBalance`, 'Beginning Balance', compFormat),
    makeCell(`${idPrefix}-teaching-related-comp`, ccddd, `${currencyNormalization}_teachingComp`, 'Teaching Related Comp', compFormat),
    makeCell(`${idPrefix}-student-support-comp`, ccddd, `${currencyNormalization}_studentSupportComp`, 'Student Support Comp', compFormat),
    makeCell(`${idPrefix}-building-support-comp`, ccddd, `${currencyNormalization}_buildingSupportComp`, 'Buildling Support Comp', compFormat),
    makeCell(`${idPrefix}-other-comp`, ccddd, `${currencyNormalization}_otherComp`, 'Other Comp', compFormat),
  ];
}

function componentsGenerator(vitalsSettings : VitalsSettings) {
  const budgetActualsChartOptions = makeBudgetActualsChartOptions(
    vitalsSettings.id,
    vitalsSettings.ccddd,
    vitalsSettings.currencyNormalization
  );
  return budgetActualsChartOptions.map(c => makeBudgetActualsChartConfig(c));
}

export default function VitalsDashboard() {
  const {districtDataMap, loadCcddd} = useDistrictData();
  const searchParams = useSearchParams();
  const [allVitalsSettings, setAllVitalsSettings] = useState<Array<VitalsSettings>>(DEFAULT_METRIC_SETTINGS);

  // TODO: Pull this into a component.
  useEffect(
    () => { 
      for (const settings of allVitalsSettings) {
        loadCcddd(settings.ccddd);
      }
    },
    [allVitalsSettings, loadCcddd]);

  const result = makeDatasetFacetedDashboard(allVitalsSettings, componentsGenerator);
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const {components, gui} = result;

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
          options: data ? dfToJSONConnectorOptions(data) : undefined,
        },
      ],
    },
  });


  return (
    <SettingsLayout
        allDatasetSettings={allVitalsSettings}
        setAllDatasetSettings={setAllVitalsSettings}
        settingsContentsComponents={[MetricSettingsContents]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Vitals Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
