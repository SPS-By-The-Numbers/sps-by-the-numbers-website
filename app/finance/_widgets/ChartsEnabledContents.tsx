import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";

import type { BaseFacetContextSettings } from "app/finance/_settings/common_context_settings";

export default function ChartsEnabledContents<SettingsType extends BaseFacetContextSettings>(props: {
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;
}) {
  const { settings, setSettings } = props;
  return (
    <FormGroup sx={{ marginX: "0.5rem" }}>
      <FormControlLabel
        label="Render Charts"
        control={
          <Switch
            checked={settings.chartsEnabled !== false}
            size="small"
            onChange={(e) =>
              setSettings({ ...settings, chartsEnabled: e.target.checked })
            }
          />
        }
      />
    </FormGroup>
  );
}
