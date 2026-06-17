import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption { value: string; label: string; }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  required,
  placeholder,
  options,
  id,
  value,
  ...props
}) => {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isEmpty = !value;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block text-[14px] font-medium text-[#6b7280] mb-[6px]" htmlFor={inputId}>
          {label}
          {required && <span className="text-[#ef4444] ml-[3px]">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          value={value}
          className={`block w-full h-[38px] pl-3 pr-8 text-[14px] bg-white border border-[#b8c1d3] rounded-[6px] outline-none transition-all appearance-none cursor-pointer focus:border-[#1e7070] focus:shadow-[0_0_0_3px_rgba(30,112,112,0.12)] ${isEmpty ? 'text-[#a0aec0]' : 'text-[#1a2030]'}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
      </div>
    </div>
  );
};
