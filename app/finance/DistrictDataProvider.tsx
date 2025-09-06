'use client'
 
import { createContext, useContext, useState, useMemo } from 'react';
import DistrictData from 'utilities/DistrictData';

import type { ReactNode } from 'react';

export type Ccddd = number;
export type DistrictDataMap = Map<Ccddd, DistrictData>;

type DistrictDataContextType = {
  districtDataMap: DistrictDataMap;
  loadCcddd: (ccddd: DistrictDataMap) => void;
};

type DistrictDataProviderParams = {
  children: ReactNode;
};

// Pattern from https://stackoverflow.com/a/74174425
const DistrictDataContext = createContext<DistrictDataContextType | undefined>(undefined);

export function useDistrictData() {
  const context = useContext(DistrictDataContext);
  if (context === undefined) {
    throw new Error('Missing <DistrictDataProvider>')
  }

  return context;
}

async function loadData(dashboards, ccddd) {
  const districtData = await DistrictData.loadFromGcs(ccddd);
  dashboards.board('dashboard-charts-container', makeDashboardConfig(districtData));
  window.districtData = districtData;
  window.dashboards = dashboards;
}


export default function DistrictDataProvider({children}: DistrictDataProviderParams) {
  // Use loadedCcddds to keep track of requests to prevent double-loading the dataset.
  const [loadedCcddds, setLoadedCcddds] = useState<Set<Ccddd>>(new Set<Ccddd>);
  const [districtDataMap, setDistrictDataMap] = useState<DistrictDataMap>({});

  // Used to signal a new data fetch.
  const loadCcddd = async (ccddd: Ccddd) => {
    if (!loadedCcddds.has(ccddd)) {
      setLoadedCcddds(new Set(loadedCcddds).add(ccddd));
      const newDistrictDataMap = Object.assign({}, districtDataMap);
      newDistrictDataMap[ccddd] = await DistrictData.loadFromGcs(ccddd);
      setDistrictDataMap(newDistrictDataMap);
    }
  };

  const value = useMemo(() => ({districtDataMap, loadCcddd}), [districtDataMap]);

  return (
    <DistrictDataContext.Provider value={value}>
      {useMemo(() => (
        <>
          {children}
        </>
      ), [children])}
    </DistrictDataContext.Provider>
  )
}


