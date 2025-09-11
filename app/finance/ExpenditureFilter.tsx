'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import SafsObjectsTreeItems from 'app/finance/SafsObjectsTreeItems.json';
import SpsActivityCategoryTreeItems from 'app/finance/SpsActivityCategoryTreeItems.json';
import SpsProgramGroupingTreeItems from 'app/finance/SpsProgramGroupingTreeItems.json';

// Iterates a TreeViewBaseItem and extracts all IDs with a given prefix.
// Used to generate default selection.
function allItems(config, prefix) {
  // TODO: This does not get the roll-up items to top level categories
  const nodes = [...config];  // Take copy of input 
  const itemIds = new Array<string>;
  while (nodes.length > 0) {
    const n = nodes.pop();
    if (n.id.startsWith(prefix)) {
      itemIds.push(n.id);
    }

    if (n.children && n.children.length > 0) {
      nodes.push(...n.children);
    }
  }

  return itemIds;
};

export const ALL_OBJECT_ITEMS = allItems(SafsObjectsTreeItems, "obj-");
export const ALL_ACTIVITY_ITEMS = allItems(SpsActivityCategoryTreeItems, "act-");
export const ALL_PROGRAM_ITEMS = allItems(SpsProgramGroupingTreeItems, "prog-");

export type ExpenditureFilterState = {
  selectedObjects: string[];
  setSelectedObjects: (x: string[]) => void;
  selectedActivities: string[];
  setSelectedActivities: (x: string[]) => void;
  selectedPrograms: string[];
  setSelectedPrograms: (x: string[]) => void;
};

function FilterTree({title, items, selectedItems, setSelectedItems}) {
  return (
    <Stack>
      <RichTreeView
        checkboxSelection
        multiSelect
        selectedItems={selectedItems}
        onSelectedItemsChange={(e,i) => setSelectedItems(i)}
        selectionPropagation={{descendants: true, parents: true}}
        items={items} />
    </Stack>
  );
}

type FilterState = {
  selectedObjects: string[];
  setSelectedObjects: (x: string[]) => void;

  selectedActivities: string[];
  setSelectedActivities: (x: string[]) => void;

  selectedPrograms: string[];
  setSelectedPrograms: (x: string[]) => void;
};

export default function ExpenditureFilter({filterState} : { filterState: FilterState }) {
  const {selectedObjects, setSelectedObjects} = filterState;
  const {selectedActivities, setSelectedActivities} = filterState;
  const {selectedPrograms, setSelectedPrograms} = filterState;

  return (
    <Paper>
      <Stack>
        <Typography component="h2" variant="h2" textAlign="center" style={{fontSize: "1.4rem"}}>Filters</Typography>
          <Stack direction="row" justifyContent="space-between">
            <FilterTree
              title="Object"
              items={SafsObjectsTreeItems}
              selectedItems={selectedObjects}
              setSelectedItems={setSelectedObjects} />
            <FilterTree
              title="Activity"
              items={SpsActivityCategoryTreeItems}
              selectedItems={selectedActivities}
              setSelectedItems={setSelectedActivities} />
            <FilterTree
              title="Program"
              items={SpsProgramGroupingTreeItems}
              selectedItems={selectedPrograms}
              setSelectedItems={setSelectedPrograms} />
          </Stack>
      </Stack>
    </Paper>
  );
}
