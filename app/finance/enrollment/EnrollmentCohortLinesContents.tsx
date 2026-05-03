import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";

import type { EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

export default function EnrollmentCohortLinesContents(props: {
  settings: EnrollmentContextSettings;
  setSettings: (x: EnrollmentContextSettings) => void;
}) {
  const { settings, setSettings } = props;
  return (
    <FormGroup sx={{ marginX: "0.5rem" }}>
      <FormControlLabel
        label="Cohort Lines"
        control={
          <Switch
            checked={settings.cohortLines === true}
            size="small"
            onChange={(e) =>
              setSettings({ ...settings, cohortLines: e.target.checked })
            }
          />
        }
      />
    </FormGroup>
  );
}
