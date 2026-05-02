import DistrictSelector from "app/finance/_widgets/DistrictSelector";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

// Enrollment-specific dataset settings: only the district selector
// applies. Money/staffing normalization don't apply to headcounts, and
// the OSPI/SPSBTN PAO filter grouping isn't relevant either.
export default function EnrollmentDatasetSettingsContents({
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
