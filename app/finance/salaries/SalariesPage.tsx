"use client";

// Deserializes the settings drawer's URL state and hands it to the dashboard.
//
// This is EnsureDistrictData's job on the other finance dashboards, but this
// page does not read DistrictData at all -- it fetches the one per-employee
// dataset it needs itself. Going through EnsureDistrictData would block the
// first paint on ten datasets nothing here looks at.

import { useSearchParams } from "next/navigation";

import { deserializeDatasetSettings } from "app/finance/_settings/common_settings";
import { deserializeContextSettings } from "app/finance/_settings/common_context_settings";

import SalariesDashboard from "./SalariesDashboard";
import {
  DEFAULT_SALARIES_CONTEXT_SETTINGS,
  DEFAULT_SALARIES_SETTINGS,
  SERIALIZE_SALARIES_CONTEXT_SETTINGS_GENERATORS,
  SERIALIZE_SALARIES_SETTINGS_GENERATORS,
} from "./settings";

export default function SalariesPage() {
  const searchParams = useSearchParams();

  const allSettings = deserializeDatasetSettings(
    searchParams.getAll("d"),
    DEFAULT_SALARIES_SETTINGS,
    SERIALIZE_SALARIES_SETTINGS_GENERATORS,
  );

  const contextSettings = deserializeContextSettings(
    searchParams.getAll("c"),
    DEFAULT_SALARIES_CONTEXT_SETTINGS,
    SERIALIZE_SALARIES_CONTEXT_SETTINGS_GENERATORS,
  );

  return (
    <SalariesDashboard
      allSettings={allSettings}
      contextSettings={contextSettings}
    />
  );
}
