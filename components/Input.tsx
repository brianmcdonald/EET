
import React from 'react';

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
  const commonProps = {
    name,
    id: name,
    value,
    onChange,
    placeholder,
    required,
    className: `mt-1 block w-full rounded-md shadow-sm focus:border-[#0A3A9A] focus:ring focus:ring-[#0A3A9A] focus:ring-opacity-50 transition duration-150 ease-in-out ${error ? 'border-red-500' : 'border-slate-300'}`,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : undefined,
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
        {labelHint && <span className="text-xs text-slate-500 ml-2">{labelHint}</span>}
      </label>
      {isTextArea ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input {...commonProps} type={type} />
      )}
      {error && <p id={`${name}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
