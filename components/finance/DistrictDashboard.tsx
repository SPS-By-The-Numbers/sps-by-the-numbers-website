'use client'

import dynamic from 'next/dynamic';

import { useState } from 'react';
import FinanceNav from 'components/finance/FinanceNav';

const DistrictDashboardCharts = dynamic(() => import('components/finance/DistrictDashboardCharts'),
                                        {ssr: false});

type Params = {
  districts: Array<Record<string, object>>,
};

export default function DistrictDashboard({districts} : Params) {
  const [ccddd, setCcddd] = useState<int>(17001);

  return (
    <>
      <FinanceNav districts={districts} ccddd={ccddd} onCcdddChange={v => setCcddd(v)} />
      <DistrictDashboardCharts ccddd={ccddd} />
    </>
  )
}

