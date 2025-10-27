
import React from 'react';
import { TextField } from '@mui/material';

interface InputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  isTextArea?: boolean;
  rows?: number;
  labelHint?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  isTextArea = false,
  rows = 4,
  labelHint,
  error,
}) => {
  const fullLabel = labelHint ? `${label} (${labelHint})` : label;

  // Special handling for date inputs
  const isDateInput = type === 'date';

  return (
    <TextField
      name={name}
      id={name}
      label={fullLabel}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      required={required}
      multiline={isTextArea}
      rows={isTextArea ? rows : undefined}
      error={!!error}
      helperText={error}
      fullWidth
      variant="outlined"
      InputLabelProps={isDateInput ? { shrink: true } : undefined}
      size="medium"
    />
  );
};

export default Input;
