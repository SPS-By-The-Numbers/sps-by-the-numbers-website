// Dataset-settings panel for the Expenditure Flow view.
//
// Like the shared `DatasetSettingsContents` but WITHOUT the Money (currency) and
// Staffing normalization selectors: the flow diagram is built from raw dollar
// amounts, so those normalizations have no effect here and would only mislead.

import DistrictSelector from "app/finance/_widgets/DistrictSelector";
import FilterGroupingSelector from "app/finance/_widgets/FilterGroupingSelector";
import { settingsForDistrictChange } from "app/finance/_settings/common_settings";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

export default function FlowDatasetSettingsContents({
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
          setSettings(settingsForDistrictChange(settings, ccddd))
        }
      />
      <FilterGroupingSelector
        label={`Filter Grouping`}
        filterGrouping={settings.filterGrouping}
        onChange={(filterGrouping) =>
          setSettings(Object.assign({}, settings, { filterGrouping }))
        }
      />
    </>
  );
}
