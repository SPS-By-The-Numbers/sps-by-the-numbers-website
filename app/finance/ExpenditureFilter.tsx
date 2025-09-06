'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import type { FilterSelection } from 'app/finance/[mode]/[ccddd]/ExpendituresConfig';

export type ExpenditureFilterState = {
  selectedObjects: string[];
  setSelectedObjects: (x: string[]) => void;
  selectedActivities: string[];
  setSelectedActivities: (x: string[]) => void;
  selectedPrograms: string[];
  setSelectedPrograms: (x: string[]) => void;
};

const OSPI_OBJECTS: TreeViewBaseItem[] = [
  {
    id: 'cat-compensation',
    label: 'Compensation',
    children: [
      {
          id: 'subcat-salary',
          label: 'Salary',
          children: [
              {
                  id: 'obj-2',
                  label: 'Certificated',
              },
              {
                  id: 'obj-3',
                  label: 'Classified',
              },
          ]
      },
      { id: 'obj-4', label: 'Benefits + Payroll Taxes' },
    ],
  },
  {
    id: 'cat-non-comp',
    label: 'Non-Compensation',
    children: [
      { id: 'obj-5', label: 'Supplies' },
      { id: 'obj-7', label: 'Purchased Services' },
      { id: 'obj-8', label: 'Travel' },
      { id: 'obj-9', label: 'Capital Outlay' },
    ],
  },
  {
    id: 'cat-transfers',
    label: 'Transfers*',
    children: [
      { id: '0', label: 'Debit Transfer' },
      { id: '1', label: 'Credit Transfer' },
    ],
  },
];

const OSPI_ACTIVITIES: TreeViewBaseItem[] = [
  {
    id: 'cat-compensation',
    label: 'Compensation',
    children: [
      {
          id: 'subcat-salary',
          label: 'Salary',
          children: [
              {
                  id: 'act-2',
                  label: '3',
              },
              {
                  id: 'act-3',
                  label: 'Classified',
              },
          ]
      },
      { id: 'act-4', label: 'Benefits + Payroll Taxes' },
    ],
  },
  {
    id: 'cat-non-comp',
    label: 'Non-Compensation',
    children: [
      { id: 'act-5', label: 'Supplies' },
      { id: 'act-7', label: 'Purchased Services' },
      { id: 'act-8', label: 'Travel' },
      { id: 'act-9', label: 'Capital Outlay' },
    ],
  },
  {
    id: 'cat-transfers',
    label: 'Transfers*',
    children: [
      { id: 'act-0', label: 'Debit Transfer' },
      { id: 'act-1', label: 'Credit Transfer' },
    ],
  },
];

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

type FilterState = FilterSelection & {
  setSelectedObjects: (x: string[]) => void;
  setSelectedActivities: (x: string[]) => void;
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
              items={OSPI_OBJECTS}
              selectedItems={selectedObjects}
              setSelectedItems={setSelectedObjects} />
            <FilterTree
              title="Activity"
              items={OSPI_OBJECTS}
              selectedItems={selectedActivities}
              setSelectedItems={setSelectedActivities} />
            <FilterTree
              title="Program"
              items={OSPI_OBJECTS}
              selectedItems={selectedPrograms}
              setSelectedItems={setSelectedPrograms} />
          </Stack>
      </Stack>
    </Paper>
  );
}
