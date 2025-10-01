import DistrictSelector from 'app/finance/DistrictSelector';
import CurrencyNormalizationSelector from 'app/finance/CurrencyNormalizationSelector';
import Stack from '@mui/material/Stack';

import type { CurrencyNormalization } from 'app/finance/VitalsSettings';
import type { DatasetSettings } from 'app/finance/SettingsLayout';

export interface VitalsSettings extends DatasetSettings {
  ccddd: number;
  currencyNormalization: CurrencyNormalization;
};

export default function VitalsSettingsContents({datasetSettings, setDatasetSettings} : {datasetSettings: VitalsSettings, setDatasetSettings: (x: VitalsSettings) => void}) {
  return (
    <Stack gap="0.5rem">
      <DistrictSelector
        ccddd={datasetSettings.ccddd}
        onChange={(ccddd) => setDatasetSettings(Object.assign({}, datasetSettings, {ccddd}))}
      />
      <CurrencyNormalizationSelector
        label={`Money Normalization`}
        normalization={datasetSettings.currencyNormalization}
        onChange={(currencyNormalization) => setDatasetSettings(Object.assign({}, datasetSettings, {currencyNormalization}))}
      />
    </Stack>
  );
}

