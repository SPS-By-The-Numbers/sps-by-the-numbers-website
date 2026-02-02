"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { deserializeDatasetSettings } from "app/finance/_settings/common_settings";
import { deserializeContextSettings } from "app/finance/_settings/common_context_settings";
import { useSearchParams } from 'next/navigation';
import DistrictData from "utilities/DistrictData";
import Loading from "components/Loading";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { SettingsConfigGenerators } from "app/finance/_settings/common_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
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

export type DistrictDataContentProps<
  SettingsType extends DatasetSettings,
  ContextSettingsType extends BaseSettings = BaseSettings,
> = {
  districtDataMap: DistrictDataMap;
  allSettings: Array<SettingsType>;
  contextSettings: ContextSettingsType;
};

type EnsureDistrictDataProps<
  SettingsType extends DatasetSettings,
  ContextSettingsType extends BaseSettings,
>  = {
  defaultAllSettings: Array<SettingsType>;
  allSettingsConfigGenerators: SettingsConfigGenerators;

  defaultContextSettings: ContextSettingsType;
  contextSettingsConfigGenerators?: SettingsConfigGenerators;

  ContentComponent: ComponentType<DistrictDataContentProps<SettingsType, ContextSettingsType>>;
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

// Utility component that pairs with DistrictDataProvider to ensure all districts are loaded.
export function EnsureDistrictData<
  SettingsType extends DatasetSettings,
  ContextSettingsType extends BaseSettings,
>({
  defaultAllSettings,
  allSettingsConfigGenerators,

  defaultContextSettings,
  contextSettingsConfigGenerators,

  ContentComponent,
}: EnsureDistrictDataProps<SettingsType, ContextSettingsType>) {
  // Make one up for places that don't use it.
  const { districtDataMap, loadCcddd } = useDistrictData();
  const searchParams = useSearchParams();

  const allSettings = deserializeDatasetSettings(
    searchParams.getAll('d'),
    defaultAllSettings,
    allSettingsConfigGenerators
  );

  const contextSettings = deserializeContextSettings(
    searchParams.getAll('c'),
    defaultContextSettings,
    contextSettingsConfigGenerators ?? []
  );

  // The memoization happens in loadCcddd. The rest of the useEffect dependency
  // is largely nonsensical.
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
      contextSettings={contextSettings}
    />
  );
}

export default function DistrictDataProvider({ children }: DistrictDataProviderParams) {
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
