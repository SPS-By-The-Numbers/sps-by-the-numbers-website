import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import ALL_SCHOOLS from './schools';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { allItems } from 'app/finance/ExpenditureFilter';

import type { SchoolMap } from './schools';
import type { TreeViewBaseItem } from '@mui/x-tree-view/models';

type Params = {
  ccddd: number;
  selectedSchools: string[],
  setSelectedSchools: (x: string[]) => void;
};

function sortByName(a, b) {
  if (a.is_district_office && !b.is_district_office) {
    return -1;
  }

  if (!a.is_district_office && b.is_district_office) {
    return 1;
  }

  if (a.school < b.school) {
    return -1;
  }

  if (a.school > b.school) {
    return 1;
  }

  return 0;
}

function makeSchools(ccddd) {
  const schools = ALL_SCHOOLS[ccddd];
  const schoolItems = new Array<TreeViewBaseItem>;
  for (const s of schools.sort(sortByName)) {
    schoolItems.push({
      id: `school-${s.school_code}`,
      label: s.school,
    });
  }
  return [
    {
      id: 'all',
      label: 'All Schools',
      children: schoolItems,
    }
  ];
}

export function getSchoolItems(ccddd) {
  return allItems(makeSchools(ccddd));
}

export default function SchoolFilter({ccddd, selectedSchools, setSelectedSchools} : Params) {
  const items = makeSchools(ccddd);

  return (
      <RichTreeView
        checkboxSelection
        multiSelect
        selectedItems={selectedSchools}
        onSelectedItemsChange={(e,i) => setSelectedSchools(i)}
        selectionPropagation={{descendants: true, parents: true}}
        items={items} />
  );
}
