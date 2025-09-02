import { fetchDatasetStream } from 'utilities/DistrictData';
import { parse } from "csv-parse/sync";
import DistrictDashboard from 'components/finance/DistrictDashboard';
import FinanceNavStateProvider from 'components/providers/FinanceNavStateProvider';

import type { DistrictsMap } from 'components/finance/DistrictDashboard';

export default async function FinancePage({ params }: { params: Promise<{ ccddd: string }> }) {
  const { ccddd } = await params;

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
    <FinanceNavStateProvider initialCcddd={ccddd}>
      <DistrictDashboard districts={districts} />
    </FinanceNavStateProvider>
  )
}
