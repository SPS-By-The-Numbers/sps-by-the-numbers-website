import { useId } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import type { SxProps, Theme } from '@mui/material';
import type { MetricNormalization } from 'utilities/ChartableMetrics';

type Params = {
  variant: MetricNormalization;
  label: string;
  onChange: (newVariant: MetricNormalization) => void;
  sx?: SxProps<Theme>;
};

export default function MetricNormalizationSelector({variant, label, onChange, sx=[]} : Params) {
  const selectId = useId();
  return (
    <FormControl size="small">
      <InputLabel id={selectId}>{label}</InputLabel>
      <Select
        labelId={selectId}
        value={variant}
        onChange={e => onChange(e.target.value as MetricNormalization)}
        sx={[{
        },
        ...(Array.isArray(sx) ? sx : [sx])
        ]}
      >
        <MenuItem value="amount">Amount</MenuItem>
        <MenuItem value="pctexp">% of Expenditures</MenuItem>
        <MenuItem value="pctcomp">% of All Compensation</MenuItem>
        <MenuItem value="pctsalary">% of All Salaries</MenuItem>
      </Select>
    </FormControl>
  );
}
