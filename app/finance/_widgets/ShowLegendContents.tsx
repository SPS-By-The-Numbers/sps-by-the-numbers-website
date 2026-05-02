import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";

import type { CommonContextSettings } from "app/finance/_settings/common_context_settings";

export default function ShowLegendContents<SettingsType extends CommonContextSettings>(props: {
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;
}) {
  const { settings, setSettings } = props;
  return (
    <FormGroup sx={{ marginX: "0.5rem" }}>
      <FormControlLabel
        label="Show Legend"
        control={
          <Switch
            checked={settings.showLegend !== false}
            size="small"
            onChange={(e) =>
              setSettings({ ...settings, showLegend: e.target.checked })
            }
          />
        }
      />
    </FormGroup>
  );
}
