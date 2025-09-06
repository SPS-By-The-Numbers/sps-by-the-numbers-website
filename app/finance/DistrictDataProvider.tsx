'use client'
 
import { createContext, useContext, useState, useMemo } from 'react';
import DistrictData from 'utilities/DistrictData';

import type { ReactNode } from 'react';

export type Ccddd = number;
export type DistrictDataMap = Map<Ccddd, DistrictData>;

type DistrictDataContextType = {
  districtDataMap: DistrictDataMap;
  loadCcddd: (ccddd: Ccddd) => void;
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

export default function DistrictDataProvider({children}: DistrictDataProviderParams) {
  // Use previouslyLoadedCcddds to keep track of requests to prevent double-loading the dataset.
  const [previouslyLoadedCcddds, setPreviouslyLoadedCcddds] = useState<Set<Ccddd>>(new Set<Ccddd>);
  const [districtDataMap, setDistrictDataMap] = useState<DistrictDataMap>({} as DistrictDataMap);

  const value = useMemo(
    () => {
      // Used to signal a new data fetch.
      const loadCcddd = async (ccddd: Ccddd) => {
        if (!previouslyLoadedCcddds.has(ccddd)) {
          setPreviouslyLoadedCcddds(new Set(previouslyLoadedCcddds).add(ccddd));
          const newDistrictDataMap = Object.assign({}, districtDataMap);
          newDistrictDataMap[ccddd] = await DistrictData.loadFromGcs(ccddd);
          setDistrictDataMap(newDistrictDataMap);
        }
      };
      return {districtDataMap, loadCcddd};
    },
    [districtDataMap, previouslyLoadedCcddds]);

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


