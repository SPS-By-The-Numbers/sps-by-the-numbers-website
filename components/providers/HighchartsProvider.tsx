'use client'

import { useState, useEffect, useMemo, createContext, useContext } from 'react';

import Highcharts from 'highcharts'
import highchartsAccessibility from "highcharts/modules/accessibility";

type HighchartsContextType = {
  highcharts: Highcharts;
  setHighcharts: (highcharts: Highcharts) => void;
};

type HighchartsProviderParams = {
  children: React.ReactNode;
};

const HighchartsContext = createContext<HighchartsContext | undefined>(undefined);

export function useHighcharts() {
  const context = useContext(HighchartsContext);
  if (context === undefined) {
    throw new Error('Missing <HighchartsProvider>')
  }

  return context;
}

export default function HighchartsProvider({ children }) {
  const [highcharts, setHighcharts] = useState<Highcharts | null>(null);

  const value = useMemo(() => ({highcharts, setHighcharts}), [highcharts]);

  useEffect(() => {
    highchartsAccessibility(Highcharts);
    setHighcharts(Highcharts);
  },
  []);

  return (
    <HighchartsContext.Provider value={value}>
          {children}
    </HighchartsContext.Provider>
  );
}
