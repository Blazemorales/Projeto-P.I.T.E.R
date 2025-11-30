import React from 'react';

interface InputProps {
  type?: 'text' | 'date' | 'email' | 'password';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  label,
  id,
}) => {
  const inputClasses = [
    'w-full px-3 py-2 border border-transparent rounded-md shadow-lg',
    'bg-[#FFFFFF] text-[#06080F]',
    'placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-[#06080F] focus:border-[#06080F]',
    'focus:bg-[#FFFFFF]',
    'disabled:bg-[#FFFFFF] disabled:text-gray-500 disabled:border-gray-200',
    '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
    '[&::-webkit-outer-spin-button]:[-webkit-appearance:none] [&::-webkit-inner-spin-button]:[-webkit-appearance:none]',
    className,
  ].join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#06080F] text-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />
    </div>
  );
};