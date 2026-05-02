import SettingsSelect from "app/finance/_widgets/SettingsSelect";

import {
  ENROLLMENT_MODE_OPTIONS,
} from "app/finance/enrollment/EnrollmentPage";

import type { EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

export default function EnrollmentModeContents(props: {
  settings: EnrollmentContextSettings;
  setSettings: (x: EnrollmentContextSettings) => void;
}) {
  return (
    <SettingsSelect
      {...props}
      label="Mode"
      fieldName="mode"
      options={ENROLLMENT_MODE_OPTIONS as Record<string, string>}
    />
  );
}
