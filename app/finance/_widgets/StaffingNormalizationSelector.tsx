import { useId } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import type { SxProps, Theme } from '@mui/material';
import type { StaffingNormalization } from 'utilities/ChartableMetrics';

type Params = {
  normalization: StaffingNormalization;
  label: string;
  onChange: (newVariant: StaffingNormalization) => void;
  sx?: SxProps<Theme>;
};

export default function StaffingNormalizationSelector({normalization, label, onChange, sx=[]} : Params) {
  const labelId = useId();
  return (
    <FormControl size="small">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={normalization}
        onChange={e => onChange(e.target.value as StaffingNormalization)}
        label={label}
        sx={[{
        },
        ...(Array.isArray(sx) ? sx : [sx])
        ]}
      >
        <MenuItem value="fte">FTE</MenuItem>
        <MenuItem value="pctfte">% of FTE</MenuItem>
      </Select>
    </FormControl>
  );
}
