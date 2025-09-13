'use client'

import { useState } from 'react';
import { useFinanceNavState } from 'components/providers/FinanceNavStateProvider';
import { useRouter, usePathname } from 'next/navigation';
import DistrictSelector from 'components/finance/DistrictSelector';
import AppBar from '@mui/material/AppBar';
import FormControl from '@mui/material/FormControl';
import NavLink from 'components/NavLink';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import type { SxProps, Theme } from '@mui/material';
import type { DistrictsMap } from 'components/providers/FinanceNavStateProvider';

type Params = {
  sx?: SxProps<Theme>;
};

export default function FinanceNav({sx=[]} : Params) {
  const {ccddd, setCcddd, districts} = useFinanceNavState();
  const router = useRouter();
  const pathName = usePathname();

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
          <NavLink href={`/finance/summary/${ccddd}`}>Summary</NavLink>
          <NavLink href={`/finance/enrollment/${ccddd}`}>Enrollment</NavLink>
          <NavLink href={`/finance/expenditures/${ccddd}`}>Expenditures</NavLink>
        </Stack>

        <DistrictSelector ccddd={ccddd} onChange={ newCcddd => {
          const parts = pathName.split('/');
          parts.pop();
          parts.push(newCcddd.toString())
          setCcddd(newCcddd);
          router.push(parts.join('/'));
        }} />
      </Toolbar>
    </AppBar>
  );
}
