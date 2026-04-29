import DistrictSelector from "app/finance/_widgets/DistrictSelector";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

// Assessment-specific dataset settings: only the district selector applies.
export default function AssessmentDatasetSettingsContents({
  settings,
  setSettings,
}: {
  settings: DatasetSettings;
  setSettings: (x: DatasetSettings) => void;
}) {
  return (
    <DistrictSelector
      ccddd={settings.ccddd}
      onChange={(ccddd) =>
        setSettings(Object.assign({}, settings, { ccddd }))
      }
    />
  );
}
