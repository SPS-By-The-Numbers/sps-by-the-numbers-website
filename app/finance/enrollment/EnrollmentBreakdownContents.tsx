import SettingsSelect from "app/finance/_widgets/SettingsSelect";

import {
  ENROLLMENT_BREAKDOWN_OPTIONS,
} from "app/finance/enrollment/EnrollmentPage";

import type { EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

export default function EnrollmentBreakdownContents(props: {
  settings: EnrollmentContextSettings;
  setSettings: (x: EnrollmentContextSettings) => void;
}) {
  return (
    <SettingsSelect
      {...props}
      label="Breakdown"
      fieldName="breakdown"
      options={ENROLLMENT_BREAKDOWN_OPTIONS as Record<string, string>}
    />
  );
}
