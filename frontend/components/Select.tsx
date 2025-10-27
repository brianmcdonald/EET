
import React from 'react';
import { FormControl, InputLabel, Select as MuiSelect, MenuItem, FormHelperText, Box } from '@mui/material';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
  labelHint?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({ label, name, value, onChange, options, required = false, labelHint, error }) => {
  const fullLabel = labelHint ? `${label} (${labelHint})` : label;

  // Wrapper to convert MUI Select onChange to match the expected signature
  const handleChange = (event: any) => {
    onChange(event as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <FormControl fullWidth error={!!error} required={required} variant="outlined" size="medium">
      <InputLabel id={`${name}-label`}>{fullLabel}</InputLabel>
      <MuiSelect
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        label={fullLabel}
        renderValue={(selected) => {
          const selectedOption = options.find(opt => opt.value === selected);
          return <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedOption?.label || ''}</Box>;
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400,
            }
          }
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
