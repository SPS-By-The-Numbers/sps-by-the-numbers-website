import ALL_SCHOOLS from "app/finance/_domain/schools_data";

import type { TreeViewBaseItem } from "@mui/x-tree-view";
export type { SchoolInfo, SchoolMap } from "app/finance/_domain/schools_data";

export function sortBySchoolName(a, b) {
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

export function makeSchools(ccddd) {
  const schools = ALL_SCHOOLS[ccddd];
  const schoolItems = new Array<TreeViewBaseItem>();
  for (const s of schools.sort(sortBySchoolName)) {
    schoolItems.push({
      id: `school-${s.school_code}`,
      label: s.school,
    });
  }
  return [
    {
      id: "all",
      label: "All Schools",
      children: schoolItems,
    },
  ];
}
