import { fetchDatasetStream } from 'utilities/DistrictData';
import { parse } from "csv-parse/sync";
import DistrictDataProvider from 'app/finance/_providers/DistrictDataProvider';
import FinanceNav from 'app/finance/FinanceNav';

import type { ReactNode } from 'react';

import "styles/highcharts-base.scss"
import "styles/finance-dashboard.scss"
import "styles/hc-ba-history.scss"

export default async function FinanceLayout({ children }: {children: ReactNode}) {
  return (
    <DistrictDataProvider>
      <FinanceNav />
      {children}
    </DistrictDataProvider>
  )
}
