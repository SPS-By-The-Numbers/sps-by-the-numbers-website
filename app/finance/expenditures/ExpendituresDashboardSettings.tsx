'use client';

import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import { useId } from 'react';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import type { CommonSharedSettings } from 'app/finance/_widgets/CommonSharedSettingsContents';
import type { SettingsContentsProps } from 'app/finance/_widgets/SettingsContents';
import type { SortOrder, SortType } from 'utilities/ChartableMetrics';

const ALL_FACETS = ["activity", "program", "object", "nces", "school"];
type Facet = typeof ALL_FACETS[number];
const FACET_OPTIONS : Record<Facet, string> = {
  "activity": "Activity",
  "program": "Program",
  "object": "Object",
  "nces": "NCES (actuals only)",
  "school": "School (actuals only)",
};

const SORT_ORDER_OPTIONS : Record<SortOrder, string> = {
  "ascending": "Ascending",
  "descending": "Descending",
};

const SORT_TYPE_OPTIONS : Record<SortType, string> = {
  "variance": "Variance",
  "latest": "Latest Year",
};

export interface ExpendituresDashboardSettings extends CommonSharedSettings {
  facet: Facet;
  sortOrder: SortOrder;
  sortType: SortType;
  alwaysZeroY: boolean;
  freeYScale: boolean;
};

interface SettingsSelectProps<T> {
  label: string;
  settings: T;
  setSettings: (x: T) => void;
  fieldName: string;
  options: Record<string, string>;
};

function SettingsSelect<T>({label, settings, setSettings, fieldName, options} : SettingsSelectProps<T>) {
  const id = useId();
  const labelId = useId();

  const items = Object.entries(options).map(([facet, label]) => (<MenuItem key={facet} value={facet}>{label}</MenuItem>));

  return (
    <FormControl size="small">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        value={settings[fieldName]}
        label={label}
        onChange={e => setSettings({...settings, [fieldName]: e.target.value})}
      >
        {items}
      </Select>
    </FormControl>
  );
}

function SettingsToggleGroup<T>({label, settings, setSettings, fieldName, options} : SettingsSelectProps<T>) {
  const id = useId();
  const labelId = useId();

  const items = Object.entries(options).map(([v, l]) => (
    <ToggleButton key={v} value={v} aria-label={l}> {l} </ToggleButton>
  ));
  console.log(items);
  console.log(settings[fieldName], settings);

  return (
    <ToggleButtonGroup
      color="primary"
      value={settings[fieldName]}
      exclusive
      onChange={(_, v) => {
        if (v !== null) {
          setSettings({...settings, [fieldName]: v});
        }
      }}
      aria-label={label}
    >
      {items}
    </ToggleButtonGroup>
  );
}

function SettingsSwitch({label, settings, setSettings, fieldName}) {
  return (
    <FormControl size="small">
      <FormControlLabel
        label={label}
        labelPlacement="start"
        control={
          <Switch
            checked={settings[fieldName]}
            onChange={e => setSettings({...settings, [fieldName]: e.target.checked})}
          />
        }
      />
    </FormControl>
  );
}

export default function ExpendituresDashboardSettingsContents(props : SettingsContentsProps<ExpendituresDashboardSettings>) {
  return (
    <>
      <SettingsSelect {...props} label="Facet" fieldName="facet" options={FACET_OPTIONS} />
      <SettingsToggleGroup {...props} label="Sort Type" fieldName="sortType" options={SORT_TYPE_OPTIONS} />
      <SettingsSelect {...props} label="Sort Order" fieldName="sortOrder" options={SORT_ORDER_OPTIONS} />
      <SettingsSwitch {...props} label="Free Y Scales" fieldName="freeYScale" />
      <SettingsSwitch {...props} label="Disable Chart" fieldName="disableChartUpdate" />
    </>
  );
}
