'use client'
 
import { createContext, useContext, useState, useMemo } from 'react';

import type { React } from 'react';

type FinanceNavStateContextType = {
  ccddd: number;
  setCcddd: (ccddd: number) => void;
};

type FinanceNavStateProviderParams = {
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

export default function FinanceNavStateProvider({initialCcddd, children}: FinanceNavStateProviderParams) {
  const [ccddd, setCcddd] = useState<CcdddId>(initialCcddd);

  const value = useMemo(() => ({ccddd, setCcddd}), [ccddd]);
 
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

