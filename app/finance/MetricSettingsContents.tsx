import DistrictSelector from 'app/finance/DistrictSelector';
import CurrencyNormalizationSelector from 'app/finance/CurrencyNormalizationSelector';
import StaffingNormalizationSelector from 'app/finance/StaffingNormalizationSelector';

import type { CurrencyNormalization, StaffingNormalization } from 'utilities/ChartableMetrics';
import type { DatasetSettings } from 'app/finance/SettingsContents';

export interface MetricSettings extends DatasetSettings {
  ccddd: number;
  currencyNormalization: CurrencyNormalization;
  staffingNormalization: StaffingNormalization;
};

export const DEFAULT_METRIC_SETTINGS : Array<MetricSettings> = [
  {
    name: 'SPS',
    id: 'ms1',
    ccddd: 17001,
    currencyNormalization: 'pctcomp' as const,
    staffingNormalization: 'pctfte' as const,
  },
  {
    name: 'SPS',
    id: 'ms2',
    ccddd: 17001,
    currencyNormalization: 'amount' as const,
    staffingNormalization: 'amount' as const,
  },
];

export default function MetricSettingsContents({datasetSettings, setDatasetSettings} : {datasetSettings: MetricSettings, setDatasetSettings: (x: MetricSettings) => void}) {
  return (
    <>
      <DistrictSelector
        ccddd={datasetSettings.ccddd}
        onChange={(ccddd) => setDatasetSettings(Object.assign({}, datasetSettings, {ccddd}))}
      />
      <CurrencyNormalizationSelector
        label={`Money Normalization`}
        normalization={datasetSettings.currencyNormalization}
        onChange={(currencyNormalization) => setDatasetSettings(
            Object.assign({}, datasetSettings, {currencyNormalization}))}
      />
      <StaffingNormalizationSelector
        label={`Staffing Normalization`}
        normalization={datasetSettings.staffingNormalization}
        onChange={(staffingNormalization) => setDatasetSettings(
            Object.assign({}, datasetSettings, {staffingNormalization}))}
      />
    </>
  );
}

