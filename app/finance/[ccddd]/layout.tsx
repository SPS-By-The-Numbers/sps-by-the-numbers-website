import { fetchDatasetStream } from 'utilities/DistrictData';
import { parse } from "csv-parse/sync";
import FinanceNav from 'components/finance/FinanceNav';
import FinanceNavStateProvider from 'components/providers/FinanceNavStateProvider';

import type { ReactNode } from 'react';
import type { DistrictsMap } from 'components/providers/FinanceNavStateProvider.tsx';

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
    <FinanceNavStateProvider initialCcddd={17001} districts={districts}>
      <FinanceNav />
      {children}
    </FinanceNavStateProvider>
  )
}
