'use client'
 
import { createContext, useContext, useState, useMemo } from 'react';

import type { React } from 'react';

export type DistrictsMap = Map<number, DistrictInfo>;

type FinanceNavStateContextType = {
  ccddd: number;
  setCcddd: (ccddd: number) => void;
  districts: DistrictsMap,
};

type FinanceNavStateProviderParams = {
  initialCcddd: number;
  districts: DistrictsMap;
  children: React.ReactNode;
};

// Pattern from https://stackoverflow.com/a/74174425
const FinanceNavStateContext = createContext<FinanceNavStateContextType | undefined>(undefined);

export function useFinanceNavState() {
  const context = useContext(FinanceNavStateContext);
  if (context === undefined) {
    throw new Error('Missing <FinanceNavStateProvider>')
  }

  return context;
}

export default function FinanceNavStateProvider({initialCcddd, districts, children}: FinanceNavStateProviderParams) {
  const [ccddd, setCcddd] = useState<CcdddId>(initialCcddd);

  const value = useMemo(() => ({ccddd, setCcddd, districts}), [ccddd, districts]);
 
  return (
    <FinanceNavStateContext.Provider value={value}>
      {useMemo(() => (
        <>
          {children}
        </>
      ), [children])}
    </FinanceNavStateContext.Provider>
  )
}

