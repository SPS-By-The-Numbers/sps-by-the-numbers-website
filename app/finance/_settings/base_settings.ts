export type BaseSettings = {
  name: string;
  id: number;
};

export const DUMMY_BASE_SETTINGS : BaseSettings = {
  name: "unused",
  id: -100,
};

export type SettingsSerializer<
  SettingsType extends BaseSettings,
  ContextSettingsType extends BaseSettings,
> = {
  serialize(allSettings: Array<SettingsType>): Array<string>;
  serializeContext(contextSettings: ContextSettingsType): string;
};

export type SettingsDeserializer<
  SettingsType extends BaseSettings,
  ContextSettingsType extends BaseSettings,
> = {
  deserialize(params: Array<string>) :  Array<SettingsType>;
  deserializeContext(params: Array<string>) : ContextSettingsType;
};

export function serializeSettings<SettingsType extends BaseSettings>(
  allSettings: Array<SettingsType>,
  serialize: (setting: SettingsType) => string
): Array<string> {
  const result = new Array<string>();
  for (const setting of allSettings) {
    result.push(serialize(setting));
  }
  return result;
}

export function deserializeSettings<SettingsType extends BaseSettings>(
  queries: Array<string>,
  defaultSettings: Array<SettingsType>,
  deserialize: (defaultSetting: SettingsType, serialized: string) => SettingsType
) {
  if (queries.length === 0) {
    return defaultSettings;
  }

  const allSettings = new Array<SettingsType>();
  for (let i = 0; i < queries.length; i++) {
    const newSettings = deserialize(defaultSettings[0], queries[i]);
    newSettings.id = i;
    allSettings.push(newSettings);
  }
  return allSettings;
}

