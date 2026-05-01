import SettingsSelect from "app/finance/_widgets/SettingsSelect";

import {
  ENROLLMENT_STUDENT_GROUP_OPTIONS,
} from "app/finance/enrollment/EnrollmentPage";

import type { EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

export default function EnrollmentStudentGroupContents(props: {
  settings: EnrollmentContextSettings;
  setSettings: (x: EnrollmentContextSettings) => void;
}) {
  return (
    <SettingsSelect
      {...props}
      label="Student Group"
      fieldName="studentGroup"
      options={ENROLLMENT_STUDENT_GROUP_OPTIONS}
    />
  );
}
