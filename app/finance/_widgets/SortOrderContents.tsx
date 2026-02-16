import SettingsSelect from "app/finance/_widgets/SettingsSelect";
import * as ChartOptions from "utilities/ChartOptions";

import type { BaseSettings } from "app/finance/_settings/base_settings";

export default function SortOrderContents<SettingsType extends BaseSettings>(props: {
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;
}) {
  const {settings, setSettings} = props;

  return (
    <>
      <SettingsSelect
        {...props}
        label="Sort Type"
        fieldName="sortType"
        options={ChartOptions.SORT_TYPE_OPTIONS}
      />
      <SettingsSelect
        {...props}
        label="Sort Order"
        fieldName="sortOrder"
        options={ChartOptions.SORT_ORDER_OPTIONS}
      />
    </>
  );
}

