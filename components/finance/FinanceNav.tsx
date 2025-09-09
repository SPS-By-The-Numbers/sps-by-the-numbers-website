'use client'

import { useState } from 'react';
import { useFinanceNavState } from 'components/providers/FinanceNavStateProvider';
import { useRouter, usePathname } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import NavLink from 'components/NavLink';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

import type { SxProps, Theme } from '@mui/material';
import type { DistrictsMap } from 'components/providers/FinanceNavStateProvider';

type Params = {
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

export default function FinanceNav({sx=[]} : Params) {
  const {ccddd, setCcddd, districts} = useFinanceNavState();
  const router = useRouter();
  const pathName = usePathname();
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
        <Stack direction="row" spacing={4} sx={{alignItems: "center"}}>
          <div>
            <NavLink href={`/finance/summary/${ccddd}`}>Summary</NavLink>
          </div>
          <div>
            <NavLink href={`/finance/enrollment/${ccddd}`}>Enrollment</NavLink>
          </div>
          <div>
            <NavLink href={`/finance/expenditures/${ccddd}`}>Expenditures</NavLink>
          </div>
          <div>
            <NavLink href={`/finance/custom/${ccddd}`}>Custom</NavLink>
          </div>
          <Autocomplete
            disableClearable
            value={{label: districts[ccddd].district,  value: String(ccddd)}}
            options={ districtOptions }
            onChange={(_event, newValue) => {
              const newCcddd = parseInt(newValue.value);
              const parts = pathName.split('/');
              parts.pop();
              parts.push(newCcddd.toString())
              setCcddd(newCcddd);
              router.push(parts.join('/'));
            }}
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
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
