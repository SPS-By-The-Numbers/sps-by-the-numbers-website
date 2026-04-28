import { makeSchoolFilter } from "app/finance/_filteritems/school";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import ActivityFilter from "app/finance/_filteritems/activity";
import AssessmentTypeFilter from "app/finance/_filteritems/assessment_type";
import FormControlLabel from "@mui/material/FormControlLabel";
import DutyRootFilter from "app/finance/_filteritems/duty_root";
import GradeLevelFilter from "app/finance/_filteritems/grade_level";
import FormGroup from "@mui/material/FormGroup";
import NcesFilter from "app/finance/_filteritems/nces";
import ObjectFilter from "app/finance/_filteritems/object";
import ProgramFilter from "app/finance/_filteritems/program";
import StudentGroupFilter from "app/finance/_filteritems/student_group";
import Switch from "@mui/material/Switch";
import TestSubjectFilter from "app/finance/_filteritems/test_subject";

import type { PFilters, AFilters, OFilters, SchoolFilters, DutyRootFilters, NcesFilters, GradeLevelFilters, TestAdministrationFilters, StudentGroupFilters, TestSubjectFilters } from "utilities/DistrictData";
import type { BaseSettings } from "app/finance/_settings/base_settings";
import type { BaseFacetContextSettings } from "app/finance/_settings/common_context_settings";
import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

interface Props<T extends BaseSettings, U extends BaseSettings = BaseSettings> {
  contextSettings?: U,
  settings: T;
  setSettings: (x: T) => void;
}

type OverridePrimaryFilterSettings = BaseSettings & {
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
  contextSettings,
  settings,
  setSettings,
}: Props<DatasetSettings & SchoolFilters, BaseFacetContextSettings>) {
  const schoolFilter = makeSchoolFilter(settings.ccddd, contextSettings?.schoolGrouping);

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

// Settings component to render differnet duty titles from the s275.
export function DutyRootFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & DutyRootFilters>) {
  return (
    <FilterTree
      title="Duty Root"
      items={DutyRootFilter.treeViewItems()}
      selectedItems={DutyRootFilter.codesToTreeViewItems(settings.dutyRootCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          dutyRootCodes: DutyRootFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}

// Settings component to filter out actuals by NCES spending code.
export function NcesFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & NcesFilters>) {
  return (
    <FilterTree
      title="Nces"
      items={NcesFilter.treeViewItems()}
      selectedItems={NcesFilter.codesToTreeViewItems(settings.ncesCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          ncesCodes: NcesFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}

// Settings component to render selection of grade levels.
export function GradeLevelFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & GradeLevelFilters>) {
  return (
    <FilterTree
      title="Grade Level"
      items={GradeLevelFilter.treeViewItems()}
      selectedItems={GradeLevelFilter.codesToTreeViewItems(settings.gradeLevelCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          gradeLevelCodes: GradeLevelFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}

// Settings component to render selection of assessment types.
export function AssessmentTypeFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & TestAdministrationFilters>) {
  return (
    <FilterTree
      title="Assessment Type"
      items={AssessmentTypeFilter.treeViewItems()}
      selectedItems={AssessmentTypeFilter.codesToTreeViewItems(settings.testAdministrationCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          testAdministrationCodes: AssessmentTypeFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}

// Settings component to render selection of student groups.
export function StudentGroupFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & StudentGroupFilters>) {
  return (
    <FilterTree
      title="Student Group"
      items={StudentGroupFilter.treeViewItems()}
      selectedItems={StudentGroupFilter.codesToTreeViewItems(settings.studentGroupCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          studentGroupCodes: StudentGroupFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}

// Settings component to render selection of test subjects.
export function TestSubjectFilterContents({
  settings,
  setSettings,
}: Props<BaseSettings & TestSubjectFilters>) {
  return (
    <FilterTree
      title="Test Subject"
      items={TestSubjectFilter.treeViewItems()}
      selectedItems={TestSubjectFilter.codesToTreeViewItems(settings.testSubjectCodes)}
      setSelectedItems={selected =>
        setSettings({
          ...settings,
          testSubjectCodes: TestSubjectFilter.treeViewItemsToCodes(selected)
        })
      }
    />
  );
}
