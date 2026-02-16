import SettingsSelect from "app/finance/_widgets/SettingsSelect";
import * as ChartOptions from "utilities/ChartOptions";

import type { BaseSettings } from "app/finance/_settings/base_settings";

export default function YScaleContents<SettingsType extends BaseSettings>(props: {
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;
}) {
  const {settings, setSettings} = props;

  return (
    <SettingsSelect
      {...props}
      label="YScale"
      fieldName="yScale"
      options={ChartOptions.YSCALES_OPTIONS}
    />
  );
}


