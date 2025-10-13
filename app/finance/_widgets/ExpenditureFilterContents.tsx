import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { makeSchools } from 'app/finance/_domain/schools';
import { makeDutyRootItems } from 'app/finance/_domain/DutyRoots';
import SafsCompObjectsTreeItems from 'app/finance/_treeitems/SafsCompObjectsTreeItems.json';
import SafsObjectsTreeItems from 'app/finance/_treeitems/SafsObjectsTreeItems.json';
import SpsActivityCategoryTreeItems from 'app/finance/_treeitems/SpsActivityCategoryTreeItems.json';
import SpsProgramGroupingTreeItems from 'app/finance/_treeitems/SpsProgramGroupingTreeItems.json';

import type { BaseSettings } from 'app/finance/_widgets/SettingsContents';
import type { MetricSettings } from 'app/finance/_widgets/MetricSettingsContents';
import type { TreeViewBaseItem } from '@mui/x-tree-view';

interface Props<T extends BaseSettings> {
  settings: T;
  setSettings: (x: T) => void;
}

interface ObjectFilterSettings extends BaseSettings {
  selectedObjects: string[];
};

interface ActivityFilterSettings extends BaseSettings {
  selectedActivities: string[];
};

interface ProgramFilterSettings extends BaseSettings {
  selectedPrograms: string[];
};

interface SchoolFilterSettings extends MetricSettings {
  selectedSchools: string[];
};

export function extractCodes(prefix, selectedItems) {
  const selectedCodes = new Array<number>;
  for (const id of selectedItems) {
    const parts = id.split('-');
    if (parts.length === 2 && parts[0] === prefix) {
      selectedCodes.push(parseInt(parts[1]));
    }
  }
  return selectedCodes;
}

// Iterates a TreeViewBaseItem and extracts all IDs with a given prefix.
// Used to generate default selection.
export function allItems(config) {
  const nodes = [...config];  // Take copy of input 
  const itemIds = new Array<string>;
  while (nodes.length > 0) {
    const n = nodes.pop();
    itemIds.push(n.id);

    if (n.children && n.children.length > 0) {
      nodes.push(...n.children);
    }
  }

  return itemIds;
};

export function makeSchoolItems(ccddd) {
  return allItems(makeSchools(ccddd));
}

export const ALL_DUTY_ROOT_ITEMS = allItems(makeDutyRootItems());
export const ALL_COMP_OBJECT_ITEMS = allItems(SafsCompObjectsTreeItems);
export const ALL_OBJECT_ITEMS = allItems(SafsObjectsTreeItems);
export const ALL_ACTIVITY_ITEMS = allItems(SpsActivityCategoryTreeItems);
export const ALL_PROGRAM_ITEMS = allItems(SpsProgramGroupingTreeItems);


function FilterTree({title, items, selectedItems, setSelectedItems}) {
  return (
    <RichTreeView
      checkboxSelection
      multiSelect
      selectedItems={selectedItems}
      onSelectedItemsChange={(e,i) => setSelectedItems(i)}
      selectionPropagation={{descendants: true, parents: true}}
      items={items}
      sx={{
        "& .MuiRichTreeView-itemLabel": {
          fontSize: "0.85rem",
        },
      }}
      />
  );
}

export function ObjectFilterContents({settings, setSettings} : Props<ObjectFilterSettings>) {
  return (
      <FilterTree
        title="Object"
        items={SafsObjectsTreeItems}
        selectedItems={settings.selectedObjects}
        setSelectedItems={selectedObjects => setSettings({...settings, selectedObjects})} />
  );
}

export function ActivityFilterContents({settings, setSettings} : Props<ActivityFilterSettings>) {
  return (
      <FilterTree
        title="Activity"
        items={SpsActivityCategoryTreeItems}
        selectedItems={settings.selectedActivities}
        setSelectedItems={selectedActivities => setSettings({...settings, selectedActivities})} />
  );
}

export function ProgramFilterContents({settings, setSettings} : Props<ProgramFilterSettings>) {
  return (
      <FilterTree
        title="Program"
        items={SpsProgramGroupingTreeItems}
        selectedItems={settings.selectedPrograms}
        setSelectedItems={selectedPrograms => setSettings({...settings, selectedPrograms})} />
  );
}

export function SchoolFilterContents({settings, setSettings} : Props<SchoolFilterSettings>) {
  const items = makeSchools(settings.ccddd);

  return (
      <FilterTree
        title="School"
        items={items}
        selectedItems={settings.selectedSchools}
        setSelectedItems={selectedSchools => setSettings({...settings, selectedSchools})} />
  );
}
