import { makeDutyRootItems } from "app/finance/_domain/DutyRoots";
import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import ActivityFilter from "app/finance/_filteritems/activity";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import Switch from "@mui/material/Switch";

import type { PFilters, AFilters, OFilters, SchoolFilters } from "utilities/DistrictData";
import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { MetricSettings } from "app/finance/_settings/metric_settings";
import type { TreeViewBaseItem } from "@mui/x-tree-view";

interface Props<T extends BaseSettings, U extends BaseSettings = T> {
  sharedSettings?: U,
  settings: T;
  setSettings: (x: T) => void;
}

interface OverridePrimaryFilterSettings extends BaseSettings {
  overridePrimaryFilter: boolean;
}

// Component for showing one filter.
function FilterTree({ title, items, selectedItems, setSelectedItems }) {
  return (
    <RichTreeView
      checkboxSelection
      multiSelect
      selectedItems={selectedItems}
      onSelectedItemsChange={(e, i) => setSelectedItems(i)}
      selectionPropagation={{ descendants: true, parents: true }}
      items={items}
      sx={{
        "& .MuiRichTreeView-itemLabel": {
          fontSize: "0.85rem",
        },
      }}
    />
  );
}

export function OverridePrimaryFilterContents({
  settings,
  setSettings,
}: Props<OverridePrimaryFilterSettings>) {
  return (
    <FormGroup sx={{ marginX: "0.5rem" }}>
      <FormControlLabel
        label="Override PAO Filters"
        control={
          <Switch
            checked={settings.overridePrimaryFilter}
            size="small"
            onChange={(e) =>
              setSettings({
                ...settings,
                overridePrimaryFilter: e.target.checked,
              })
            }
          />
        }
      />
    </FormGroup>
  );
}

// Settings component to render selection of objects.
export function ObjectFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & OFilters>) {
  return (
    <FilterTree
      title="Object"
      items={ObjectFilter.treeViewItems()}
      selectedItems={ObjectFilter.codesToTreeViewItems(settings.objectCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          objectCodes: ObjectFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}

// Settings component to render selection of activites.
export function ActivityFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & AFilters>) {
  return (
    <FilterTree
      title="Activity"
      items={ActivityFilter.treeViewItems()}
      selectedItems={ActivityFilter.codesToTreeViewItems(settings.activityCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          activityCodes: ActivityFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}

// Settings component to render selection of programs.
export function ProgramFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & PFilters>) {
  return (
    <FilterTree
      title="Program"
      items={ProgramFilter.treeViewItems()}
      selectedItems={ProgramFilter.codesToTreeViewItems(settings.programCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          programCodes: ProgramFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}

// Settings component to render selection of schools.
export function SchoolFilterContents({
  settings,
  setSettings,
}: Props<MetricSettings & SchoolFilters>) {
  const schoolFilter = makeSchoolFilter(settings.ccddd);

  return (
    <FilterTree
      title="School"
      items={schoolFilter.treeViewItems()}
      selectedItems={schoolFilter.codesToTreeViewItems(settings.schoolCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          schoolCodes: schoolFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}
