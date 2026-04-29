import SettingsSelect from "app/finance/_widgets/SettingsSelect";

import type { AssessmentContextSettings } from "app/finance/assessments/AssessmentPage";

const DISCLOSURE_AVOIDANCE_OPTIONS = {
  best_guess: "Best Guess",
  drop: "Drop",
};

export default function DisclosureAvoidanceContents(props: {
  settings: AssessmentContextSettings;
  setSettings: (x: AssessmentContextSettings) => void;
}) {
  return (
    <SettingsSelect
      {...props}
      label="Disclosure Avoidance"
      fieldName="disclosureAvoidance"
      options={DISCLOSURE_AVOIDANCE_OPTIONS}
    />
  );
}
