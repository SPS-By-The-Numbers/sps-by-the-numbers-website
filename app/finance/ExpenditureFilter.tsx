'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import SafsObjectsTreeItems from 'app/finance/SafsObjectsTreeItems.json';
import SpsActivityCategoryTreeItems from 'app/finance/SpsActivityCategoryTreeItems.json';
import SpsProgramGroupingTreeItems from 'app/finance/SpsProgramGroupingTreeItems.json';

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
      <Typography component="h3" variant="h3" textAlign="left" style={{fontSize: "1.1rem"}}>{title}</Typography>
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
          <Stack direction="row">
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
