import DistrictSelector from "app/finance/_widgets/DistrictSelector";
import FilterGroupingSelector from "app/finance/_widgets/FilterGroupingSelector";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

// Enrollment-specific dataset settings: omits the money and staffing
// normalization selectors since enrollment headcounts aren't normalized
// against either of those.
export default function EnrollmentDatasetSettingsContents({
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
    </>
  );
}
