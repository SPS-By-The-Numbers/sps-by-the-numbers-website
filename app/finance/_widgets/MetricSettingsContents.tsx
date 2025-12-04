import ALL_DISTRICTS from "app/finance/_domain/ccddd";
import CurrencyNormalizationSelector from "app/finance/_widgets/CurrencyNormalizationSelector";
import DistrictSelector from "app/finance/_widgets/DistrictSelector";
import StaffingNormalizationSelector from "app/finance/_widgets/StaffingNormalizationSelector";

import type {
  CurrencyNormalization,
  StaffingNormalization,
} from "utilities/ChartableMetrics";
import type { BaseSettings } from "app/finance/_widgets/SettingsContents";

export interface MetricSettings extends BaseSettings {
  ccddd: number;
  currencyNormalization: CurrencyNormalization;
  staffingNormalization: StaffingNormalization;
}

export const DEFAULT_METRIC_SETTINGS: Array<MetricSettings> = [
  {
    id: "primary",
    ccddd: 17001,
    currencyNormalization: "amount" as const,
    staffingNormalization: "fte" as const,
  },
].map((e) => ({ ...e, name: ALL_DISTRICTS[e.ccddd].district }));

export default function MetricSettingsContents({
  settings,
  setSettings,
}: {
  settings: MetricSettings;
  setSettings: (x: MetricSettings) => void;
}) {
  return (
    <>
      <DistrictSelector
        ccddd={settings.ccddd}
        onChange={(ccddd) =>
          setSettings(Object.assign({}, settings, { ccddd }))
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
