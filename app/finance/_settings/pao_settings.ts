// Fitlers for Program, Activity, and Object codes.
//
// Values are arrays of TreeView item strings suitable for a rich-test filter.
// Look at Filter.toTreeViewItems() for converting back and forth.

import ProgramFilter from "app/finance/_filteritems/program";
import ActivityFilter from "app/finance/_filteritems/activity";
import ObjectFilter from "app/finance/_filteritems/object";
import {
  serializeSettingsDict,
  deserializeSettingsDict,
} from "utilities/settings";

import type { PAFilters, PAOFilters } from "utilities/DistrictData";

// Defaults for the filter.
export const DEFAULT_PA_FILTERS : PAFilters = {
  activityCodes: ActivityFilter.allCodes(),
  programCodes: ProgramFilter.allCodes(),
};

export const DEFAULT_PAO_FILTERS : PAOFilters = {
  ...DEFAULT_PA_FILTERS,
  objectCodes: ObjectFilter.allCodes(),
};
