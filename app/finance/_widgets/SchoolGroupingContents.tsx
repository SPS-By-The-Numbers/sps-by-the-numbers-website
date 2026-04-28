import SettingsSelect from "app/finance/_widgets/SettingsSelect";

import type { BaseFacetContextSettings } from "app/finance/_settings/common_context_settings";

const SCHOOL_GROUPING_OPTIONS = {
  region: "Region",
  ms_assignment_code: "Middle School Area",
};

export default function SchoolGroupingContents<SettingsType extends BaseFacetContextSettings>(props: {
  settings: SettingsType;
  setSettings: (x: SettingsType) => void;
}) {
  return (
    <SettingsSelect
      {...props}
      label="School Grouping"
      fieldName="schoolGrouping"
      options={SCHOOL_GROUPING_OPTIONS}
    />
  );
}
