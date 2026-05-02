import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import EnrollmentStudentGroupFilter from "app/finance/_filteritems/enrollment_datasets";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { StudentGroupFilters } from "utilities/DistrictData";

interface Props<T extends BaseSettings> {
  contextSettings?: BaseSettings;
  settings: T;
  setSettings: (x: T) => void;
}

// Enrollment-side student-group filter: a tree-checkbox selector
// scoped to the rc_enrollment column codes. Picks which group columns
// are folded into long form before charting.
export default function EnrollmentStudentGroupFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & StudentGroupFilters>) {
  return (
    <RichTreeView
      checkboxSelection
      multiSelect
      selectedItems={EnrollmentStudentGroupFilter.codesToTreeViewItems(settings.studentGroupCodes)}
      onSelectedItemsChange={(_e, selected) =>
        setSettings({
          ...settings,
          studentGroupCodes: EnrollmentStudentGroupFilter.treeViewItemsToCodes(selected),
        })
      }
      selectionPropagation={{ descendants: true, parents: true }}
      items={EnrollmentStudentGroupFilter.treeViewItems()}
      sx={{
        "& .MuiRichTreeView-itemLabel": {
          fontSize: "0.85rem",
        },
      }}
    />
  );
}
