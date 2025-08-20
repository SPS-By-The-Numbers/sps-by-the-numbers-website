'use client'

import { useState, useEffect, useMemo, createContext, useContext } from 'react';

import type Highcharts from 'highcharts';
import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

import dynamic from 'next/dynamic';

type HighchartsObjects ={
  highcharts: Highcharts;
  dashboards: Dashboards
}

type HighchartsContextType = {
  highchartsObjs: HighchartsObjects;
  setHighchartsObjs: (objs: HighchartsObjects) => void;
};

type HighchartsProviderParams = {
  children: React.ReactNode;
};


async function loadHighchartsModules() {
  const Highcharts = (await import('highcharts')).default;
  const highchartsAccessibility = (await import("highcharts/modules/accessibility")).default;
  const Dashboards = (await import(
    '@highcharts/dashboards/es-modules/masters/dashboards.src.js')).default;
  const DataGrid = (await import('@highcharts/dashboards/datagrid')).default;
  const registerHighchartsComponents = (await import(
    'utilities/highcharts/components/registerHighchartsComponents')).default;

  highchartsAccessibility(Highcharts);
  Highcharts.setOptions({lang: {
      thousandsSep: ','
    }
  });

  Dashboards.HighchartsPlugin.custom.connectHighcharts(Highcharts);
  Dashboards.GridPlugin.custom.connectGrid(DataGrid);
  Dashboards.PluginHandler.addPlugin(Dashboards.HighchartsPlugin);
  Dashboards.PluginHandler.addPlugin(Dashboards.GridPlugin);

  registerHighchartsComponents(Dashboards);
  return { highcharts: Highcharts, dashboards: Dashboards };
}

const HighchartsContext = createContext<HighchartsContext | undefined>(undefined);

export function useHighcharts() {
  const context = useContext(HighchartsContext);
  if (context === undefined) {
    throw new Error('Missing <HighchartsProvider>')
  }

  return context;
}

export default function HighchartsProvider({ children }) {
  const [highchartsObjs, setHighchartsObjs] = useState<HighchartsObjects | null>(null);

  const value = useMemo(() => ({highchartsObjs, setHighchartsObjs}), [highchartsObjs]);

  useEffect(() => {
    loadHighchartsModules().then(highchartsObjs => {
      setHighchartsObjs(highchartsObjs);
    });
  },
  []);

  return (
    <HighchartsContext.Provider value={value}>
          {children}
    </HighchartsContext.Provider>
  );
}
