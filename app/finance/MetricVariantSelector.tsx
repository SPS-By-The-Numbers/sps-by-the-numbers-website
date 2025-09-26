import { useId } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import type { SxProps, Theme } from '@mui/material';

// TODO Metric Variant is wrong. We need Normalizaiton.
export type MetricVariant = "amount" | "pctexp" | "pctcomp" | "ppe" | "fte" | 'finalSalary';

type Params = {
  variant: MetricVariant;
  label: string;
  onChange: (newVariant: MetricVariant) => void;
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
        onChange={e => onChange(e.target.value as MetricVariant)}
        sx={[{
        },
        ...(Array.isArray(sx) ? sx : [sx])
        ]}
      >
        <MenuItem value="amount">Raw Amount</MenuItem>
        <MenuItem value="pctexp">% of Expenditures</MenuItem>
        <MenuItem value="pctcomp">% of Compensation</MenuItem>
        <MenuItem value="ppe">Per Pupil[not impl]</MenuItem>
        <MenuItem value="pctexppee">% of Expenditures Per Pupil[not impl]</MenuItem>
      </Select>
    </FormControl>
  );
}
