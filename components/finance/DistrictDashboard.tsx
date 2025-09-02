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


type Params = {
  districts: DistrictsMap;
};

export default function DistrictDashboard() {
  return (
    <DistrictDashboardCharts />
  )
}

