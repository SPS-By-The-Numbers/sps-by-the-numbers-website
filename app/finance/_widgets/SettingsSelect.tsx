import { useId } from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

interface SettingsSelectProps<T> {
  // Text Label for the setting field. Rendered to user.
  label: string;

  // setter and getter for settings.
  settings: T;
  setSettings: (x: T) => void;

  // The field in the settings object.
  fieldName: string;

  // The options available in the select. It's {value: label}
  // where value what is stored in the setting.
  options: Record<string, string>;
}

// Displays a select dialog box for a field in the settings state.
export default function SettingsSelect<T>({
  label,
  settings,
  setSettings,
  fieldName,
  options,
}: SettingsSelectProps<T>) {
  const id = useId();
  const labelId = useId();

  const items = Object.entries(options).map(([value, optionLabel]) => (
    <MenuItem key={value} value={value}>
      {optionLabel}
    </MenuItem>
  ));

  return (
    <FormControl size="small">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        value={settings[fieldName]}
        label={label}
        onChange={(e) =>
          setSettings({ ...settings, [fieldName]: e.target.value })
        }
      >
        {items}
      </Select>
    </FormControl>
  );
}
