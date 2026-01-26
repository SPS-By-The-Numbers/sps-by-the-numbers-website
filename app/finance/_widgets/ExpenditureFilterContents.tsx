import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { makeSchools } from "app/finance/_domain/schools";
import { makeDutyRootItems } from "app/finance/_domain/DutyRoots";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ProgramFilter from "app/finance/_filteritems/program";
import ActivityFilter from "app/finance/_filteritems/activity";
import ObjectFilter from "app/finance/_filteritems/object";

import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { MetricSettings } from "app/finance/_widgets/MetricSettingsContents";
import type { TreeViewBaseItem } from "@mui/x-tree-view";

interface Props<T extends BaseSettings> {
  settings: T;
  setSettings: (x: T) => void;
}

interface OverridePrimaryFilterSettings extends BaseSettings {
  overridePrimaryFilter: boolean;
}

interface ObjectFilterSettings extends BaseSettings {
  selectedObjects: string[];
}

interface ActivityFilterSettings extends BaseSettings {
  selectedActivities: string[];
}

interface ProgramFilterSettings extends BaseSettings {
  selectedPrograms: string[];
}

interface SchoolFilterSettings extends MetricSettings {
  selectedSchools: string[];
}

// Takes a set list of RichTreeView item settings and extracts the code for it.
//
// The RichTreeView items have the form obj-1 or act-22 which is
// object_code 1 and activity_code 2.  prefix is used to identify the code.
//
// It is not possible to just split by '-' and then take the second element as
// RichTreeView will have grouping items also that need to recork their selected
// state. Our convention is to use a different prefix so they can be filtered out.
export function extractCodes(prefix, selectedItems) {
  const selectedCodes = new Array<number>();
  for (const id of selectedItems) {
    const parts = id.split("-");
    if (parts.length === 2 && parts[0] === prefix) {
      selectedCodes.push(parseInt(parts[1]));
    }
  }
  return selectedCodes;
}

// Iterates a TreeViewBaseItem and extracts all IDs.
//
// Mostly used to generate default selection of all items.
export function allItems(config) {
  const nodes = [...config]; // Take copy of input
  const itemIds = new Array<string>();
  while (nodes.length > 0) {
    const n = nodes.pop();
    itemIds.push(n.id);

    if (n.children && n.children.length > 0) {
      nodes.push(...n.children);
    }
  }

  return itemIds;
}

export function makeSchoolItems(ccddd) {
  return allItems(makeSchools(ccddd));
}

export const ALL_DUTY_ROOT_ITEMS = allItems(makeDutyRootItems());
export const ALL_OBJECT_ITEMS = allItems(ObjectFilter.treeViewItems());
export const ALL_ACTIVITY_ITEMS = allItems(ActivityFilter.treeViewItems());
export const ALL_PROGRAM_ITEMS = allItems(ProgramFilter.treeViewItems());

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
}: Props<ObjectFilterSettings>) {
  return (
    <FilterTree
      title="Object"
      items={ObjectFilter.treeViewItems()}
      selectedItems={settings.selectedObjects}
      setSelectedItems={(selectedObjects) =>
        setSettings({ ...settings, selectedObjects })
      }
    />
  );
}

// Settings component to render selection of activites.
export function ActivityFilterContents({
  settings,
  setSettings,
}: Props<ActivityFilterSettings>) {
  return (
    <FilterTree
      title="Activity"
      items={ActivityFilter.treeViewItems()}
      selectedItems={settings.selectedActivities}
      setSelectedItems={(selectedActivities) =>
        setSettings({ ...settings, selectedActivities })
      }
    />
  );
}

// Settings component to render selection of programs.
export function ProgramFilterContents({
  settings,
  setSettings,
}: Props<ProgramFilterSettings>) {
  return (
    <FilterTree
      title="Program"
      items={ProgramFilter.treeViewItems()}
      selectedItems={settings.selectedPrograms}
      setSelectedItems={(selectedPrograms) =>
        setSettings({ ...settings, selectedPrograms })
      }
    />
  );
}

// Settings component to render selection of schools.
export function SchoolFilterContents({
  settings,
  setSettings,
}: Props<SchoolFilterSettings>) {
  const items = makeSchools(settings.ccddd);

  return (
    <FilterTree
      title="School"
      items={items}
      selectedItems={settings.selectedSchools}
      setSelectedItems={(selectedSchools) =>
        setSettings({ ...settings, selectedSchools })
      }
    />
  );
}
