import SettingsSelect from "app/finance/_widgets/SettingsSelect";
import * as ChartOptions from "utilities/ChartOptions";

import type { BaseSettings } from "app/finance/_settings/base_settings";

function FacetContents<SettingsType extends BaseSettings>(props: {
  facetOptions,
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;
}) {
  const {facetOptions, settings, setSettings} = props;

  return (
    <>
      <SettingsSelect
        {...props}
        label="Facet"
        fieldName="facet"
        options={facetOptions}
      />
      <SettingsSelect
        {...props}
        label="Facet Limit"
        fieldName="facetLimit"
        options={ChartOptions.FACET_LIMIT_OPTIONS}
      />
    </>
  );
}

export function makeFacetContents<SettingsType extends BaseSettings, >(facetOptions) {
  const BoundFacetContents = (params: {settings: SettingsType, setSettings: (x: SettingsType) => void}) => (
    <FacetContents
      facetOptions={facetOptions}

      settings={params.settings}
      setSettings={params.setSettings}
    />
  );
  return BoundFacetContents;
}
