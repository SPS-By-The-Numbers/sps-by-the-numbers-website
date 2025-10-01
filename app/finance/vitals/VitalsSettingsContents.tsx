import DistrictSelector from 'app/finance/DistrictSelector';
import MetricVariantSelector from 'app/finance/MetricVariantSelector';
import Stack from '@mui/material/Stack';

import type { MetricVariant } from 'app/finance/MetricVariantSelector';
import type { DatasetSettings } from 'app/finance/SettingsLayout';

export interface VitalsSettings extends DatasetSettings {
  ccddd: number;
  metricVariant: MetricVariant;
};

export default function VitalsSettingsContents({datasetSettings, setDatasetSettings} : {datasetSettings: VitalsSettings, setDatasetSettings: (x: VitalsSettings) => void}) {
  return (
    <Stack gap="0.5rem">
      <DistrictSelector
        ccddd={datasetSettings.ccddd}
        onChange={(ccddd) => setDatasetSettings(Object.assign({}, datasetSettings, {ccddd}))}
      />
      <MetricVariantSelector
        label={`Money Normalization`}
        variant={datasetSettings.metricVariant}
        onChange={(metricVariant) => setDatasetSettings(Object.assign({}, datasetSettings, {metricVariant}))}
      />
    </Stack>
  );
}

