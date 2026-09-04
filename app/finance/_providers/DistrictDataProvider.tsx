"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { prefetchRemaining } from "utilities/client/DistrictDatasets";

import type { DatasetName } from "utilities/client/DistrictDatasets";
import { deserializeDatasetSettings } from "app/finance/_settings/common_settings";
import { deserializeContextSettings } from "app/finance/_settings/common_context_settings";
import { useSearchParams } from "next/navigation";
import DistrictData from "utilities/DistrictData";
import Loading from "components/Loading";

import type {
  BaseSettings,
  SettingsConfigGenerators,
} from "app/finance/_settings/base_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";
import type { ReactNode, ComponentType } from "react";

export type Ccddd = number;
export type DistrictDataMap = Map<Ccddd, DistrictData>;

type DistrictDataContextType = {
  districtDataMap: DistrictDataMap;
  loadCcddd: (ccddd: Ccddd, datasets: readonly DatasetName[]) => void;
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
> = {
  defaultAllSettings: Array<SettingsType>;
  allSettingsConfigGenerators: SettingsConfigGenerators;

  defaultContextSettings: ContextSettingsType;
  contextSettingsConfigGenerators?: SettingsConfigGenerators;

  ContentComponent: ComponentType<
    DistrictDataContentProps<SettingsType, ContextSettingsType>
  >;

  // The datasets this dashboard reads. Compose these from the DATASETS
  // constants exported by the helpers a dashboard uses (ChartableMetrics,
  // ChartableVitals) rather than hand-listing them, so the declaration cannot
  // drift from the code that depends on it.
  datasets: readonly DatasetName[];
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
  datasets,
}: EnsureDistrictDataProps<SettingsType, ContextSettingsType>) {
  // Make one up for places that don't use it.
  const { districtDataMap, loadCcddd } = useDistrictData();
  const searchParams = useSearchParams();

  const allSettings = deserializeDatasetSettings(
    searchParams.getAll("d"),
    defaultAllSettings,
    allSettingsConfigGenerators,
  );

  const contextSettings = deserializeContextSettings(
    searchParams.getAll("c"),
    defaultContextSettings,
    contextSettingsConfigGenerators ?? [],
  );

  // The memoization happens in loadCcddd. The rest of the useEffect dependency
  // is largely nonsensical.
  // datasets is a module-level constant array per dashboard, but join it so a
  // caller passing a fresh literal each render does not re-fire the effect.
  const datasetKey = datasets.join(",");
  useEffect(() => {
    for (const settings of allSettings) {
      loadCcddd(settings.ccddd, datasetKey.split(",") as DatasetName[]);
    }
  }, [allSettings, loadCcddd, datasetKey]);

  for (const settings of allSettings) {
    const districtData = districtDataMap[settings.ccddd];
    // Both halves matter: the district may not be loaded at all, or it may be
    // loaded from a narrower tab's dataset list and be missing a frame this
    // dashboard declared.
    if (!districtData || !districtData.hasAll(datasets)) {
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

export default function DistrictDataProvider({
  children,
}: DistrictDataProviderParams) {
  // districtDataMap holds a DistrictData per district built from whatever
  // datasets have been requested so far. The underlying frames are cached in
  // DistrictDatasets, so rebuilding this for a wider dataset set re-uses
  // everything already fetched -- switching tabs costs only the datasets the
  // new tab adds, and usually nothing at all once the idle prefetch has run.
  const [districtDataMap, setDistrictDataMap] = useState<DistrictDataMap>(
    {} as DistrictDataMap,
  );
  // What we have actually loaded per district, so a tab needing a superset
  // triggers a rebuild and a tab needing a subset does not.
  const loadedRef = useRef<Map<Ccddd, Set<DatasetName>>>(new Map());

  const value = useMemo(() => {
    const loadCcddd = async (
      ccddd: Ccddd,
      datasets: readonly DatasetName[],
    ) => {
      const have = loadedRef.current.get(ccddd) ?? new Set<DatasetName>();
      const missing = datasets.filter((d) => !have.has(d));
      if (missing.length === 0) return;

      const wanted = new Set([...have, ...datasets]);
      // Claim the wider set up front so concurrent callers do not each kick
      // off their own rebuild; the per-dataset cache dedupes the fetches
      // regardless, but this keeps the state churn down.
      loadedRef.current.set(ccddd, wanted);

      try {
        const districtData = await DistrictData.loadFromGcs(ccddd, [...wanted]);
        setDistrictDataMap((prev) => ({ ...prev, [ccddd]: districtData }));
        prefetchRemaining(ccddd, [...wanted]);
      } catch (err) {
        // Let a later attempt retry rather than wedging the district.
        loadedRef.current.set(ccddd, have);
        throw err;
      }
    };
    return { districtDataMap, loadCcddd };
  }, [districtDataMap]);

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
