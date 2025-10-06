'use client';

import { dfToJSONConnectorOptions } from 'utilities/highcharts/utils';
import { makeChartableVitals } from 'app/finance/vitals/ChartableVitals';
import { makeBudgetActualsChartConfig } from "utilities/highcharts/ChartConfigGenerators";
import { makeDatasetFacetedDashboard } from "utilities/highcharts/FacetedDashboard";
import { useSearchParams } from 'next/navigation'
import SettingsLayout from 'app/finance/_widgets/SettingsLayout';
import HcDashboard from 'components/HcDashboard';
import Typography from '@mui/material/Typography';
import MetricSettingsContents from 'app/finance/_widgets/MetricSettingsContents';

import type { BudgetActualsChartOptions, ValueFormat } from "utilities/highcharts/ChartConfigGenerators";
import type { DistrictDataContentProps } from 'app/finance/_providers/DistrictDataProvider';
import type { MetricSettings } from 'app/finance/_widgets/MetricSettingsContents';

export interface VitalsSettings extends MetricSettings {
};

const CONNECTOR_ID = 'vitals-connector';

function makeCell(renderTo, metricColumn, title, yValueFormat, yLabel ?: string) {
    return {
      renderTo,
      title,
      metricColumn,
      connectorId: CONNECTOR_ID,
      xDataColumn: 'class_of',
      xValueFormat: 'year' as const,

      yValueFormat,
      yLabel,
    };
}

function makeBudgetActualsChartOptions(idPrefix, currencyNormalization, staffingNormalization) : Array<BudgetActualsChartOptions> {
  const currencyFormat : ValueFormat = currencyNormalization === 'amount' ? 'currency' as const : currencyNormalization;

  return [
    makeCell(`${idPrefix}-enrollment-chart`,
             `${idPrefix}_amount_enrollment`,
             'Enrollment',
             'fte' as const,
             'AFTE'),
    makeCell(`${idPrefix}-staffing-chart`,
             `${idPrefix}_${staffingNormalization}_staffFte`,
             'Staffing FTE',
             staffingNormalization),
    {...makeCell(`${idPrefix}-cashflow-chart`,
                 `${idPrefix}_${currencyNormalization}_cashflow`,
                 'Cashflow',
                 currencyFormat),
      yValueShowNegative: true},
    makeCell(`${idPrefix}-beginning-balance-chart`,
             `${idPrefix}_${currencyNormalization}_beginningBalance`,
             'Beginning Balance',
             currencyFormat),
    makeCell(`${idPrefix}-teaching-related-comp`,
             `${idPrefix}_${currencyNormalization}_teachingComp`,
             'Teaching Related Comp',
             currencyFormat),
    makeCell(`${idPrefix}-student-support-comp`,
             `${idPrefix}_${currencyNormalization}_studentSupportComp`,
             'Student Support Comp',
             currencyFormat),
    makeCell(`${idPrefix}-building-support-comp`,
             `${idPrefix}_${currencyNormalization}_buildingSupportComp`,
             'Buildling Support Comp',
             currencyFormat),
    makeCell(`${idPrefix}-other-comp`,
             `${idPrefix}_${currencyNormalization}_otherComp`,
             'Other Comp',
             currencyFormat),
  ];
}

function componentsGenerator(vitalsSettings : VitalsSettings) {
  const budgetActualsChartOptions = makeBudgetActualsChartOptions(
    vitalsSettings.id,
    vitalsSettings.currencyNormalization,
    vitalsSettings.staffingNormalization
  );
  return budgetActualsChartOptions.map(c => makeBudgetActualsChartConfig(c));
}

export default function VitalsDashboard({districtDataMap, allSettings, setAllSettings} : DistrictDataContentProps<VitalsSettings>) {
  const searchParams = useSearchParams();

  const result = makeDatasetFacetedDashboard(allSettings, componentsGenerator);
  if (result === undefined) {
    return <div>No Datasets defined.</div>;
  }
  const {components, gui} = result;

  const data = makeChartableVitals(districtDataMap, allSettings);

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
        allDatasetSettings={allSettings}
        setAllDatasetSettings={setAllSettings}
        settingsContentsComponents={[MetricSettingsContents]}
    >
      <Typography className="analysis-title" component="h1" variant="h1">
        Vitals Dashboard
      </Typography>
      <HcDashboard config={config} />
    </SettingsLayout>
  );
}
