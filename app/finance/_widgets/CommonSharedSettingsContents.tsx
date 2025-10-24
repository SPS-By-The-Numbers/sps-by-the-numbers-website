
import type { BaseSettings } from 'app/finance/_widgets/SettingsContents';

export interface CommonSharedSettings extends BaseSettings {
};

export const DEFAULT_COMMON_SHARED_SETTINGS : CommonSharedSettings = {
  name: "Dashboard Settings",
  id: "dashboard-settings",
};
