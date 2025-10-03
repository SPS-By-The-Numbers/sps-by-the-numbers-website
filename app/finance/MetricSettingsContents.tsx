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

export function getCurrencyNomralizations(allMetricSettings: Array<MetricSettings>) {
  // Some settings can be repeated. Naively joining through those will misname
  // the columns and add duplicates. Generate a unique list of settings makes
  // generating data next easier.
  const currencyNormalizations = new Map<number, Set<CurrencyNormalization>>;
  for (const metricSettings of allMetricSettings) {
    if (!currencyNormalizations.has(metricSettings.ccddd)) {
      currencyNormalizations.set(metricSettings.ccddd, new Set<CurrencyNormalization>);
    }
    const x = currencyNormalizations.get(metricSettings.ccddd);

    // TODO: This is ugly. There's gotta be a typesafe way to do this.
    // Make typescript shutup.
    if (x !== undefined) {
      x.add(metricSettings.currencyNormalization);
    }
  }
  return currencyNormalizations;
}

export function getStaffingNomralizations(allMetricSettings: Array<MetricSettings>) {
  // Some settings can be repeated. Naively joining through those will misname
  // the columns and add duplicates. Generate a unique list of settings makes
  // generating data next easier.
  const staffingNormalizations = new Map<number, Set<StaffingNormalization>>;
  for (const metricSettings of allMetricSettings) {
    if (!staffingNormalizations.has(metricSettings.ccddd)) {
      staffingNormalizations.set(metricSettings.ccddd, new Set<StaffingNormalization>);
    }
    const x = staffingNormalizations.get(metricSettings.ccddd);

    // TODO: This is ugly. There's gotta be a typesafe way to do this.
    // Make typescript shutup.
    if (x !== undefined) {
      x.add(metricSettings.staffingNormalization);
    }
  }
  return staffingNormalizations;
}

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
