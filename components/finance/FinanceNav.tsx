'use client'

import AppBar from '@mui/material/AppBar';
import NavLink from 'components/NavLink';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';

import type { SxProps, Theme } from '@mui/material';

type Params = {
  sx?: SxProps<Theme>;
};

export default function FinanceNav({sx=[]} : Params) {
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
          <NavLink href={'/finance/vitals'}>Vitals</NavLink>
          <NavLink href={'/finance/enrollment'}>Enrollment</NavLink>
          <NavLink href={'/finance/enrollment'}>Cashflow</NavLink>
          <NavLink href={'/finance/expenditures'}>Expenditures</NavLink>
          <NavLink href={'/finance/correlations'}>Key Correlations</NavLink>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
