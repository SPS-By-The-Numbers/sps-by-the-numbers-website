import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";

import type { EnrollmentContextSettings } from "app/finance/enrollment/EnrollmentPage";

export default function EnrollmentDeltaModeContents(props: {
  settings: EnrollmentContextSettings;
  setSettings: (x: EnrollmentContextSettings) => void;
}) {
  const { settings, setSettings } = props;
  return (
    <FormGroup sx={{ marginX: "0.5rem" }}>
      <FormControlLabel
        label="Delta Mode"
        control={
          <Switch
            checked={settings.deltaMode === true}
            size="small"
            onChange={(e) =>
              setSettings({ ...settings, deltaMode: e.target.checked })
            }
          />
        }
      />
    </FormGroup>
  );
}
