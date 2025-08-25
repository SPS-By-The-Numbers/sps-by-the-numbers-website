'use client'

import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import type { SxProps } from '@mui/material';

type Params = {
  districts: Array<Record<string, object>>,
  ccddd: int;
  onCcdddChange: (int) => void;
  sx?: SxProps<Theme>;
};

function makeDistrictOptions(districts) {
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

export default function FinanceNav({districts, ccddd, onCcdddChange, sx=[]} : Params) {
  const districtOptions = makeDistrictOptions(districts);
  const districtsByName = Object.fromEntries(
    Object.entries(districts).map(([k, v]) => [v['district'], k]));
  const districtsAlphabetical = Object.keys(districtsByName).sort();

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar
          variant="dense"
          sx={{
            backgroundColor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>

        <Autocomplete
          disableClearable
          value={{label:districts[ccddd].district,  value:ccddd}}
          options={ districtOptions }
          onChange={(_event, newValue) => onCcdddChange(newValue.value)}
          renderInput={
            (params) => (
              <TextField
                sx={{input: {textAlign: "center"}}}
                {...params}
              />)
          }
          sx={[
            {
              width: "100%",
              bgcolor: 'primary.main',
              "& .MuiOutlinedInput-root": {
                color: 'primary.contrastText',
              },
            },
            ...(Array.isArray(sx) ? sx : [sx])
          ]}
        />
      </Toolbar>
    </AppBar>
  );
}
