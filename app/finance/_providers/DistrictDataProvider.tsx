"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import DistrictData from "utilities/DistrictData";
import Loading from "components/Loading";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { MetricSettings } from "app/finance/_settings/metric_settings";
import type { ReactNode, ComponentType } from "react";

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
const DistrictDataContext = createContext<DistrictDataContextType | undefined>(
  undefined,
);

export function useDistrictData() {
  const context = useContext(DistrictDataContext);
  if (context === undefined) {
    throw new Error("Missing <DistrictDataProvider>");
  }

  return context;
}

export interface DistrictDataContentProps<
  T extends MetricSettings,
  U extends BaseSettings = BaseSettings,
> {
  districtDataMap: DistrictDataMap;
  allSettings: Array<T>;
  sharedSettings: U;
}

interface EnsureDistrictDataProps<
  T extends MetricSettings,
  U extends BaseSettings,
> {
  allSettings: Array<T>;
  sharedSettings: U;
  ContentComponent: ComponentType<DistrictDataContentProps<T, U>>;
}

// Utility component that pairs with DistrictDataProvider to ensure all districts are loaded.
export function EnsureDistrictData<
  T extends MetricSettings,
  U extends BaseSettings,
>({
  allSettings,
  sharedSettings,
  ContentComponent,
}: EnsureDistrictDataProps<T, U>) {
  // Make one up for places that don't use it.
  const { districtDataMap, loadCcddd } = useDistrictData();

  useEffect(() => {
    for (const settings of allSettings) {
      loadCcddd(settings.ccddd);
    }
  }, [allSettings, loadCcddd]);

  for (const settings of allSettings) {
    if (!(settings.ccddd in districtDataMap)) {
      return <Loading text={`Loading distrct data for ${settings.ccddd}...`} />;
    }
  }

  return (
    <ContentComponent
      districtDataMap={districtDataMap}
      allSettings={allSettings}
      sharedSettings={sharedSettings}
    />
  );
}

export default function DistrictDataProvider({
  children,
}: DistrictDataProviderParams) {
  // Use previouslyLoadedCcddds to keep track of requests to prevent double-loading the dataset.
  const [previouslyLoadedCcddds, setPreviouslyLoadedCcddds] = useState<
    Set<Ccddd>
  >(new Set<Ccddd>());
  const [districtDataMap, setDistrictDataMap] = useState<DistrictDataMap>(
    {} as DistrictDataMap,
  );

  const value = useMemo(() => {
    // Used to signal a new data fetch.
    const loadCcddd = async (ccddd: Ccddd) => {
      if (!previouslyLoadedCcddds.has(ccddd)) {
        setPreviouslyLoadedCcddds(new Set(previouslyLoadedCcddds).add(ccddd));
        const newDistrictDataMap = Object.assign({}, districtDataMap);
        newDistrictDataMap[ccddd] = await DistrictData.loadFromGcs(ccddd);
        setDistrictDataMap(newDistrictDataMap);
      }
    };
    return { districtDataMap, loadCcddd };
  }, [districtDataMap, previouslyLoadedCcddds]);

  return (
    <DistrictDataContext.Provider value={value}>
      {useMemo(
        () => (
          <>{children}</>
        ),
        [children],
      )}
    </DistrictDataContext.Provider>
  );
}
