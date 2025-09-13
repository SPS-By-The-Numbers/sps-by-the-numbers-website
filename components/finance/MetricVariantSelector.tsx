import { useId } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import type { SxProps, Theme } from '@mui/material';

type Params = {
  variant: string;
  label: string;
  onChange: (newVariant: string) => void;
  sx?: SxProps<Theme>;
};

export default function MetricVariantSelector({variant, label, onChange, sx=[]} : Params) {
  const selectId = useId();
  return (
    <FormControl size="small">
      <InputLabel id={selectId}>{label}</InputLabel>
      <Select
        labelId={selectId}
        value={variant}
        onChange={e => onChange(e.target.value)}
        sx={[{
        },
        ...(Array.isArray(sx) ? sx : [sx])
        ]}
      >
        <MenuItem value="amount">Raw Amount</MenuItem>
        <MenuItem value="pctexp">% of Expenditures</MenuItem>
        <MenuItem value="ppe">Per Pupil</MenuItem>
        <MenuItem value="pctexppee">% of Expenditures Per Pupil</MenuItem>
      </Select>
    </FormControl>
  );
}
