export interface BaseSettings {
  name: string;
  id: number;
}

export const DUMMY_BASE_SETTINGS : BaseSettings = {
  name: "unused",
  id: -100,
};

export type SettingsSerializer<
  SettingsType extends BaseSettings,
  SharedSettingsType extends BaseSettings,
> = {
  serialize(allSettings: Array<SettingsType>): Array<string>;
  serializeShared(sharedSettings: SharedSettingsType): string;
};

export type SettingsDeserializer<
  SettingsType extends BaseSettings,
  SharedSettingsType extends BaseSettings,
> = {
  deserialize(params: Array<string>) :  Array<SettingsType>;
  deserializeShared(params: Array<string>) : SharedSettingsType;
};
