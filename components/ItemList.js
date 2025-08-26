import { useCallback } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const ListItem = ({ itemId, active, name, toggleActive, color }) => {
  const handleChange = useCallback(() => toggleActive(itemId), [itemId, toggleActive]);
  return (
    <li
      className="flex items-stretch justify-items-stretch text-sm"
      style={{ background: color }}
    >
      {/* I think the linter is wrong here — the input is a child of the label and that should
      be fine. */}
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="flex-1 px-2 py-0.5 whitespace-nowrap cursor-pointer">
        <input
          type="checkbox"
          className="mr-2"
          checked={active}
          onChange={handleChange}
        />
        {name}
      </label>
    </li>
  );
};

export default function ItemList({
  items,
  toggleActive,
  onOption,
}) {
  return (
    <div className="space-y-1">
      <ul className="divide-y divide-white bg-gray-100 shadow-lg">
        {Object.values(items).filter(d => d.type === 'item').map(({ itemId, name, active, color }, i) => (
          <ListItem
            key={itemId}
            itemId={itemId}
            name={name}
            active={active}
            toggleActive={toggleActive}
            color={active ? color : undefined}
          />
        ))}
        {Object.values(items).filter(d => d.type === 'option').map(({itemId, name, options, value}, i) => (
          <div key={`${itemId}-option`} style={{ background: 'cyan' }}>
            <label htmlFor={itemId}>{name}</label>
            <Autocomplete
              multiple
              key={itemId}
              options={options}
              value={value}
              onChange={(_, newValue) => onOption(itemId, newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className="filter-select"
                  variant="outlined"
                  label="Select options"
                />
              )}
            />
          </div>
        ))}
      </ul>
    </div>
  );
}

