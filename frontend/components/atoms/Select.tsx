import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: readonly Option[] | Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  disabled = false,
  required = false,
  className = '',
  label,
  id,
}) => {
  const selectClasses = [
    'w-full px-3 py-2.5 border border-transparent rounded-md shadow-lg',
    'bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#06080F]/80 focus:border-[#06080F]/80',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200',
    className,
  ].join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#01161E] text-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={selectClasses}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};