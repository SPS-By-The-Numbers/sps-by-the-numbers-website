'use client'

import dynamic from 'next/dynamic';

import { useState } from 'react';
import FinanceNav from 'components/finance/FinanceNav';

const DistrictDashboardCharts = dynamic(() => import('components/finance/DistrictDashboardCharts'),
                                        {ssr: false});

type DistrictInfo = {
  district: string;
  county_code: number;
  district_code: number;
};

export type DistrictsMap = Map<number, DistrictInfo>;

type Params = {
  districts: DistrictsMap;
};

export default function DistrictDashboard({districts} : Params) {
  const [ccddd, setCcddd] = useState<number>(17001);

  return (
    <>
      <FinanceNav districts={districts} ccddd={ccddd} onCcdddChange={v => setCcddd(v)} />
      <DistrictDashboardCharts ccddd={ccddd} />
    </>
  )
}

