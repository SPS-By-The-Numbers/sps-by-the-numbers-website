import CurrencyNormalizationSelector from "app/finance/_widgets/CurrencyNormalizationSelector";
import DistrictSelector from "app/finance/_widgets/DistrictSelector";
import FilterGroupingSelector from "app/finance/_widgets/FilterGroupingSelector";
import StaffingNormalizationSelector from "app/finance/_widgets/StaffingNormalizationSelector";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

export default function DatasetSettingsContents({
  settings,
  setSettings,
}: {
  settings: DatasetSettings;
  setSettings: (x: DatasetSettings) => void;
}) {
  return (
    <>
      <DistrictSelector
        ccddd={settings.ccddd}
        onChange={(ccddd) =>
          setSettings(Object.assign({}, settings, { ccddd }))
        }
      />
      <FilterGroupingSelector
        label={`Filter Grouping`}
        filterGrouping={settings.filterGrouping}
        onChange={(filterGrouping) =>
          setSettings(Object.assign({}, settings, { filterGrouping }))
        }
      />
      <CurrencyNormalizationSelector
        label={`Money Normalization`}
        normalization={settings.currencyNormalization}
        onChange={(currencyNormalization) =>
          setSettings(Object.assign({}, settings, { currencyNormalization }))
        }
      />
      <StaffingNormalizationSelector
        label={`Staffing Normalization`}
        normalization={settings.staffingNormalization}
        onChange={(staffingNormalization) =>
          setSettings(Object.assign({}, settings, { staffingNormalization }))
        }
      />
    </>
  );
}
