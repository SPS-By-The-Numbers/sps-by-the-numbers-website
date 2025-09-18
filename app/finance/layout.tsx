import { fetchDatasetStream } from 'utilities/DistrictData';
import { parse } from "csv-parse/sync";
import DistrictDataProvider from './DistrictDataProvider';
import FinanceNav from 'components/finance/FinanceNav';
import Paper from '@mui/material/Paper';

import type { ReactNode } from 'react';

import "styles/highcharts-base.scss"
import "styles/finance-dashboard.scss"
import "styles/hc-ba-history.scss"

export default async function FinanceLayout({ children }: {children: ReactNode}) {
  return (
    <DistrictDataProvider>
      <FinanceNav />
      <Paper sx={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
        {children}
      </Paper>
    </DistrictDataProvider>
  )
}
