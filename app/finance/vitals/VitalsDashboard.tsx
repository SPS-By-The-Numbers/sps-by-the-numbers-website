'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeChartableVitals } from 'utilities/ChartableMetrics';
import { makeBudgetActualsChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { useDistrictData } from '../DistrictDataProvider';
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react';
import DistrictSelector from 'app/finance/DistrictSelector';
import SettingsLayout from 'app/finance/SettingsLayout';
import HcDashboard from 'components/HcDashboard';
import Loading from 'components/Loading';
import MetricVariantSelector from 'app/finance/MetricVariantSelector';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import VitalsSettingsContents from 'app/finance/vitals/VitalsSettingsContents';

import type { BudgetActualsChartOptions } from "utilities/highcharts/ChartConfigGenerators";
import type { MetricVariant } from 'app/finance/MetricVariantSelector';
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

function makeBudgetActualsChartOptions(idPrefix, ccddd, metricVariant) : Array<BudgetActualsChartOptions> {
  let compFormat = 'currency'

  if (metricVariant === 'pctcomp') {
    compFormat = 'pctcomp'
  }
  return [
    makeCell(`${idPrefix}-enrollment-chart`, ccddd, 'enrollment', 'Enrollment', 'decimal', 'AFTE'),
    makeCell(`${idPrefix}-staffing-chart`, ccddd, 'amount_staff_fte', 'Staffing FTE', 'decimal', 'FTE'),
    makeCell(`${idPrefix}-cashflow-chart`, ccddd, 'cashflow', 'Cashflow', 'currency', '$'),
    makeCell(`${idPrefix}-beginning-balance-chart`, ccddd, 'beginning_balance', 'Beginning Balance', 'currency'),
    makeCell(`${idPrefix}-teaching-related-comp`, ccddd, 'teachingComp', 'Teaching Related Comp', compFormat),
    makeCell(`${idPrefix}-student-support-comp`, ccddd, 'studentSupportComp', 'Student Support Comp', compFormat),
    makeCell(`${idPrefix}-building-support-comp`, ccddd, 'buildingSupportComp', 'Buildling Support Comp', compFormat),
    makeCell(`${idPrefix}-other-comp`, ccddd, 'otherComp', 'Other Comp', compFormat),
  ];
}

function componentsGenerator(vitalsSettings : VitalsSettings) {
  const budgetActualsChartOptions = makeBudgetActualsChartOptions(
    vitalsSettings.id,
    vitalsSettings.ccddd,
    vitalsSettings.metricVariant
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
      metricVariant: 'pctcomp' as const,
    }]
                                                                                   );
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

  const districtData = districtDataMap[allVitalsSettings[0].ccddd];
  if (!districtData) {
    return <Loading text="Loading dataset..." />
  }

  const data = makeChartableVitals(
    allVitalsSettings[0].ccddd,
    districtData.enrollmentSummary(),
    districtData.staffingSummary(),
    districtData.balances(),
    districtData.compensation(allVitalsSettings[0].metricVariant),
  );

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
