'use client'

import { useState, useEffect, useMemo, createContext, useContext } from 'react';

type DanfoContextType = {
  dfd: any;
  setDfd: (obj: any) => void;
};

// This export circumvents React's Context system and doesn't follow the lifecycle
// guarantees. However, it provides an easy reference from the Highcharts-style
// non-react "components".  It should be safe to use as long as Highcharts is
// invoked within the lifespan of this provider component. Use outside that lifespan
// will probably work too but it's not well defined.
export let g_dfd : any = {};

async function loadDfd() {
  g_dfd = (await import('danfojs'));
  return g_dfd;
}

const DanfoContext = createContext<DanfoContextType | undefined>(undefined);

export function useDanfo() {
  const context = useContext(DanfoContext);
  if (context === undefined) {
    throw new Error('Missing <DanfoProvider>')
  }

  return context;
}

export default function DanfoProvider({ children }) {
  const [dfd, setDfd] = useState<object>({});

  const value = useMemo(() => ({dfd, setDfd}), [dfd]);

  useEffect(() => {
    loadDfd().then(v => setDfd(v));
  },
  []);

  return (
    <DanfoContext.Provider value={value}>
        {children}
    </DanfoContext.Provider>
  );
}

