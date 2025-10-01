import DistrictSelector from 'app/finance/DistrictSelector';
import MetricNormalizationSelector from 'app/finance/MetricNormalizationSelector';
import Stack from '@mui/material/Stack';

import type { MetricNormalization } from 'app/finance/MetricNormalizationSelector';
import type { DatasetSettings } from 'app/finance/SettingsLayout';

export interface VitalsSettings extends DatasetSettings {
  ccddd: number;
  metricNormalization: MetricNormalization;
};

export default function VitalsSettingsContents({datasetSettings, setDatasetSettings} : {datasetSettings: VitalsSettings, setDatasetSettings: (x: VitalsSettings) => void}) {
  return (
    <Stack gap="0.5rem">
      <DistrictSelector
        ccddd={datasetSettings.ccddd}
        onChange={(ccddd) => setDatasetSettings(Object.assign({}, datasetSettings, {ccddd}))}
      />
      <MetricNormalizationSelector
        label={`Money Normalization`}
        normalization={datasetSettings.metricNormalization}
        onChange={(metricNormalization) => setDatasetSettings(Object.assign({}, datasetSettings, {metricNormalization}))}
      />
    </Stack>
  );
}

