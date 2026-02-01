import type { BaseSettings } from "app/finance/_settings/base_settings";

export interface CommonContextSettings extends BaseSettings {}

export const DEFAULT_COMMON_CONTEXT_SETTINGS: CommonContextSettings = {
  name: "Dashboard Settings",
  id: -1,
};

// URL-safe seralization of the settings.
export function serializeCommonContextSettings(settings: CommonContextSettings) {
  // No common shared settings so default to nothing
  return "";
}

// deserize settings from URL string.
export function queryToCommonContextSettings(seralized: string) {
  // No common shared settings so return default.
  return DEFAULT_COMMON_CONTEXT_SETTINGS;
}
