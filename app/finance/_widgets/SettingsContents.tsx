import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

import type { ReactNode, ComponentType } from 'react';

export interface BaseSettings {
  name: string;
  id: string;
};

export interface SettingsContentsProps<SettingsType extends BaseSettings, SharedSettingsType extends BaseSettings=BaseSettings> {
  sharedSettings: SharedSettingsType;
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;
};

export type SettingsRenderComponentType<SettingsType extends BaseSettings, SharedSettingsType extends BaseSettings = BaseSettings> = ComponentType<SettingsContentsProps<SettingsType, SharedSettingsType>>;

interface Props<SettingsType extends BaseSettings, SharedSettingsType extends BaseSettings> {
  sharedSettings: SharedSettingsType;
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;

  components: Array<SettingsRenderComponentType<SettingsType>>;
};

export default function SettingsContents<SettingsType extends BaseSettings, SharedSettingsType extends BaseSettings = BaseSettings>(
    {sharedSettings, settings, setSettings, components} : Props<SettingsType, SharedSettingsType>) {
  const allFragments = components.map((ContentFramgent, i) => (
      <ContentFramgent key={`comp-${i}`}
          sharedSettings={sharedSettings}
          settings={settings}
          setSettings={setSettings} />
  ));
  return (
    <Stack direction="column" gap="0.9rem">
      {allFragments}
    </Stack>
  );
}
