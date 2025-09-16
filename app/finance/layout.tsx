import { fetchDatasetStream } from 'utilities/DistrictData';
import { parse } from "csv-parse/sync";
import DistrictDataProvider from './DistrictDataProvider';
import FinanceNav from 'components/finance/FinanceNav';
import Paper from '@mui/material/Paper';
import FinanceNavStateProvider from 'components/providers/FinanceNavStateProvider';

import type { ReactNode } from 'react';
import type { DistrictsMap } from 'components/providers/FinanceNavStateProvider.tsx';

import "styles/highcharts-base.scss"
import "styles/finance-dashboard.scss"
import "styles/hc-ba-history.scss"

export default async function FinanceLayout({ children }: {children: ReactNode}) {
  const csvString = await new Response(await fetchDatasetStream('domain', 'ccddd')).text();
  const districtRecords = parse(csvString, { columns: true, skip_empty_lines: true});

  const districts = {} as DistrictsMap;
  for (const r of districtRecords as Array<any>) {
    districts[r['ccddd']] = {
      district: r['district'],
      county_code: r['county_code'],
      district_code: r['district_code'],
    }
  }

  return (
    <DistrictDataProvider>
      <FinanceNavStateProvider initialCcddd={17001} districts={districts}>
        <FinanceNav />
        <Paper sx={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
          {children}
        </Paper>
      </FinanceNavStateProvider>
    </DistrictDataProvider>
  )
}
