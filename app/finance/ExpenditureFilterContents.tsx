'use client';

import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import SafsCompObjectsTreeItems from 'app/finance/SafsCompObjectsTreeItems.json';
import SafsObjectsTreeItems from 'app/finance/SafsObjectsTreeItems.json';
import SpsActivityCategoryTreeItems from 'app/finance/SpsActivityCategoryTreeItems.json';
import SpsProgramGroupingTreeItems from 'app/finance/SpsProgramGroupingTreeItems.json';

import type { DatasetSettings } from 'app/finance/SettingsContents';

interface Props<T extends DatasetSettings> {
  datasetSettings: T;
  setDatasetSettings: (x: T) => void;
}

interface ObjectFilterSettings extends DatasetSettings {
  selectedObjects: string[];
};

interface ActivityFilterSettings extends DatasetSettings {
  selectedActivities: string[];
};

interface ProgramFilterSettings extends DatasetSettings {
  selectedPrograms: string[];
};

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

export const ALL_SCHOOL_ITEMS = allItems(SafsObjectsTreeItems);
export const ALL_DUTY_ROOT_ITEMS = allItems(SafsObjectsTreeItems);
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

export function ObjectFilterContents({datasetSettings, setDatasetSettings} : Props<ObjectFilterSettings>) {
  return (
      <FilterTree
        title="Object"
        items={SafsObjectsTreeItems}
        selectedItems={datasetSettings.selectedObjects}
        setSelectedItems={selectedObjects => setDatasetSettings({...datasetSettings, selectedObjects})} />
  );
}

export function ActivityFilterContents({datasetSettings, setDatasetSettings} : Props<ActivityFilterSettings>) {
  return (
      <FilterTree
        title="Activity"
        items={SpsActivityCategoryTreeItems}
        selectedItems={datasetSettings.selectedActivities}
        setSelectedItems={selectedActivities => setDatasetSettings({...datasetSettings, selectedActivities})} />
  );
}

export function ProgramFilterContents({datasetSettings, setDatasetSettings} : Props<ProgramFilterSettings>) {
  return (
      <FilterTree
        title="Program"
        items={SpsProgramGroupingTreeItems}
        selectedItems={datasetSettings.selectedPrograms}
        setSelectedItems={selectedPrograms => setDatasetSettings({...datasetSettings, selectedPrograms})} />
  );
}
