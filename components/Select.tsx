
import React from 'react';

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
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
        {labelHint && <span className="text-xs text-slate-500 ml-2">{labelHint}</span>}
      </label>
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`mt-1 block w-full rounded-md py-2 pl-3 pr-10 text-base shadow-sm focus:border-[#0A3A9A] focus:outline-none focus:ring-[#0A3A9A] sm:text-sm ${error ? 'border-red-500' : 'border-slate-300'}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p id={`${name}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
