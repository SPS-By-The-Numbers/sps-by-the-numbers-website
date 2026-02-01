import { useId } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import type { SxProps, Theme } from "@mui/material";
import type { FilterGrouping } from "app/finance/_settings/dataset_settings";

type Params = {
  filterGrouping: FilterGrouping;
  label: string;
  onChange: (newVariant: FilterGrouping) => void;
  sx?: SxProps<Theme>;
};

export default function FilterGroupingSelector({
  filterGrouping,
  label,
  onChange,
  sx = [],
}: Params) {
  const labelId = useId();
  return (
    <FormControl size="small">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={filterGrouping}
        onChange={(e) => onChange(e.target.value as FilterGrouping)}
        label={label}
        sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <MenuItem value="spsbtn">Default</MenuItem>
        <MenuItem value="ospi">OSPI Accounting Manual</MenuItem>
      </Select>
    </FormControl>
  );
}
