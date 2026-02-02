import { deserializeByConfig } from "app/finance/_settings/common_settings";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { SettingsConfigGenerators } from "app/finance/_settings/common_settings";

export type CommonContextSettings = BaseSettings;

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

export function deserializeContextSettings<ContextSettingsType extends BaseSettings>(
  queries: Array<string>,
  defaultContextSettings: ContextSettingsType,
  configGenerators: SettingsConfigGenerators
) : ContextSettingsType {
  if (queries.length === 0) {
    return defaultContextSettings;
  }
  // Only use the first parameter for the context settings if there are repeats.
  const firstQuery = queries[0];

  // Make settings.
  let settings = Object.assign({}, defaultContextSettings);

  // Run through each config in order.
  for (const geneator of configGenerators) {
    settings = deserializeByConfig(settings, geneator(settings), firstQuery);
  }

  // Stamp an invalid id for the context.
  settings.id = -1;

  return settings;
}
