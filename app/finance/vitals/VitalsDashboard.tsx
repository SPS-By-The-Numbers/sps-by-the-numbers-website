'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeChartableVitals } from 'utilities/ChartableMetrics';
import { makeBudgetActualsChartConfig } from "utilities/highcharts/ChartConfigGenerators";
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

import type { BudgetActualsChartOptions } from "utilities/highcharts/ChartConfigGenerators";
import type { MetricVariant } from 'app/finance/MetricVariantSelector';
import type { DatasetSettings } from 'app/finance/SettingsLayout';


interface VitalsSettings extends DatasetSettings {
  ccddd: number;
  metricVariant: MetricVariant;
};

function VitalsSettingsPanel({datasetSettings, setDatasetSettings} : {datasetSettings: VitalsSettings, setDatasetSettings: (x: VitalsSettings) => void}) {
  return (
    <div>
      {datasetSettings.ccddd}
    </div>
  );
}

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

function makeBudgetActualsChartOptions(ccddd, metricVariant) : Array<BudgetActualsChartOptions> {
  let compFormat = 'currency'

  if (metricVariant === 'pctcomp') {
    compFormat = 'pctcomp'
  }
  return [
    makeCell('enrollment-chart', ccddd, 'enrollment', 'Enrollment', 'decimal', 'AFTE'),
    makeCell('staffing-chart', ccddd, 'amount_staff_fte', 'Staffing FTE', 'decimal', 'FTE'),
    makeCell('cashflow-chart', ccddd, 'cashflow', 'Cashflow', 'currency', '$'),
    makeCell('beginning-balance-chart', ccddd, 'beginning_balance', 'Beginning Balance', 'currency'),
    makeCell('teaching-related-comp', ccddd, 'teachingComp', 'Teaching Related Comp', compFormat),
    makeCell('student-support-comp', ccddd, 'studentSupportComp', 'Student Support Comp', compFormat),
    makeCell('building-support-comp', ccddd, 'buildingSupportComp', 'Buildling Support Comp', compFormat),
    makeCell('other-comp', ccddd, 'otherComp', 'Other Comp', compFormat),
  ];
}

export default function VitalsDashboard() {
  const { districtDataMap, loadCcddd } = useDistrictData();
  const searchParams = useSearchParams();
  const [allVitalsSettings, setAllVitalsSettings] = useState<Array<VitalsSettings>>([
    {
      name: 'SPS',
      id: 'foo',
      ccddd: 17001,
      metricVariant: 'pctcomp' as const,
    }]
                                                                                   );
  const [metricVariant, setMetricVariant] = useState<MetricVariant>('pctcomp' as const);
  const [ccddd, setCcddd] = useState<number>(parseInt(searchParams.get('ccddd') ?? '17001'));

  const budgetActualsChartOptions = makeBudgetActualsChartOptions(ccddd, metricVariant);
  const components = budgetActualsChartOptions.map(c => makeBudgetActualsChartConfig(c));
  const gui = { layouts: [{rows: [
    { cells: [{id: 'enrollment-chart'}, {id: 'staffing-chart'}]},
    { cells: [{id: 'cashflow-chart'}, {id: 'beginning-balance-chart'}]},
    { cells: [{id: 'teaching-related-comp'}, {id: 'student-support-comp'}]},
    { cells: [{id: 'building-support-comp'}, {id: 'other-comp'}]},
    ]}]};


  // TODO: Pull this into a component.
  useEffect(
    () => { loadCcddd(ccddd); },
    [ccddd, loadCcddd]);

  if (!(ccddd in districtDataMap)) {
    return <Loading text="Loading dataset..." />
  }

  const districtData = districtDataMap[ccddd];
  const data = makeChartableVitals(
    ccddd,
    districtData.enrollmentSummary(),
    districtData.staffingSummary(),
    districtData.balances(),
    districtData.compensation(metricVariant),
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
        SettingsRenderComponent={VitalsSettingsPanel}
    >
      <Stack>
        <DistrictSelector
          ccddd={ccddd}
          onChange={(selection) => setCcddd(selection)}
        />
        <MetricVariantSelector
          label={`Key Expenditure Unit`}
          variant={metricVariant}
          onChange={newValue => setMetricVariant(newValue)}
        />
      </Stack>

      <Typography className="analysis-title" component="h1" variant="h1">
        Vitals Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
