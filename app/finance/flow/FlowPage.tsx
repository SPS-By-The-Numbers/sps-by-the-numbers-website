"use client";

import { DEFAULT_COMMON_CONTEXT_SETTINGS } from "app/finance/_settings/common_context_settings";
import {
  DEFAULT_FLOW_SETTINGS,
  SERIALIZE_FLOW_SETTINGS_GENERATORS,
} from "./FlowSettings";
import { EnsureDistrictData } from "app/finance/_providers/DistrictDataProvider";
import FlowDashboard from "./FlowDashboard";

export default function FlowPage() {
  return (
    <EnsureDistrictData
      defaultAllSettings={DEFAULT_FLOW_SETTINGS}
      allSettingsConfigGenerators={SERIALIZE_FLOW_SETTINGS_GENERATORS}
      defaultContextSettings={DEFAULT_COMMON_CONTEXT_SETTINGS}
      contextSettingsConfigGenerators={[]}
      ContentComponent={FlowDashboard}
    />
  );
}
