import SettingsSelect from "app/finance/_widgets/SettingsSelect";

import {
  ENROLLMENT_X_AXIS_OPTIONS,
} from "app/finance/enrollment/EnrollmentPage";

import type { EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

export default function EnrollmentXAxisContents(props: {
  settings: EnrollmentContextSettings;
  setSettings: (x: EnrollmentContextSettings) => void;
}) {
  return (
    <SettingsSelect
      {...props}
      label="X Axis"
      fieldName="xAxis"
      options={ENROLLMENT_X_AXIS_OPTIONS as Record<string, string>}
    />
  );
}
