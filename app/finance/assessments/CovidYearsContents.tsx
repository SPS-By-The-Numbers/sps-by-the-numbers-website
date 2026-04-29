import SettingsSelect from "app/finance/_widgets/SettingsSelect";

import type { AssessmentContextSettings } from "app/finance/assessments/AssessmentPage";

const COVID_YEARS_OPTIONS = {
  exclude: "Exclude",
  include: "Include",
};

export default function CovidYearsContents(props: {
  settings: AssessmentContextSettings;
  setSettings: (x: AssessmentContextSettings) => void;
}) {
  return (
    <SettingsSelect
      {...props}
      label="Covid Years"
      fieldName="covidYears"
      options={COVID_YEARS_OPTIONS}
    />
  );
}
