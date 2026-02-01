"use client";

// SettingsContents render one set of values into the left panel
// defined by a SettingsLayout.  It is the glue between a Setting
// data store and the UI.

import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import type { BaseSettings } from "app/finance/_settings/base_settings";

import type { ReactNode, ComponentType } from "react";

export interface SettingsContentsProps<
  SettingsType extends BaseSettings,
  SharedSettingsType extends BaseSettings = BaseSettings,
> {
  sharedSettings: SharedSettingsType;
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;
}

export type SettingsRenderComponentType<
  SettingsType extends BaseSettings,
  SharedSettingsType extends BaseSettings = BaseSettings,
> = ComponentType<SettingsContentsProps<SettingsType, SharedSettingsType>>;

interface Props<
  SettingsType extends BaseSettings,
  SharedSettingsType extends BaseSettings,
> {
  sharedSettings: SharedSettingsType;
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;

  components: Array<SettingsRenderComponentType<SettingsType>>;
}

export abstract class MaybeContentsCondition<T extends BaseSettings> {
  abstract shouldRender(T): boolean;
}

type MaybeContentsMode = "primaryAlways" | "notPrimary";
function MaybeContents({
  settings,
  setSettings,
  conditionalField,
  Component,
  mode,
}) {
  const isPrimary = settings.id === 0;

  // Say you want to explicitly enable filters in a comparison. This is the mode for you.
  if (mode === "notPrimary") {
    if (isPrimary) {
      return undefined;
    }
  } else {
    // Say it's the primary pane and you always want to show filters.
    const forceShow = mode === "primaryAlways" && isPrimary;

    // Do conditional logic here.
    if (!forceShow && !settings[conditionalField]) {
      return undefined;
    }
  }

  return <Component settings={settings} setSettings={setSettings} />;
}

export function makeMaybeContents<
  T extends BaseSettings,
  U extends BaseSettings,
>(
  conditionalField: string,
  Component: ComponentType<Props<T, U>>,
  mode: MaybeContentsMode,
) {
  // eslint-disable-next-line react/display-name
  return ({ settings, setSettings }) => (
    <MaybeContents
      settings={settings}
      setSettings={setSettings}
      conditionalField={conditionalField}
      Component={Component}
      mode={mode}
    />
  );
}

export default function SettingsContents<
  SettingsType extends BaseSettings,
  SharedSettingsType extends BaseSettings = BaseSettings,
>({
  sharedSettings,
  settings,
  setSettings,
  components,
}: Props<SettingsType, SharedSettingsType>) {
  const allFragments = components.map((ContentFramgent, i) => (
    <ContentFramgent
      key={`comp-${i}`}
      sharedSettings={sharedSettings}
      settings={settings}
      setSettings={setSettings}
    />
  ));
  return (
    <Stack direction="column" gap="0.7rem">
      {allFragments}
    </Stack>
  );
}
