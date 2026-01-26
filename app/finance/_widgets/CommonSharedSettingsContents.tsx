import type { BaseSettings } from "app/finance/_settings/base_settings";

export interface CommonSharedSettings extends BaseSettings {}

export const DEFAULT_COMMON_SHARED_SETTINGS: CommonSharedSettings = {
  name: "Dashboard Settings",
  id: -1,
};

// URL-safe seralization of the settings.
export function serializeCommonSharedSettings(settings: CommonSharedSettings) {
  // No common shared settings so default to nothing
  return "";
}

// deserize settings from URL string.
export function queryToCommonSharedSettings(seralized: string) {
  // No common shared settings so return default.
  return DEFAULT_COMMON_SHARED_SETTINGS;
}
