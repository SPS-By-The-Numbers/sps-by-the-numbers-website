import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import EnrollmentGradeLevelFilter from "app/finance/_filteritems/enrollment_grade_level";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { GradeLevelFilters } from "utilities/DistrictData";

interface Props<T extends BaseSettings> {
  contextSettings?: BaseSettings;
  settings: T;
  setSettings: (x: T) => void;
}

// Grade-level filter scoped to enrollment: excludes the synthetic
// "All Grades" rollup (would double-count) and includes PK.
export default function EnrollmentGradeLevelFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & GradeLevelFilters>) {
  return (
    <RichTreeView
      checkboxSelection
      multiSelect
      selectedItems={EnrollmentGradeLevelFilter.codesToTreeViewItems(settings.gradeLevelCodes)}
      onSelectedItemsChange={(_e, selected) =>
        setSettings({
          ...settings,
          gradeLevelCodes: EnrollmentGradeLevelFilter.treeViewItemsToCodes(selected),
        })
      }
      selectionPropagation={{ descendants: true, parents: true }}
      items={EnrollmentGradeLevelFilter.treeViewItems()}
      sx={{
        "& .MuiRichTreeView-itemLabel": {
          fontSize: "0.85rem",
        },
      }}
    />
  );
}
