import Stack from '@mui/material/Stack';

import type { ReactNode, ComponentType } from 'react';

export interface DatasetSettings {
  name: string;
  id: string;
};

export interface SettingsContentsProps<SettingsType extends DatasetSettings> {
  datasetSettings: SettingsType;
  setDatasetSettings: (x: SettingsType) => void;
};

export type SettingsRenderComponentType<SettingsType extends DatasetSettings> = ComponentType<SettingsContentsProps<SettingsType>>;

interface Props<SettingsType extends DatasetSettings> {
  datasetSettings: SettingsType;
  setDatasetSettings: (x: SettingsType) => void;
  components: Array<SettingsRenderComponentType<SettingsType>>;
};

export default function SettingsContents<SettingsType extends DatasetSettings>(
    {datasetSettings, setDatasetSettings, components} : Props<SettingsType>) {
  const allFragments = components.map((C, i) => (
        <C key={`comp-${i}`}datasetSettings={datasetSettings} setDatasetSettings={setDatasetSettings} />
  ));
  return (
    <Stack gap="0.4rem">
      {allFragments}
    </Stack>
  );
}
