'use client'

import dynamic from 'next/dynamic';

const DistrictDashboard = dynamic(() => import('components/finance/DistrictDashboard'),
                           {ssr: false});

export default function Styled() {
  return (
    <DistrictDashboard />
  )
}
