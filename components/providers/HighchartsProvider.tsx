"use client";

import { useState, useEffect, useMemo, createContext, useContext } from "react";

import type Dashboards from "@highcharts/dashboards/es-modules/masters/dashboards.src.js";

type HighchartsObjects = {
  highcharts: any;
  dashboards: any;
};

type HighchartsContextType = {
  highchartsObjs: HighchartsObjects;
  setHighchartsObjs: (objs: HighchartsObjects) => void;
};

type HighchartsProviderParams = {
  children: React.ReactNode;
};

const DEFAULT_OBJECT = {
  highcharts: undefined,
  dashboards: undefined,
};

// This export circumvents React's Context system and doesn't follow the lifecycle
// guarantees. However, it provides an easy reference from the Highcharts-style
// non-react "components".  It should be safe to use as long as Highcharts is
// invoked within the lifespan of this provider component. Use outside that lifespan
// will probably work too but it's not well defined.
export let g_highchartsObjs: HighchartsObjects = DEFAULT_OBJECT;

async function loadHighchartsModules() {
  const Highcharts = (await import("highcharts")).default;
  await import("highcharts/modules/accessibility");
  await import("highcharts/modules/exporting");
  await import("highcharts/modules/export-data");
  await import("highcharts/modules/no-data-to-display");
  await import("highcharts/modules/sankey");
  await import("highcharts/modules/organization");

  const Dashboards = (
    await import("@highcharts/dashboards/es-modules/masters/dashboards.src.js")
  ).default;
  const DataGrid = (await import("@highcharts/dashboards/datagrid")).default;

  await import("@highcharts/dashboards/es-modules/masters/modules/layout.src.js");

  Highcharts.setOptions({
    lang: {
      thousandsSep: ",",
    },
  });

  Dashboards.HighchartsPlugin.custom.connectHighcharts(Highcharts);
  Dashboards.GridPlugin.custom.connectGrid(DataGrid);
  Dashboards.PluginHandler.addPlugin(Dashboards.HighchartsPlugin);
  Dashboards.PluginHandler.addPlugin(Dashboards.GridPlugin);

  g_highchartsObjs = { highcharts: Highcharts, dashboards: Dashboards };
  return g_highchartsObjs;
}

const HighchartsContext = createContext<HighchartsContextType | undefined>(
  undefined,
);

export function useHighcharts() {
  const context = useContext(HighchartsContext);
  if (context === undefined) {
    throw new Error("Missing <HighchartsProvider>");
  }

  return context;
}

export default function HighchartsProvider({ children }) {
  const [highchartsObjs, setHighchartsObjs] =
    useState<HighchartsObjects>(DEFAULT_OBJECT);

  useEffect(() => {
    loadHighchartsModules().then((objs) => {
      setHighchartsObjs(objs);
    });
  }, []);

  const value = useMemo(
    () => ({ highchartsObjs, setHighchartsObjs }),
    [highchartsObjs],
  );

  return (
    <HighchartsContext.Provider value={value}>
      {children}
    </HighchartsContext.Provider>
  );
}
