'use client'

import { useFinanceNavState } from 'components/providers/FinanceNavStateProvider';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import type { SxProps, Theme } from '@mui/material';

type Params = {
  ccddd: number;
  onChange: (ccddd: number) => void;
  sx?: SxProps<Theme>;
};

function makeDistrictOptions(districts : DistrictsMap) {
  const options = Object.entries(districts).map(
    ([ccddd, info]) => ({label: info.district, value: ccddd}));

  // Alphabetize the districts.
  options.sort((a, b) => {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  });

  return options;
}

export default function DistrictSelector({ccddd, onChange, sx=[]} : Params) {
  // TODO: This is the wrong place for storing the districts data.
  const {districts} = useFinanceNavState();

  const districtOptions = makeDistrictOptions(districts);
  const districtsByName = Object.fromEntries(
    Object.entries(districts).map(([k, v]) => [v['district'], k]));
  const districtsAlphabetical = Object.keys(districtsByName).sort();

  return (
    <Autocomplete
      size="small"
      disableClearable
      value={{label: districts[ccddd].district, value: String(ccddd)}}
      options={ districtOptions }
      onChange={(_event, newValue) => onChange(newValue)}
      renderInput={
        (params) => (
          <TextField
            sx={{input: {textAlign: "center"}}}
            {...params}
          />
        )
      }
      sx={[
        {
          width: "100%",
          minWidth: "40rex",
          bgcolor: 'primary.main',
          "& .MuiOutlinedInput-root": {
            color: 'primary.contrastText',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    />
  );

}

